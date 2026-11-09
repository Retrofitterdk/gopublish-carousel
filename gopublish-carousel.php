<?php
/**
 * Plugin Name:       Go:Publish Carousel
 * Description:       A carousel block for any blocks, built on native scrolling and the Interactivity API.
 * Version:           0.3.0
 * Requires at least: 6.8
 * Requires PHP:      7.2
 * Author:            Retrofitter
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       gopublish-carousel
 * Domain Path:       /languages
 *
 * @package           GopublishCarousel
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Load the plugin's own translations from languages/.
 *
 * The plugin isn't on WordPress.org, so WordPress doesn't download
 * translations for it; they ship with the plugin instead. Translations in
 * wp-content/languages/plugins/ (e.g. from Loco Translate) still win for PHP
 * strings.
 */
function gopublish_carousel_load_textdomain() {
	load_plugin_textdomain( 'gopublish-carousel', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'gopublish_carousel_load_textdomain', 5 );

/**
 * Registers all blocks in build/ from the blocks manifest.
 *
 * `npm run build` (wp-scripts build --blocks-manifest) collects every
 * block.json in build/ into build/blocks-manifest.php, so WordPress doesn't
 * have to find and parse each block.json on every request. New blocks are
 * registered automatically.
 *
 * @see https://developer.wordpress.org/reference/functions/wp_register_block_types_from_metadata_collection/
 */
function gopublish_carousel_block_init() {
	wp_register_block_types_from_metadata_collection(
		__DIR__ . '/build',
		__DIR__ . '/build/blocks-manifest.php'
	);

	// Editor strings are translated from the JSON files in languages/.
	// Core only looks for them in wp-content/languages/, so point the editor
	// scripts to the plugin's own folder.
	$registry = WP_Block_Type_Registry::get_instance();
	foreach ( array( 'gopublish/carousel', 'gopublish/carousel-slide' ) as $block_name ) {
		$block_type = $registry->get_registered( $block_name );
		foreach ( $block_type ? $block_type->editor_script_handles : array() as $handle ) {
			wp_set_script_translations( $handle, 'gopublish-carousel', __DIR__ . '/languages' );
		}
	}
}
add_action( 'init', 'gopublish_carousel_block_init', 9 );

/**
 * The largest viewport width that counts as a small screen (mobile/tablet).
 *
 * Follows the theme's viewport settings (theme.json settings.viewport,
 * WordPress 7.1+): small screens are everything below core's @desktop
 * viewport, i.e. up to the tablet breakpoint (default 782px). Falls back to
 * 782px on older WordPress versions.
 *
 * @return string CSS length, e.g. '782px' or '48rem'.
 */
function gopublish_carousel_small_screen_max_width() {
	$max_width = '782px';

	if ( method_exists( 'WP_Theme_JSON', 'get_viewport_media_queries' ) ) {
		$queries = WP_Theme_JSON::get_viewport_media_queries(
			wp_get_global_settings( array( 'viewport' ) ),
			array( 'include_desktop' => true )
		);
		// The desktop query has the form "@media (width > 782px)".
		if ( isset( $queries['@desktop'] ) && preg_match( '/width > ([0-9.]+(?:px|em|rem))\)/', $queries['@desktop'], $matches ) ) {
			$max_width = $matches[1];
		}
	}

	return $max_width;
}

/**
 * Media query (without "@media") that matches small screens.
 *
 * @return string Media query, e.g. '(width <= 782px)'.
 */
function gopublish_carousel_small_screen_query() {
	return '(width <= ' . gopublish_carousel_small_screen_max_width() . ')';
}

/**
 * Media queries for the viewports a block can have its own styles for
 * (WordPress 7.1+), e.g. '@mobile' => '@media (width <= 480px)'.
 *
 * The same queries core uses for per-viewport block styles, so the carousel's
 * per-viewport gap switches at the same widths as its padding etc.
 *
 * @return array<string, string> Media queries keyed by viewport, or an empty
 *                               array on WordPress versions without them.
 */
function gopublish_carousel_viewport_media_queries() {
	if ( ! method_exists( 'WP_Theme_JSON', 'get_viewport_media_queries' ) ) {
		return array();
	}
	return WP_Theme_JSON::get_viewport_media_queries( wp_get_global_settings( array( 'viewport' ) ) );
}

/**
 * The CSS value for a Block spacing (blockGap) setting, for --carousel-gap.
 *
 * Converts spacing presets ('var:preset|spacing|30') to their CSS variable
 * and only accepts plain lengths or preset variables, so a crafted value
 * can't inject other CSS.
 *
 * @param mixed $gap The blockGap value from the block's style attribute.
 * @return string|null CSS value, or null if unset or invalid.
 */
function gopublish_carousel_gap_value( $gap ) {
	// A gap with separate values per axis: the space between slides is the
	// horizontal one.
	if ( is_array( $gap ) ) {
		$gap = $gap['left'] ?? null;
	}
	if ( ! is_string( $gap ) ) {
		return null;
	}
	if ( str_starts_with( $gap, 'var:preset|spacing|' ) ) {
		$gap = 'var(--wp--preset--spacing--' . _wp_to_kebab_case( substr( $gap, strrpos( $gap, '|' ) + 1 ) ) . ')';
	}
	if ( ! preg_match( '/^(?:0|\d*\.?\d+(?:px|em|rem|%|vw|vh|ch)|var\(--wp--preset--spacing--[a-z0-9-]+\))$/', $gap ) ) {
		return null;
	}
	return $gap;
}

/**
 * Add the CSS for a per-viewport gap to the carousel's stylesheet (once per
 * class, shared by carousels with the same values).
 *
 * Added with wp_add_inline_style() rather than the style engine's
 * block-supports store: with the Gutenberg plugin active, that store is
 * printed from Gutenberg's own copy of the style engine, and rules added to
 * core's store never reach the page.
 *
 * @param string                $class_name    Class on the carousel wrapper.
 * @param array<string, string> $viewport_gaps Gap values (already validated
 *                                             by gopublish_carousel_gap_value())
 *                                             keyed by media query.
 */
function gopublish_carousel_add_viewport_gap_styles( $class_name, $viewport_gaps ) {
	static $added = array();
	if ( isset( $added[ $class_name ] ) ) {
		return;
	}
	$added[ $class_name ] = true;

	$block_type = WP_Block_Type_Registry::get_instance()->get_registered( 'gopublish/carousel' );
	if ( ! $block_type || empty( $block_type->style_handles ) ) {
		return;
	}

	$css = '';
	foreach ( $viewport_gaps as $media_query => $gap ) {
		$css .= "{$media_query}{.{$class_name}{--carousel-gap:{$gap} !important;}}";
	}
	wp_add_inline_style( $block_type->style_handles[0], $css );
}

/**
 * Pass the viewport media queries to the editor script, so the editor applies
 * a per-viewport gap at exactly the same widths as the front end (read in
 * edit.js as window.gopublishCarousel.mediaQueries). Block editor settings
 * can't carry them: the editor only passes on settings it knows.
 */
function gopublish_carousel_editor_data() {
	$block_type = WP_Block_Type_Registry::get_instance()->get_registered( 'gopublish/carousel' );
	if ( ! $block_type || empty( $block_type->editor_script_handles ) ) {
		return;
	}
	$data = array( 'mediaQueries' => (object) gopublish_carousel_viewport_media_queries() );
	wp_add_inline_script(
		$block_type->editor_script_handles[0],
		'window.gopublishCarousel = ' . wp_json_encode( $data ) . ';',
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'gopublish_carousel_editor_data' );

/**
 * Add the small-screen styles to the carousel's stylesheet.
 *
 * These rules live here instead of in style.scss because a stylesheet can't
 * read the theme's viewport settings: the media query is generated from them.
 * Keep the visually hidden declarations in sync with the visually-hidden
 * mixin in style.scss.
 */
function gopublish_carousel_add_small_screen_styles() {
	$block_type = WP_Block_Type_Registry::get_instance()->get_registered( 'gopublish/carousel' );
	if ( ! $block_type || empty( $block_type->style_handles ) ) {
		return;
	}

	$query = gopublish_carousel_small_screen_query();
	$css   = <<<CSS
/* Mobile slide width (Mobile slide width setting, set as --mobile-width). */
@media {$query} {
	.wp-block-gopublish-carousel {
		--slide-width: var(--mobile-width);
	}
}
/*
 * Small touch screens: navigate by swiping. The buttons are only visually
 * hidden, so keyboard, switch and screen reader users can still reach them,
 * and they appear when anything in the carousel has keyboard focus.
 * Browsers without :has() ignore this rule and simply show the buttons.
 */
@media {$query} and (pointer: coarse) {
	.wp-block-gopublish-carousel:not(:has(:focus-visible)) .navigation-container {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
}
CSS;

	wp_add_inline_style( $block_type->style_handles[0], $css );
}
add_action( 'init', 'gopublish_carousel_add_small_screen_styles', 20 );

/**
 * Extra registration settings that block.json can't express.
 *
 * The carousel is registered with skip_inner_blocks: render.php renders the
 * slides itself (each in a slide wrapper), so core shouldn't render them first
 * into an unused $content.
 *
 * @param array  $args       Block type registration arguments.
 * @param string $block_type Block type name, e.g. 'gopublish/carousel'.
 * @return array Filtered arguments.
 */
function gopublish_carousel_block_type_args( $args, $block_type ) {
	if ( 'gopublish/carousel' === $block_type ) {
		$args['skip_inner_blocks'] = true;
	}
	return $args;
}
add_filter( 'register_block_type_args', 'gopublish_carousel_block_type_args', 10, 2 );

/**
 * Render one inner block of a dynamic block the same way core does in
 * WP_Block::render(): run the pre_render_block, render_block_data and
 * render_block_context filters, then render it with the block context it
 * inherited from its parents (e.g. postId/postType inside a Query Loop).
 *
 * @param WP_Block $inner_block  The inner block to render.
 * @param WP_Block $parent_block The block that contains it.
 * @return string Rendered HTML.
 */
function gopublish_carousel_render_inner_block( WP_Block $inner_block, WP_Block $parent_block ) {
	/** This filter is documented in wp-includes/blocks.php */
	$pre_render = apply_filters( 'pre_render_block', null, $inner_block->parsed_block, $parent_block );
	if ( null !== $pre_render ) {
		return $pre_render;
	}

	$source_block   = $inner_block->parsed_block;
	$source_context = $inner_block->context;

	/** This filter is documented in wp-includes/blocks.php */
	$inner_block->parsed_block = apply_filters( 'render_block_data', $inner_block->parsed_block, $source_block, $parent_block );

	/** This filter is documented in wp-includes/blocks.php */
	$inner_block->context = apply_filters( 'render_block_context', $inner_block->context, $inner_block->parsed_block, $parent_block );

	// Pass filtered data/context on to nested blocks.
	if ( $inner_block->context !== $source_context ) {
		$inner_block->refresh_context_dependents();
	} elseif ( $inner_block->parsed_block !== $source_block ) {
		$inner_block->refresh_parsed_block_dependents();
	}

	return $inner_block->render();
}

/**
 * Whether some HTML contains anything keyboard-focusable (links, buttons,
 * form fields, media controls, elements with a tabindex, etc.).
 *
 * Used to decide whether the carousel's scroll area needs tabindex="0": a
 * scroll area must be reachable by keyboard, which it already is through its
 * content when that content is focusable.
 *
 * @param string $html Rendered HTML.
 * @return bool Whether a focusable element was found.
 */
function gopublish_carousel_has_focusable_content( $html ) {
	$focusable_tags = array( 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'IFRAME', 'SUMMARY', 'AUDIO', 'VIDEO', 'EMBED', 'OBJECT' );

	$processor = new WP_HTML_Tag_Processor( $html );
	while ( $processor->next_tag() ) {
		$tag = $processor->get_tag();
		if (
			in_array( $tag, $focusable_tags, true ) ||
			// Links are only focusable with an href.
			( in_array( $tag, array( 'A', 'AREA' ), true ) && null !== $processor->get_attribute( 'href' ) ) ||
			null !== $processor->get_attribute( 'contenteditable' ) ||
			( null !== $processor->get_attribute( 'tabindex' ) && '-1' !== $processor->get_attribute( 'tabindex' ) )
		) {
			return true;
		}
	}
	return false;
}
