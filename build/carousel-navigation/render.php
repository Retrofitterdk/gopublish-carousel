<?php
/**
 * Front-end markup for the Carousel Navigation block: the Previous and Next
 * buttons (see gopublish_carousel_render_navigation()).
 *
 * Justification (layout support) and width (align support) are applied by
 * WordPress to the wrapper; the buttons' behaviour comes from the carousel's
 * store (view.js).
 *
 * @package GopublishCarousel
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content (unused).
 * @var WP_Block $block      Block instance.
 */

echo gopublish_carousel_render_navigation( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered block HTML, escaped inside.
	(string) ( $block->context['gopublish-carousel/slidesId'] ?? '' ),
	get_block_wrapper_attributes(
		array(
			'class'                => 'navigation-container',
			// Hidden while all slides fit in view (nothing to navigate).
			'data-wp-bind--hidden' => '!context.canScroll',
		)
	)
);
