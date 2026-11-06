<?php
/**
 * Carousel Block Template
 * Creates a responsive, looping carousel with configurable columns and scrolling
 */

// Render each slide once, as a WP_Block, so it keeps the block context it
// inherits (e.g. postId inside a Query Loop) and the usual render filters run.
// The clones below reuse this HTML instead of rendering the slide again.
// Slides that render empty (e.g. hidden by a visibility plugin) are skipped.
$slides_html = [];
foreach ( $block->inner_blocks as $inner_block ) {
  $html = gopublish_carousel_render_inner_block( $inner_block, $block );
  if ( '' !== trim( $html ) ) {
    $slides_html[] = $html;
  }
}
$realSlides = count( $slides_html );

// Clone versions of the slides: hidden from screen readers and the tab order
// (see gopublish_carousel_clone_html()). Only built when clones are rendered.
$clones_html = [];
$columns     = $attributes['columns'] ?? 3;
$onecolumn   = $columns === 1;
$cutoff      = $attributes['cutoff'] ?? false;
$classes     = 'columns-' . $columns;
$classes    .= $cutoff ? ' cutoff' : ' no-cutoff';
$scroll      = $attributes['scroll'] ?? 1;
$loop        = true;

// Increase slide width to create partial cut-off effect
$slide_width = (100 / ($columns - 0.3)) . '%';
// If cutoff is disabled or it's a single column carousel, use normal widths
if ( ! $cutoff || $onecolumn ) {
  $slide_width = (100 / ($columns)) . '%';
}
// Mobile slide width in percent (block.json default: 75).
$slide_width_mobile = (float) ( $attributes['mobileWidth'] ?? 75 );

// Ensure scroll does not exceed columns (or columns - 1 if cutoff is enabled)
$maxscroll = $columns;
if ( $cutoff && ! $onecolumn ) {
  $maxscroll = $columns - 1;
}
if ( $scroll > $maxscroll ) {
  $scroll = $maxscroll;
}

// How many slides are visible at once (cutoff shows a partial extra slide).
$visible_desktop = ( $cutoff && ! $onecolumn ) ? $columns - 0.3 : $columns;
$visible_mobile  = 100 / max( 1, $slide_width_mobile );

// If every slide fits in view, there is nothing to scroll at that breakpoint:
// no navigation, no dragging and no clones (view.js toggles .is-static).
$static_desktop = $realSlides <= $visible_desktop + 0.01;
$static_mobile  = $realSlides <= $visible_mobile + 0.01;
$is_scrollable  = ! ( $static_desktop && $static_mobile );

// Clones for seamless looping. Clones repeat the slides cyclically, so the
// loop also works with fewer slides than columns.
// - Leading: enough to move back by `scroll` from the first slide.
// - Trailing: enough to fill the view after moving past the last slide.
$leading_clones  = 0;
$trailing_clones = 0;
if ( $loop && $is_scrollable && $realSlides > 0 ) {
  $leading_clones  = $columns;
  $visible_max     = max(
    $static_desktop ? 0 : ceil( $visible_desktop ),
    $static_mobile ? 0 : ceil( $visible_mobile )
  );
  $trailing_clones = (int) $visible_max + $scroll - 1;
  $clones_html     = array_map( 'gopublish_carousel_clone_html', $slides_html );
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
$a11y_attributes = [
  'role'                 => '' !== $aria_label ? 'region' : 'group',
  /* translators: Spoken by screen readers to describe the carousel block. */
  'aria-roledescription' => __( 'carousel', 'gopublish-carousel' ),
];
if ( '' !== $aria_label ) {
  $a11y_attributes['aria-label'] = $aria_label;
}

/* translators: Spoken by screen readers to describe a single slide. */
$slide_roledescription = __( 'slide', 'gopublish-carousel' );

// Interactivity API wiring:
// - data-wp-interactive: the store namespace registered in view.js.
// - data-wp-context: per-carousel state. Every directive inside this wrapper
//   (buttons, future navigation/pagination blocks) reads the same context.
// - data-wp-init: runs callbacks.init once when the carousel is hydrated.
$wrapper_attributes = get_block_wrapper_attributes( $a11y_attributes + [
  'id' => $carousel_id,
  'class' => $classes,
  // Merged with any styles WordPress adds from block supports (padding,
  // min-height, etc.) into a single style attribute.
  'style' => '--mobile-width: ' . $slide_width_mobile . '%;',
  'data-wp-interactive' => 'gopublish-carousel',
  'data-wp-init' => 'callbacks.init',
  'data-wp-context' => wp_json_encode([
    // The real slides start after the leading clones.
    'currentIndex'     => $leading_clones,
    'isTransitioning'  => false,
    'itemsPerView'     => $columns,
    'scroll'           => $scroll,
    'cutoff'           => $cutoff,
    'loop'             => $loop,
    'itemsTotal'       => $realSlides,
    'clonesCount'      => $leading_clones,
    'slideWidthMobile' => $slide_width_mobile,
    'staticDesktop'    => $static_desktop,
    'staticMobile'     => $static_mobile,
    // Live region text, set by view.js after each move (empty on load, so
    // nothing is announced until the user navigates).
    'announcement'     => '',
    /* translators: Announced after moving the carousel. 1: Slide number, 2: Total number of slides. */
    'announcementTemplate' => __( 'Slide %1$d of %2$d', 'gopublish-carousel' ),
  ])
] );
?>
<div <?php echo $wrapper_attributes; ?>>
  <?php if ( $is_scrollable ) : ?>
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
    <div class="carousel-track">
      <?php 
      // Leading clones: the slides that come before slide 0 in an endless
      // loop, i.e. the last slides (repeated if there are fewer than needed).
      for ( $p = 0; $p < $leading_clones; $p++ ) :
        $i = ( ( $p - $leading_clones ) % $realSlides + $realSlides ) % $realSlides; ?>
            <div class="carousel-slide carousel-clone" aria-hidden="true" ontouchstart=""
                 data-slide-index="<?php echo $i; ?>"
                 style="width: <?php echo $slide_width; ?>">
              <?php echo $clones_html[ $i ]; ?>
            </div>
      <?php endfor;

      // Render actual slides 
      foreach ( $slides_html as $index => $slide_html ) : ?>
      <!-- ontouchstart is essential for ios -->
        <div class="carousel-slide" ontouchstart=""
            role="group"
            aria-roledescription="<?php echo esc_attr( $slide_roledescription ); ?>"
            aria-label="<?php
              /* translators: 1: Slide number, 2: Total number of slides. */
              echo esc_attr( sprintf( __( '%1$d of %2$d', 'gopublish-carousel' ), $index + 1, $realSlides ) );
            ?>"
            data-slide-index="<?php echo $index; ?>"
            style="width: <?php echo $slide_width; ?>">
          <?php echo $slide_html; ?>
        </div>
      <?php endforeach;
      
      // Trailing clones: the slides that come after the last slide in an
      // endless loop, i.e. the first slides (repeated if needed).
      for ( $p = 0; $p < $trailing_clones; $p++ ) :
        $i = $p % $realSlides; ?>
            <div class="carousel-slide carousel-clone" aria-hidden="true"
                 data-slide-index="<?php echo $i; ?>"
                 style="width: <?php echo $slide_width; ?>">
              <?php echo $clones_html[ $i ]; ?>
            </div>
      <?php endfor;
      ?>
    </div>
  </div>
</div>