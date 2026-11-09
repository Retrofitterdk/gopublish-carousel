<?php
/**
 * Plugin Name:       Go:Publish Carousel
 * Description:       A carousel block for any blocks, built on native scrolling and the Interactivity API.
 * Version:           0.4.0
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
	foreach ( array( 'gopublish/carousel', 'gopublish/carousel-slides', 'gopublish/carousel-slide', 'gopublish/carousel-navigation', 'gopublish/carousel-pagination' ) as $block_name ) {
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
 * Media queries for the viewports a block can have its own styles for,
 * e.g. '@mobile' => '@media (width <= 480px)'.
 *
 * The same queries core uses for per-viewport block styles (WordPress 7.1+,
 * following the theme's settings.viewport), so the carousel's per-viewport
 * layout and gap switch at the same widths as its padding etc. Older
 * WordPress versions get core's default breakpoints.
 *
 * @return array<string, string> Media queries keyed by viewport.
 */
function gopublish_carousel_viewport_media_queries() {
	if ( ! method_exists( 'WP_Theme_JSON', 'get_viewport_media_queries' ) ) {
		return array(
			'@mobile' => '@media (width <= 480px)',
			'@tablet' => '@media (480px < width <= 782px)',
		);
	}
	return WP_Theme_JSON::get_viewport_media_queries( wp_get_global_settings( array( 'viewport' ) ) );
}

/**
 * The carousel's layout (columns, cutoff effect, slides to scroll) for the
 * base and each viewport.
 *
 * The block attributes columns, cutoff and scroll are the base values, used
 * on every screen size unless a viewport overrides them in the viewports
 * attribute, e.g. { "@tablet": { "columns": 2 }, "@mobile": { "columns": 1 } }.
 * Each viewport inherits from the next larger one: mobile from tablet, tablet
 * from the base. Keep in sync with getLayouts() in edit.js.
 *
 * Carousels from before per-viewport layouts (no viewports attribute) get
 * tablet min(2, columns) and mobile 1 column, both with the cutoff effect;
 * on large screens, the cutoff effect stays off with 1 column, where it had
 * no effect before.
 *
 * @param array $attributes Block attributes.
 * @return array<string, array> Layouts keyed by 'base', '@tablet' and
 *                              '@mobile', each with columns, cutoff, scroll,
 *                              visible (slides across, e.g. 2.7 with cutoff)
 *                              and gaps (gaps within the visible width).
 */
function gopublish_carousel_layouts( $attributes ) {
	$base = array(
		'columns' => $attributes['columns'] ?? 3,
		'cutoff'  => $attributes['cutoff'] ?? true,
		'scroll'  => $attributes['scroll'] ?? 1,
	);

	$viewports = $attributes['viewports'] ?? null;
	if ( ! is_array( $viewports ) ) {
		if ( 1 === (int) $base['columns'] ) {
			$base['cutoff'] = false;
		}
		$viewports = array(
			'@tablet' => array(
				'columns' => min( 2, (int) $base['columns'] ),
				'cutoff'  => true,
			),
			'@mobile' => array(
				'columns' => 1,
				'cutoff'  => true,
			),
		);
	}

	$layouts = array( 'base' => gopublish_carousel_complete_layout( $base ) );
	$current = $base;
	foreach ( array( '@tablet', '@mobile' ) as $viewport ) {
		$override = is_array( $viewports[ $viewport ] ?? null ) ? $viewports[ $viewport ] : array();
		foreach ( array( 'columns', 'cutoff', 'scroll' ) as $key ) {
			if ( isset( $override[ $key ] ) ) {
				$current[ $key ] = $override[ $key ];
			}
		}
		$layouts[ $viewport ] = gopublish_carousel_complete_layout( $current );
	}
	return $layouts;
}

/**
 * Sanitize a layout and add the values the CSS needs.
 *
 * With the cutoff effect, 2+ columns trim the last visible slide (columns
 * - 0.3 slides), and 1 column lets the next slide peek in (1.3 slides). The
 * amount (0.3) is the --cutoff-amount custom property, which themes can
 * change: style.scss computes the slide width from trim/peek; visible and
 * gaps here use the default, for the server's can-scroll guess. Slides to
 * scroll is at most the number of fully visible slides.
 *
 * @param array $layout Columns, cutoff and scroll.
 * @return array The layout, with trim, peek, visible and gaps added.
 */
function gopublish_carousel_complete_layout( $layout ) {
	$columns = max( 1, min( 6, (int) $layout['columns'] ) );
	$cutoff  = (bool) $layout['cutoff'];
	$visible = $columns;
	if ( $cutoff ) {
		$visible = $columns > 1 ? $columns - 0.3 : 1.3;
	}
	$max_scroll = ( $cutoff && $columns > 1 ) ? $columns - 1 : $columns;

	return array(
		'columns' => $columns,
		'cutoff'  => $cutoff,
		'scroll'  => max( 1, min( $max_scroll, (int) $layout['scroll'] ) ),
		'trim'    => $cutoff && $columns > 1,
		'peek'    => $cutoff && 1 === $columns,
		'visible' => $visible,
		'gaps'    => (int) ceil( $visible ) - 1,
	);
}

/**
 * CSS custom properties for a layout (see gopublish_carousel_layouts()).
 *
 * @param array $layout A completed layout.
 * @return array<string, string> Custom properties for style.scss.
 */
function gopublish_carousel_layout_properties( $layout ) {
	return array(
		'--columns'          => (string) $layout['columns'],
		'--cutoff-trim'      => $layout['trim'] ? '1' : '0',
		'--cutoff-peek'      => $layout['peek'] ? '1' : '0',
		'--slides-to-scroll' => (string) $layout['scroll'],
	);
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
	// A unitless 0 is invalid in calc() additions (the slide width formula).
	return '0' === $gap ? '0px' : $gap;
}

/**
 * Add per-viewport CSS custom properties to the carousel's stylesheet (once
 * per class, shared by carousels with the same values). They're !important,
 * so they win over the base values in the wrapper's inline style.
 *
 * Added with wp_add_inline_style() rather than the style engine's
 * block-supports store: with the Gutenberg plugin active, that store is
 * printed from Gutenberg's own copy of the style engine, and rules added to
 * core's store never reach the page.
 *
 * @param string $class_name Class on the carousel wrapper.
 * @param array  $rules      Custom properties keyed by media query. Values
 *                           must already be safe CSS (numbers, or gaps
 *                           validated by gopublish_carousel_gap_value()).
 */
function gopublish_carousel_add_viewport_styles( $class_name, $rules ) {
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
	foreach ( $rules as $media_query => $properties ) {
		$declarations = '';
		foreach ( $properties as $property => $value ) {
			$declarations .= "{$property}:{$value} !important;";
		}
		$css .= "{$media_query}{.{$class_name}{{$declarations}}}";
	}
	wp_add_inline_style( $block_type->style_handles[0], $css );
}

/**
 * Pass the viewport media queries to the editor script, so the editor applies
 * per-viewport layouts and gaps at exactly the same widths as the front end (read in
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
 * The Carousel and Carousel Slides blocks are registered with
 * skip_inner_blocks: their render.php renders the inner blocks itself (the
 * slides each in a slide wrapper), so core shouldn't render them first into an
 * unused $content.
 *
 * @param array  $args       Block type registration arguments.
 * @param string $block_type Block type name, e.g. 'gopublish/carousel'.
 * @return array Filtered arguments.
 */
function gopublish_carousel_block_type_args( $args, $block_type ) {
	if ( in_array( $block_type, array( 'gopublish/carousel', 'gopublish/carousel-slides' ), true ) ) {
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

/**
 * Render a carousel's slides: the scroll area (.carousel-track) inside its
 * container, with each slide in a labelled wrapper ("2 of 9").
 *
 * Used by the Carousel Slides block, and by the Carousel itself for carousels
 * from before 0.5.0, which have the slides directly inside. The scroll area
 * gets data-carousel-items with the number of slides, which the Carousel
 * reads (see gopublish_carousel_count_slides()).
 *
 * @param WP_Block[] $slide_blocks         The Carousel Slide blocks.
 * @param WP_Block   $parent_block         The block that contains them.
 * @param string     $container_attributes Attributes for the container
 *                                         element, already escaped.
 * @return string HTML, or an empty string if no slide renders anything.
 */
function gopublish_carousel_render_slides( $slide_blocks, WP_Block $parent_block, $container_attributes ) {
	// Render each slide once, as a WP_Block, so it keeps the block context it
	// inherits (e.g. postId inside a Query Loop) and the usual render filters
	// run. Slides that render empty (e.g. hidden by a visibility plugin) are
	// skipped.
	$slides_html = array();
	foreach ( $slide_blocks as $slide_block ) {
		$html = gopublish_carousel_render_inner_block( $slide_block, $parent_block );
		if ( '' !== trim( $html ) ) {
			$slides_html[] = $html;
		}
	}
	$total = count( $slides_html );
	if ( 0 === $total ) {
		return '';
	}

	// The scroll area must be reachable by keyboard. When no slide contains
	// anything focusable, the scroll area itself gets tabindex="0" (arrow keys
	// then scroll it).
	$track_is_focusable = true;
	foreach ( $slides_html as $slide_html ) {
		if ( gopublish_carousel_has_focusable_content( $slide_html ) ) {
			$track_is_focusable = false;
			break;
		}
	}

	/* translators: Spoken by screen readers to describe a single slide. */
	$slide_roledescription = __( 'slide', 'gopublish-carousel' );

	ob_start();
	?>
	<div <?php echo $container_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by the caller. ?>>
		<div class="carousel-track"<?php echo $track_is_focusable ? ' tabindex="0"' : ''; ?>
			data-carousel-items="<?php echo esc_attr( $total ); ?>"
			data-wp-init="callbacks.initTrack"
			data-wp-on-async--scroll="callbacks.onScroll"
			data-wp-on--scrollend="callbacks.onScrollEnd">
			<?php
			foreach ( $slides_html as $index => $slide_html ) :
				/* translators: 1: Slide number, 2: Total number of slides. */
				$slide_label = sprintf( __( '%1$d of %2$d', 'gopublish-carousel' ), $index + 1, $total );
				?>
				<div class="carousel-slide"
					role="group"
					aria-roledescription="<?php echo esc_attr( $slide_roledescription ); ?>"
					aria-label="<?php echo esc_attr( $slide_label ); ?>">
					<?php echo $slide_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered block HTML. ?>
				</div>
				<?php
			endforeach;
			?>
		</div>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * The number of slides in a carousel's rendered inner blocks: read from the
 * first scroll area (gopublish_carousel_render_slides()), which is the
 * carousel's own; nested carousels come later in the HTML.
 *
 * @param string $html Rendered inner blocks.
 * @return int Number of slides (0 without a scroll area).
 */
function gopublish_carousel_count_slides( $html ) {
	$processor = new WP_HTML_Tag_Processor( $html );
	while ( $processor->next_tag() ) {
		$items = $processor->get_attribute( 'data-carousel-items' );
		if ( null !== $items ) {
			return (int) $items;
		}
	}
	return 0;
}

/**
 * Render a carousel's navigation: the Previous and Next buttons.
 *
 * Used by the Carousel Navigation block, and by the Carousel itself for
 * carousels from before 0.5.0. Hidden (hidden attribute) while all slides fit
 * in view; the Interactivity API keeps that and the buttons' disabled state
 * up to date (context of the surrounding carousel, see view.js).
 *
 * @param string $slides_id            ID of the carousel's slides, for
 *                                     aria-controls.
 * @param string $container_attributes Attributes for the container element,
 *                                     already escaped.
 * @return string HTML.
 */
function gopublish_carousel_render_navigation( $slides_id, $container_attributes ) {
	// Accessible names for the buttons (they only contain an icon). Always
	// singular, like the W3C example: how many slides a button moves can
	// differ per viewport.
	$buttons = array(
		array(
			'class'    => 'carousel-prev',
			'label'    => __( 'Previous slide', 'gopublish-carousel' ),
			'disabled' => 'context.prevDisabled',
			'action'   => 'actions.moveBack',
		),
		array(
			'class'    => 'carousel-next',
			'label'    => __( 'Next slide', 'gopublish-carousel' ),
			'disabled' => 'context.nextDisabled',
			'action'   => 'actions.moveForward',
		),
	);

	ob_start();
	?>
	<div <?php echo $container_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by the caller. ?>>
		<?php foreach ( $buttons as $button ) : ?>
			<button type="button" class="<?php echo esc_attr( $button['class'] ); ?>"
				aria-label="<?php echo esc_attr( $button['label'] ); ?>"
				<?php if ( '' !== $slides_id ) : ?>
					aria-controls="<?php echo esc_attr( $slides_id ); ?>"
				<?php endif; ?>
				data-wp-bind--aria-disabled="<?php echo esc_attr( $button['disabled'] ); ?>"
				data-wp-on--click="<?php echo esc_attr( $button['action'] ); ?>">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
					<path d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		<?php endforeach; ?>
	</div>
	<?php
	return ob_get_clean();
}
