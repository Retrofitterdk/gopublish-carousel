<?php
/**
 * Front-end markup for the Carousel block.
 *
 * Renders the navigation, the live region and the slides. The slides sit in a
 * native scroll area with CSS scroll snap (style.scss); view.js (store:
 * gopublish-carousel) only adds the buttons' behaviour.
 *
 * @package GopublishCarousel
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content (unused: slides are rendered below).
 * @var WP_Block $block      Block instance.
 */

// Render each slide once, as a WP_Block, so it keeps the block context it
// inherits (e.g. postId inside a Query Loop) and the usual render filters run.
// Slides that render empty (e.g. hidden by a visibility plugin) are skipped.
$slides_html = array();
foreach ( $block->inner_blocks as $inner_block ) {
	$html = gopublish_carousel_render_inner_block( $inner_block, $block );
	if ( '' !== trim( $html ) ) {
		$slides_html[] = $html;
	}
}
$real_slides = count( $slides_html );

$columns    = (int) ( $attributes['columns'] ?? 3 );
$one_column = 1 === $columns;
$cutoff     = (bool) ( $attributes['cutoff'] ?? false );
$scroll     = (int) ( $attributes['scroll'] ?? 1 );
$classes    = 'columns-' . $columns . ( $cutoff ? ' cutoff' : ' no-cutoff' );

// Mobile slide width in percent (block.json default: 75).
$slide_width_mobile = (float) ( $attributes['mobileWidth'] ?? 75 );

// Slides to scroll can't exceed the columns (with cutoff: columns - 1).
$max_scroll = ( $cutoff && ! $one_column ) ? $columns - 1 : $columns;
$scroll     = min( $scroll, $max_scroll );

// Layout values for style.scss, which computes the slide width from them.
$style = '--columns: ' . $columns . '; --mobile-width: ' . $slide_width_mobile . '%;';

// The Block spacing setting (blockGap) sets the space between slides.
$gap = $attributes['style']['spacing']['blockGap'] ?? null;
if ( is_string( $gap ) && str_starts_with( $gap, 'var:preset|spacing|' ) ) {
	$gap = 'var(--wp--preset--spacing--' . _wp_to_kebab_case( substr( $gap, strrpos( $gap, '|' ) + 1 ) ) . ')';
}
if ( is_string( $gap ) && preg_match( '/^(?:0|\d*\.?\d+(?:px|em|rem|%|vw|vh|ch)|var\(--wp--preset--spacing--[a-z0-9-]+\))$/', $gap ) ) {
	$style .= ' --carousel-gap: ' . $gap . ';';
}

// The scroll area must be reachable by keyboard. When no slide contains
// anything focusable, the scroll area itself gets tabindex="0" (arrow keys
// then scroll it).
$track_is_focusable = $real_slides > 0;
foreach ( $slides_html as $slide_html ) {
	if ( gopublish_carousel_has_focusable_content( $slide_html ) ) {
		$track_is_focusable = false;
		break;
	}
}

// Unique ID for this carousel instance. wp_unique_id() counts up per page
// render, so the IDs are stable between page loads (unlike uniqid()).
$carousel_id = wp_unique_id( 'gopublish-carousel-' );
$slides_id   = $carousel_id . '-slides';

// Accessible names for the navigation buttons (they only contain an icon).
$label_prev = _n( 'Previous slide', 'Previous slides', $scroll, 'gopublish-carousel' );
$label_next = _n( 'Next slide', 'Next slides', $scroll, 'gopublish-carousel' );

// Carousel semantics (W3C APG carousel pattern). With a label, the carousel is
// a named region (a landmark). Without one it's a group: an unnamed region is
// ignored by screen readers, and a default "Carousel" label would be read as
// "Carousel carousel" together with the role description.
$aria_label      = trim( (string) ( $attributes['ariaLabel'] ?? '' ) );
$a11y_attributes = array(
	'role'                 => '' !== $aria_label ? 'region' : 'group',
	/* translators: Spoken by screen readers to describe the carousel block. */
	'aria-roledescription' => __( 'carousel', 'gopublish-carousel' ),
);
if ( '' !== $aria_label ) {
	$a11y_attributes['aria-label'] = $aria_label;
}

/* translators: Spoken by screen readers to describe a single slide. */
$slide_roledescription = __( 'slide', 'gopublish-carousel' );

// Interactivity API wiring:
// - data-wp-interactive: the store namespace registered in view.js.
// - data-wp-context: per-carousel state. Every directive inside this wrapper
// (buttons, future navigation/pagination blocks) reads the same context.
// - data-wp-init: runs callbacks.init once when the carousel is hydrated.
$context = array(
	'scroll'               => $scroll,
	'itemsTotal'           => $real_slides,
	// Live region text, set by view.js (empty on load, so nothing is
	// announced until the user navigates).
	'announcement'         => '',
	/* translators: Announced after moving the carousel. 1: Slide number, 2: Total number of slides. */
	'announcementTemplate' => __( 'Slide %1$d of %2$d', 'gopublish-carousel' ),
);

$wrapper_attributes = get_block_wrapper_attributes(
	$a11y_attributes + array(
		'id'                  => $carousel_id,
		'class'               => $classes,
		// Merged with any styles WordPress adds from block supports (padding,
		// min-height, etc.) into a single style attribute.
		'style'               => $style,
		'data-wp-interactive' => 'gopublish-carousel',
		'data-wp-init'        => 'callbacks.init',
		'data-wp-context'     => wp_json_encode( $context ),
	)
);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes(). ?>>
	<?php if ( $real_slides > 1 ) : ?>
		<div class="navigation-container">
			<button type="button" class="carousel-prev"
				aria-label="<?php echo esc_attr( $label_prev ); ?>"
				aria-controls="<?php echo esc_attr( $slides_id ); ?>"
				data-wp-on--click="actions.moveBack">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
					<path d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			<button type="button" class="carousel-next"
				aria-label="<?php echo esc_attr( $label_next ); ?>"
				aria-controls="<?php echo esc_attr( $slides_id ); ?>"
				data-wp-on--click="actions.moveForward">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
					<path d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</div>
		<div class="carousel-status" aria-live="polite" aria-atomic="true" data-wp-text="context.announcement"></div>
	<?php endif; ?>
	<div class="carousel-container" id="<?php echo esc_attr( $slides_id ); ?>">
		<div class="carousel-track"<?php echo $track_is_focusable ? ' tabindex="0"' : ''; ?>>
			<?php
			foreach ( $slides_html as $index => $slide_html ) :
				/* translators: 1: Slide number, 2: Total number of slides. */
				$slide_label = sprintf( __( '%1$d of %2$d', 'gopublish-carousel' ), $index + 1, $real_slides );
				?>
				<div class="carousel-slide"
					role="group"
					aria-roledescription="<?php echo esc_attr( $slide_roledescription ); ?>"
					aria-label="<?php echo esc_attr( $slide_label ); ?>"
					data-slide-index="<?php echo esc_attr( $index ); ?>">
					<?php echo $slide_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered block HTML. ?>
				</div>
				<?php
			endforeach;
			?>
		</div>
	</div>
</div>
