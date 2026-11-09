<?php
/**
 * Front-end markup for the Carousel Pagination block: one dot (button) per
 * page of the carousel.
 *
 * A dot is rendered for every slide, the most pages any layout can have. The
 * Carousel's context holds a list of dots (current, hidden, label), which
 * view.js keeps up to date for the current layout and scroll position; each
 * dot is bound to its entry. Justification (layout support) and width (align
 * support) are applied by WordPress to the wrapper.
 *
 * @package GopublishCarousel
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content (unused).
 * @var WP_Block $block      Block instance.
 */

$total     = (int) ( $block->context['gopublish-carousel/itemsTotal'] ?? 0 );
$slides_id = (string) ( $block->context['gopublish-carousel/slidesId'] ?? '' );

// Nothing to choose between.
if ( $total < 2 ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                => 'carousel-pagination',
		'role'                 => 'group',
		'aria-label'           => __( 'Choose slide', 'gopublish-carousel' ),
		// Colour and size settings, for the dots.
		'style'                => gopublish_carousel_pagination_styles( $attributes ),
		// Hidden while all slides fit in view (nothing to choose).
		'data-wp-bind--hidden' => '!context.canScroll',
	)
);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes(). ?>>
	<?php for ( $dot = 0; $dot < $total; $dot++ ) : ?>
		<button type="button" class="carousel-dot"
			data-dot="<?php echo esc_attr( $dot ); ?>"
			<?php if ( '' !== $slides_id ) : ?>
				aria-controls="<?php echo esc_attr( $slides_id ); ?>"
			<?php endif; ?>
			data-wp-bind--aria-label="<?php echo esc_attr( "context.dots.{$dot}.label" ); ?>"
			data-wp-bind--aria-current="<?php echo esc_attr( "context.dots.{$dot}.current" ); ?>"
			data-wp-bind--hidden="<?php echo esc_attr( "context.dots.{$dot}.hidden" ); ?>"
			data-wp-on--click="actions.goToDot"></button>
	<?php endfor; ?>
</div>
