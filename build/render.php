<?php
// Calculate unique ID for this carousel instance
$carousel_id = 'carousel-' . uniqid();

// Determine number of real slides and columns.
$realSlides = count($block->parsed_block['innerBlocks']);
$columns    = $attributes['columns'] ?? 3;
$scroll     = $attributes['scroll'] ?? 1;
$loop       = $attributes['loop'] ?? true;

// Pass configuration via data-wp-context
$wrapper_attributes = get_block_wrapper_attributes([
  'id' => $carousel_id,
  'data-wp-interactive' => 'squareonesoftware', // Must match your store name in view.js
'data-wp-context' => wp_json_encode([
  'currentIndex' => 0,
  'itemsPerView' => $columns,
  'scroll'       => $scroll,
  'autoplay'     => $attributes['autoplay'] ?? false,
  'loop'         => $loop,
  'itemsTotal'   => $realSlides,
  'clonesCount'  => $columns  // Added this line!
])
]);

$slide_width = (100 / $columns) . '%';

// Optional debug info
$debug_info = [
  'columns' => $columns,
  'scroll'  => $scroll,
  'loop'    => $loop,
  'slides'  => $realSlides
];

var_dump($debug_info);
?>
<div <?php echo $wrapper_attributes; ?>>
  <!-- Debug info hidden in HTML comment -->
  <!-- <?php echo json_encode($debug_info); ?> -->
  
  <div class="carousel-container" id="<?php echo $carousel_id; ?>">
    <!-- The transform style will be controlled by JavaScript -->
    <div class="carousel-track" data-wp-bind--style="transform: ${state.transform}">
      <?php 
      // If looping, clone the last "columns" slides at the beginning.
      if ( $loop && $realSlides > 0 ) :
          $start = max(0, $realSlides - $columns);
          for ($i = $start; $i < $realSlides; $i++) : ?>
            <div class="carousel-slide carousel-clone"
                 data-slide-index="<?php echo $i; ?>"
                 style="width: <?php echo $slide_width; ?>">
              <?php echo render_block($block->parsed_block['innerBlocks'][$i]); ?>
            </div>
      <?php 
          endfor;
      endif;
      
      // Output the real slides.
      foreach ($block->parsed_block['innerBlocks'] as $index => $inner_block) : ?>
        <div class="carousel-slide"
             data-slide-index="<?php echo $index; ?>"
             style="width: <?php echo $slide_width; ?>">
          <?php echo render_block($inner_block); ?>
        </div>
      <?php endforeach; 
      
      // If looping, clone the first "columns" slides at the end.
      if ( $loop && $realSlides > 0 ) :
          for ($i = 0; $i < $columns; $i++) : ?>
            <div class="carousel-slide carousel-clone"
                 data-slide-index="<?php echo $i; ?>"
                 style="width: <?php echo $slide_width; ?>">
              <?php echo render_block($block->parsed_block['innerBlocks'][$i]); ?>
            </div>
      <?php 
          endfor;
      endif;
      ?>
    </div>
    
    <!-- Buttons trigger actions defined in view.js -->
    <button class="carousel-prev" 
            data-carousel-id="<?php echo $carousel_id; ?>" 
            data-wp-on--click="actions.moveBack" 
            data-wp-bind--disabled="state.isTransitioning">←</button>
    <button class="carousel-next" 
            data-carousel-id="<?php echo $carousel_id; ?>" 
            data-wp-on--click="actions.moveForward" 
            data-wp-bind--disabled="state.isTransitioning">→</button>
  </div>

  <!-- Fallback script for non-interactivity environments -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Fallback script for carousel: <?php echo $carousel_id; ?>');
      
      setTimeout(function() {
        const prevBtn = document.querySelector('#<?php echo $carousel_id; ?> .carousel-prev');
        const nextBtn = document.querySelector('#<?php echo $carousel_id; ?> .carousel-next');
        
        if (prevBtn && !prevBtn.hasAttribute('data-wp-on--click')) {
          console.log('Adding fallback click handler to prev button');
          prevBtn.addEventListener('click', function() {
            console.log('Fallback prev button clicked');
            if (window.rpCarouselFallback) {
              window.rpCarouselFallback.prevSlide('<?php echo $carousel_id; ?>');
            }
          });
        }
        
        if (nextBtn && !nextBtn.hasAttribute('data-wp-on--click')) {
          console.log('Adding fallback click handler to next button');
          nextBtn.addEventListener('click', function() {
            console.log('Fallback next button clicked');
            if (window.rpCarouselFallback) {
              window.rpCarouselFallback.nextSlide('<?php echo $carousel_id; ?>');
            }
          });
        }
      }, 1000);
    });
  </script>
</div>