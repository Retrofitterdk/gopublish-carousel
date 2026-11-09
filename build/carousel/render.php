<?php
/**
 * Front-end markup for the Carousel block.
 *
 * Renders the live region and the inner blocks: Carousel Navigation and
 * Carousel Slides (the slides in a native scroll area with CSS scroll snap,
 * see style.scss). view.js (store: gopublish-carousel) adds the buttons'
 * behaviour and keeps the state in the context up to date (can scroll, at
 * start/end, the announcement).
 *
 * @package GopublishCarousel
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content (unused: inner blocks are rendered below).
 * @var WP_Block $block      Block instance.
 */

// Unique ID for this carousel instance. wp_unique_id() counts up per page
// render, so the IDs are stable between page loads (unlike uniqid()).
$carousel_id = wp_unique_id( 'gopublish-carousel-' );
$slides_id   = $carousel_id . '-slides';

// The inner blocks: Carousel Slides (the scroll area with the slides),
// Carousel Navigation and Carousel Pagination. They get the slides' ID and
// the number of slides through the block context. Carousels from before 0.5.0
// have the slides directly inside; they're rendered as before: the navigation
// above the slides.
$is_legacy = false;
foreach ( $block->inner_blocks as $inner_block ) {
	if ( 'gopublish/carousel-slide' === $inner_block->name ) {
		$is_legacy = true;
		break;
	}
}
if ( $is_legacy ) {
	$inner_html  = gopublish_carousel_render_navigation( $slides_id, 'class="navigation-container" data-wp-bind--hidden="!context.canScroll"' );
	$inner_html .= gopublish_carousel_render_slides( $block->inner_blocks, $block, 'class="carousel-container" id="' . esc_attr( $slides_id ) . '"' );
	$real_slides = gopublish_carousel_count_slides( $inner_html );
} else {
	// Carousel Slides first: the other blocks need the number of slides.
	$parts = array();
	foreach ( $block->inner_blocks as $index => $inner_block ) {
		if ( 'gopublish/carousel-slides' === $inner_block->name ) {
			$inner_block->context['gopublish-carousel/slidesId'] = $slides_id;

			$parts[ $index ] = gopublish_carousel_render_inner_block( $inner_block, $block );
		}
	}
	$real_slides = gopublish_carousel_count_slides( implode( '', $parts ) );
	foreach ( $block->inner_blocks as $index => $inner_block ) {
		if ( ! isset( $parts[ $index ] ) ) {
			$inner_block->context['gopublish-carousel/slidesId']   = $slides_id;
			$inner_block->context['gopublish-carousel/itemsTotal'] = $real_slides;

			$parts[ $index ] = gopublish_carousel_render_inner_block( $inner_block, $block );
		}
	}
	ksort( $parts );
	$inner_html = implode( '', $parts );
}

// No slides (or all hidden): render nothing, rather than an empty carousel
// that screen readers would still announce.
if ( 0 === $real_slides ) {
	return;
}

// Layout per viewport: columns, cutoff effect and slides to scroll for the
// base (all screen sizes) and the overrides for tablet and mobile.
$layouts = gopublish_carousel_layouts( $attributes );
$base    = $layouts['base'];
$rewind  = (bool) ( $attributes['rewind'] ?? true );
$classes = 'columns-' . $base['columns'] . ( $base['cutoff'] ? ' cutoff' : ' no-cutoff' );

// Base layout values for style.scss, which computes the slide width from them.
$style = '';
foreach ( gopublish_carousel_layout_properties( $base ) as $property => $value ) {
	$style .= $property . ': ' . $value . '; ';
}

// The Block spacing setting (blockGap) sets the space between slides.
$gap = gopublish_carousel_gap_value( $attributes['style']['spacing']['blockGap'] ?? null );
if ( null !== $gap ) {
	$style .= '--carousel-gap: ' . $gap . ';';
}

// Per viewport: the layout, and Block spacing (WordPress 7.1+, e.g. a smaller
// gap on mobile; core doesn't output blockGap for blocks without layout
// support). Added the way core adds other per-viewport styles: a class shared
// by carousels with the same values, with rules that win over the inline base
// values (see gopublish_carousel_add_viewport_styles()).
$viewport_rules = array();
foreach ( gopublish_carousel_viewport_media_queries() as $viewport => $media_query ) {
	$properties = isset( $layouts[ $viewport ] ) ? gopublish_carousel_layout_properties( $layouts[ $viewport ] ) : array();

	$viewport_gap = gopublish_carousel_gap_value( $attributes['style'][ $viewport ]['spacing']['blockGap'] ?? null );
	if ( null !== $viewport_gap ) {
		$properties['--carousel-gap'] = $viewport_gap;
	}
	if ( $properties ) {
		$viewport_rules[ $media_query ] = $properties;
	}
}
if ( $viewport_rules ) {
	$viewport_class = wp_unique_id_from_values( $viewport_rules, 'gopublish-carousel-' );
	$classes       .= ' ' . $viewport_class;
	gopublish_carousel_add_viewport_styles( $viewport_class, $viewport_rules );
}

// Best guess whether there is anything to scroll, so the server-rendered
// markup is usually right before view.js measures it: more slides than fit
// across in any of the layouts. The arrows are only hidden on load when the
// slides fit on every screen size.
$fewest_visible = min( array_column( $layouts, 'visible' ) );
$can_scroll     = $real_slides > 1 && $real_slides > $fewest_visible;

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

// Interactivity API wiring:
// - data-wp-interactive: the store namespace registered in view.js.
// - data-wp-context: per-carousel state. Every directive inside this wrapper
// (buttons, future navigation/pagination blocks) reads the same context.
// - data-wp-bind/data-wp-class: show the state below in the markup. WordPress
// also applies them when rendering, so the HTML matches the initial state.
// - data-wp-init/data-wp-on: on the scroll area, keep the state up to date.
$context = array(
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

// Carousel Pagination: a dot per page (see getPages() in pages.js), bound to
// context.dots.N in its markup. Rendered with a guess from the base layout
// (every slide to scroll a page); view.js measures the real layout on load.
$has_pagination = false;
foreach ( $block->inner_blocks as $inner_block ) {
	if ( 'gopublish/carousel-pagination' === $inner_block->name ) {
		$has_pagination = true;
		break;
	}
}
if ( $has_pagination ) {
	$fully_visible = $base['peek'] ? 1 : (int) ceil( $base['visible'] );
	$positions     = max( 1, $real_slides - $fully_visible + 1 );
	$page_count    = 1 + (int) ceil( ( $positions - 1 ) / $base['scroll'] );
	/* translators: Label of a pagination dot. %d: Number of the first slide it scrolls to. */
	$context['dotLabelTemplate'] = __( 'Go to slide %d', 'gopublish-carousel' );
	$context['dots']             = array();
	for ( $dot = 0; $dot < $real_slides; $dot++ ) {
		$context['dots'][] = array(
			'current' => 0 === $dot,
			'hidden'  => $dot >= $page_count,
			'label'   => sprintf( $context['dotLabelTemplate'], min( $dot * $base['scroll'], $positions - 1 ) + 1 ),
		);
	}
}

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
		<div class="carousel-status" aria-live="polite" aria-atomic="true" data-wp-text="context.announcement"></div>
	<?php endif; ?>
	<?php echo $inner_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered block HTML. ?>
</div>
