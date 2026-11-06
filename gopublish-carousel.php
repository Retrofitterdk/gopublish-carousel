<?php
/**
 * Plugin Name:       Go:Publish Carousel
 * Description:       A looping carousel block for any blocks, built on the Interactivity API.
 * Version:           0.2.7
 * Requires at least: 6.8
 * Requires PHP:      7.2
 * Author:            Retrofitter
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       gopublish-carousel
 *
 * @package           GopublishCarousel
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

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
}
add_action( 'init', 'gopublish_carousel_block_init', 9 );

/**
 * Extra registration settings that block.json can't express.
 *
 * The carousel is registered with skip_inner_blocks: render.php renders the
 * slides itself (with clones), so core shouldn't render them first into an
 * unused $content.
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
 * Prepare a slide's HTML for use as a loop clone.
 *
 * Clones are visual copies only. Their wrapper gets aria-hidden="true" (in
 * render.php), so screen readers skip them, and every focusable element inside
 * gets tabindex="-1", so keyboard users don't tab into duplicates. Mouse
 * clicks still work, because clones can be visible next to the real slides.
 *
 * @param string $html Rendered slide HTML.
 * @return string HTML with focusable elements removed from the tab order.
 */
function gopublish_carousel_clone_html( $html ) {
	$focusable_tags = array( 'A', 'AREA', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'IFRAME', 'SUMMARY', 'AUDIO', 'VIDEO', 'EMBED', 'OBJECT' );

	$processor = new WP_HTML_Tag_Processor( $html );
	while ( $processor->next_tag() ) {
		if (
			in_array( $processor->get_tag(), $focusable_tags, true ) ||
			null !== $processor->get_attribute( 'tabindex' ) ||
			null !== $processor->get_attribute( 'contenteditable' )
		) {
			$processor->set_attribute( 'tabindex', '-1' );
		}
	}
	return $processor->get_updated_html();
}
