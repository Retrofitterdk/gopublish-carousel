<?php
/**
 * Carousel Block Template
 * Creates a responsive, looping carousel with configurable columns and scrolling
 */

// Ensure innerBlocks is defined to avoid warnings in the editor
$innerBlocks = $block->parsed_block['innerBlocks'] ?? [];
$realSlides  = count($innerBlocks);
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

// Calculate unique ID for this carousel instance
$carousel_id = 'carousel-' . uniqid();

// Interactivity API wiring:
// - data-wp-interactive: the store namespace registered in view.js.
// - data-wp-context: per-carousel state. Every directive inside this wrapper
//   (buttons, future navigation/pagination blocks) reads the same context.
// - data-wp-init: runs callbacks.init once when the carousel is hydrated.
$wrapper_attributes = get_block_wrapper_attributes([
  'id' => $carousel_id,
  'class' => $classes,
  // Merged with any styles WordPress adds from block supports (padding,
  // min-height, etc.) into a single style attribute.
  'style' => '--mobile-width: ' . $slide_width_mobile . '%;',
  'data-wp-interactive' => 'gopublish-carousel',
  'data-wp-init' => 'callbacks.init',
  'data-wp-context' => wp_json_encode([
    // With looping, the real slides start after the leading clones.
    'currentIndex'     => $loop ? $columns : 0,
    'isTransitioning'  => false,
    'itemsPerView'     => $columns,
    'scroll'           => $scroll,
    'cutoff'           => $cutoff,
    'loop'             => $loop,
    'itemsTotal'       => $realSlides,
    'clonesCount'      => $columns,
    'slideWidthMobile' => $slide_width_mobile,
  ])
]);
?>
<div <?php echo $wrapper_attributes; ?>>
  <div class="navigation-container">
    <button class="carousel-prev"
      data-wp-on--click="actions.moveBack">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332" stroke="#D9F99D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="carousel-next"
      data-wp-on--click="actions.moveForward">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332" stroke="#D9F99D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
  <div class="carousel-container" id="<?php echo $carousel_id; ?>">
    <div class="carousel-track">
      <?php 
      // Clone last slides at the beginning for seamless looping
      if ( $loop && $realSlides > 0 ) :
        $start = max(0, $realSlides - $columns);
        for ( $i = $start; $i < $realSlides; $i++ ) :
          if ( isset( $innerBlocks[$i] ) ) : ?>
            <div class="carousel-slide carousel-clone" ontouchstart=""
                 data-slide-index="<?php echo $i; ?>"
                 style="width: <?php echo $slide_width; ?>">
              <?php echo render_block( $innerBlocks[$i] ); ?>
            </div>
          <?php endif;
        endfor;
      endif;
      
      // Render actual slides 
      foreach ( $innerBlocks as $index => $inner_block ) : ?>
      <!-- ontouchstart is essential for ios -->
        <div class="carousel-slide" ontouchstart=""
            data-slide-index="<?php echo $index; ?>"
            style="width: <?php echo $slide_width; ?>">
          <?php echo render_block( $inner_block ); ?>
        </div>
      <?php endforeach;
      
      // Clone first slides at the end for seamless looping
      if ( $loop && $realSlides > 0 ) :
        for ( $i = 0; $i < $columns; $i++ ) :
          if ( isset( $innerBlocks[$i] ) ) : ?>
            <div class="carousel-slide carousel-clone"
                 data-slide-index="<?php echo $i; ?>"
                 style="width: <?php echo $slide_width; ?>">
              <?php echo render_block( $innerBlocks[$i] ); ?>
            </div>
          <?php endif;
        endfor;
      endif;
      ?>
    </div>
  </div>
</div>