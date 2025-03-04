<?php
/**
 * This template creates the markup for our looping carousel:
 * 1) Clones the last N (columns) slides at the beginning and the first N slides at the end. 
 * 2) JavaScript will handle the seamless infinite loop by jumping between the clones and the real slides.
 */

// Calculate unique ID for this carousel instance
$carousel_id = 'carousel-' . uniqid();

// Determine number of real slides and columns
$realSlides = count($block->parsed_block['innerBlocks']);
$columns    = $attributes['columns'] ?? 3;
$scroll     = $attributes['scroll'] ?? 1;
$loop       = true;

// Increase slide width to create partial cut-off effect
$slide_width = (100 / ($columns - 0.3)) . '%';

// Pass configuration via data-wp-context
$wrapper_attributes = get_block_wrapper_attributes([
  'id' => $carousel_id,
  'data-wp-interactive' => 'squareonesoftware',
  'data-wp-context' => wp_json_encode([
    'currentIndex' => 0,
    'itemsPerView' => $columns,
    'scroll'       => $scroll,
    'autoplay'     => $attributes['autoplay'] ?? false,
    'loop'         => $loop,
    'itemsTotal'   => $realSlides,
    'clonesCount'  => $columns,
    'slideWidth'   => $slide_width
  ])
]);

// Optional debug info
$debug_info = [
  'columns' => $columns,
  'scroll'  => $scroll,
  'loop'    => $loop,
  'slides'  => $realSlides,
];

?>
<div <?php echo $wrapper_attributes; ?>>
  <div class="carousel-container" id="<?php echo $carousel_id; ?>">
    <!-- Navigation buttons remain the same -->
    <div class="navigation-container">
      <button class="carousel-prev"
        data-carousel-id="<?php echo $carousel_id; ?>"
        data-wp-on--click="actions.moveBack"
        data-wp-bind--disabled="state.isTransitioning">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332" stroke="#D9F99D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="carousel-next"
        data-carousel-id="<?php echo $carousel_id; ?>"
        data-wp-on--click="actions.moveForward"
        data-wp-bind--disabled="state.isTransitioning">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332" stroke="#D9F99D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- The transform style is controlled by JavaScript for sliding -->
    <div class="carousel-track" data-wp-bind--style="transform: ${state.transform}">
      <?php 
      // If looping, clone the last "columns" slides at the beginning
      if ( $loop && $realSlides > 0 ) :
        $start = max(0, $realSlides - $columns);
        for ($i = $start; $i < $realSlides; $i++) : ?>
          <div class="carousel-slide carousel-clone"
               data-slide-index="<?php echo $i; ?>"
               style="width: <?php echo $slide_width; ?>">
            <?php echo render_block($block->parsed_block['innerBlocks'][$i]); ?>
          </div>
        <?php endfor; 
      endif;
      
      // Output the real slides
      foreach ($block->parsed_block['innerBlocks'] as $index => $inner_block) : ?>
        <div class="carousel-slide"
             data-slide-index="<?php echo $index; ?>"
             style="width: <?php echo $slide_width; ?>">
          <?php echo render_block($inner_block); ?>
        </div>
      <?php endforeach; 
      
      // If looping, clone the first "columns" slides at the end
      if ( $loop && $realSlides > 0 ) :
        for ($i = 0; $i < $columns; $i++) : ?>
          <div class="carousel-slide carousel-clone"
               data-slide-index="<?php echo $i; ?>"
               style="width: <?php echo $slide_width; ?>">
            <?php echo render_block($block->parsed_block['innerBlocks'][$i]); ?>
          </div>
        <?php endfor;
      endif;
      ?>
    </div>
  </div>
</div>