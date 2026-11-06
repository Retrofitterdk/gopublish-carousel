<?php
/**
 * Plugin Name:       Go:Publish Carousel
 * Description:       A carousel for blocks.
 * Version:           0.2.4
 * Requires at least: 6.6
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
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function gopublish_carousel_block_init() {
	// Register main carousel block.
	// skip_inner_blocks: render.php renders the slides itself (with clones),
	// so core shouldn't render them first into an unused $content.
	register_block_type_from_metadata(
		__DIR__ . '/build/carousel',
		array( 'skip_inner_blocks' => true )
	);

	// Register custom slide inner block.
	register_block_type_from_metadata( __DIR__ . '/build/carousel-slide' );
}
add_action( 'init', 'gopublish_carousel_block_init', 9 );

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

	// Pass filtered data/context on to nested blocks (WordPress 6.8+).
	if ( method_exists( $inner_block, 'refresh_context_dependents' ) ) {
		if ( $inner_block->context !== $source_context ) {
			$inner_block->refresh_context_dependents();
		} elseif ( $inner_block->parsed_block !== $source_block ) {
			$inner_block->refresh_parsed_block_dependents();
		}
	}

	return $inner_block->render();
}
