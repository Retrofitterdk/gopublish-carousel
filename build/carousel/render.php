<?php
/**
 * Front-end markup for the Carousel block.
 *
 * Renders the navigation, the live region and the slides. The slides sit in a
 * native scroll area with CSS scroll snap (style.scss); view.js (store:
 * gopublish-carousel) adds the buttons' behaviour and keeps the state in the
 * context up to date (can scroll, at start/end, the announcement).
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

// No slides (or all hidden): render nothing, rather than an empty carousel
// that screen readers would still announce.
if ( 0 === $real_slides ) {
	return;
}

$columns    = (int) ( $attributes['columns'] ?? 3 );
$one_column = 1 === $columns;
$cutoff     = (bool) ( $attributes['cutoff'] ?? false );
$rewind     = (bool) ( $attributes['rewind'] ?? true );
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

// Best guess whether there is anything to scroll, so the server-rendered
// markup is usually right before view.js measures it: more slides than fit
// across on large screens (columns, or columns - 0.3 with cutoff) or on small
// screens (Mobile slide width). The arrows are only hidden on load when the
// slides fit on every screen size.
$visible_columns = ( $cutoff && ! $one_column ) ? $columns - 0.3 : $columns;
$can_scroll      = $real_slides > 1 && ( $real_slides > $visible_columns || $real_slides * $slide_width_mobile > 100 );

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
// - data-wp-bind/data-wp-class: show the state below in the markup. WordPress
// also applies them when rendering, so the HTML matches the initial state.
// - data-wp-init/data-wp-on: on the scroll area, keep the state up to date.
$context = array(
	'scroll'               => $scroll,
	'itemsTotal'           => $real_slides,
	// Rewind at the end: Next on the last slide goes back to the first, and
	// Previous on the first goes to the last. Off: the buttons are disabled
	// at the ends.
	'rewind'               => $rewind,
	// Whether the slides overflow, i.e. the arrows are useful (view.js
	// re-measures this whenever the scroll area changes size).
	'canScroll'            => $can_scroll,
	// Scroll position: at the first or the last scroll position.
	'atStart'              => true,
	'atEnd'                => ! $can_scroll,
	// The buttons' aria-disabled: at the start/end with Rewind off (kept up
	// to date by view.js together with atStart/atEnd).
	'prevDisabled'         => ! $rewind,
	'nextDisabled'         => ! $rewind && ! $can_scroll,
	// Set by the buttons, so the next scroll end is announced.
	'announcePending'      => false,
	// Live region text, set by view.js (empty on load, so nothing is
	// announced until the user navigates).
	'announcement'         => '',
	/* translators: Announced after moving the carousel when one slide is fully visible. 1: Slide number, 2: Total number of slides. */
	'announcementTemplate' => __( 'Slide %1$d of %2$d', 'gopublish-carousel' ),
	/* translators: Announced after moving the carousel when several slides are fully visible. 1: First visible slide, 2: Last visible slide, 3: Total number of slides. */
	'announcementRange'    => __( 'Slides %1$d to %2$d of %3$d', 'gopublish-carousel' ),
);

$wrapper_attributes = get_block_wrapper_attributes(
	$a11y_attributes + array(
		'id'                           => $carousel_id,
		'class'                        => $classes,
		// Merged with any styles WordPress adds from block supports (padding,
		// min-height, etc.) into a single style attribute.
		'style'                        => $style,
		'data-wp-interactive'          => 'gopublish-carousel',
		'data-wp-context'              => wp_json_encode( $context ),
		'data-wp-class--is-scrollable' => 'context.canScroll',
		'data-wp-class--is-at-start'   => 'context.atStart',
		'data-wp-class--is-at-end'     => 'context.atEnd',
	)
);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes(). ?>>
	<?php if ( $real_slides > 1 ) : ?>
		<div class="navigation-container" data-wp-bind--hidden="!context.canScroll">
			<button type="button" class="carousel-prev"
				aria-label="<?php echo esc_attr( $label_prev ); ?>"
				aria-controls="<?php echo esc_attr( $slides_id ); ?>"
				data-wp-bind--aria-disabled="context.prevDisabled"
				data-wp-on--click="actions.moveBack">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
					<path d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			<button type="button" class="carousel-next"
				aria-label="<?php echo esc_attr( $label_next ); ?>"
				aria-controls="<?php echo esc_attr( $slides_id ); ?>"
				data-wp-bind--aria-disabled="context.nextDisabled"
				data-wp-on--click="actions.moveForward">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
					<path d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</div>
		<div class="carousel-status" aria-live="polite" aria-atomic="true" data-wp-text="context.announcement"></div>
	<?php endif; ?>
	<div class="carousel-container" id="<?php echo esc_attr( $slides_id ); ?>">
		<div class="carousel-track"<?php echo $track_is_focusable ? ' tabindex="0"' : ''; ?>
			data-wp-init="callbacks.initTrack"
			data-wp-on-async--scroll="callbacks.onScroll"
			data-wp-on--scrollend="callbacks.onScrollEnd">
			<?php
			foreach ( $slides_html as $index => $slide_html ) :
				/* translators: 1: Slide number, 2: Total number of slides. */
				$slide_label = sprintf( __( '%1$d of %2$d', 'gopublish-carousel' ), $index + 1, $real_slides );
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
</div>
