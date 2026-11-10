<?php
/**
 * Front-end markup for the Carousel Slides block: the carousel's scroll area
 * with the slides (see gopublish_carousel_render_slides()).
 *
 * The Carousel passes the ID that its navigation refers to (aria-controls)
 * through the block context.
 *
 * @package GopublishCarousel
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content (unused: slides are rendered below).
 * @var WP_Block $block      Block instance.
 */

$slides_id = $block->context['gopublish-carousel/slidesId'] ?? wp_unique_id( 'gopublish-carousel-slides-' );

echo gopublish_carousel_render_slides( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered block HTML, escaped inside.
	$block->inner_blocks,
	$block,
	get_block_wrapper_attributes(
		array(
			'class' => 'carousel-container',
			'id'    => $slides_id,
		)
	)
);
