<?php
// Calculate unique ID for this carousel instance
$carousel_id = 'carousel-' . uniqid();

// Determine number of real slides and columns.
$realSlides = count($block->parsed_block['innerBlocks']);
$columns    = $attributes['columns'] ?? 3;
$scroll     = $attributes['scroll'] ?? 1;
$loop       = $attributes['loop'] ?? false;

// Pass configuration via data-wp-context
$wrapper_attributes = get_block_wrapper_attributes([
  'id' => $carousel_id,
  'data-wp-interactive' => 'squareonesoftware', // Must match your store name in view.js
  'data-wp-context' => wp_json_encode([
    'currentIndex' => 0,             // Initial index (JS will override if loop is enabled)
    'itemsPerView' => $columns,      // Number of columns/slides per view
    'scroll'       => $scroll,       // Number of slides to scroll per click
    'autoplay'     => $attributes['autoplay'] ?? false,
    'loop'         => $loop,         // Loop enabled or not
    'itemsTotal'   => $realSlides    // Total real slides
  ])
]);

$slide_width = (100 / $columns) . '%';

// Optional debug info – hidden in HTML comments
$debug_info = [
  'columns'          => $columns,
  'scroll'           => $scroll,
  'loop'             => $loop,
  'slides'           => $realSlides
];

var_dump($debug_info);
?>
<div <?php echo $wrapper_attributes; ?>>
  <!-- Debug info hidden in HTML comment -->
  <!-- <?php echo json_encode($debug_info); ?> -->
  
  <div class="carousel-container">
    <!-- The transform style will be controlled by JavaScript -->
    <div class="carousel-track" data-wp-bind--style="transform: ${state.transform}">
      <?php 
      // Output only the real slides
      foreach ($block->parsed_block['innerBlocks'] as $index => $inner_block) : ?>
        <div class="carousel-slide"
             data-slide-index="<?php echo $index; ?>"
             style="width: <?php echo $slide_width; ?>">
          <?php echo render_block($inner_block); ?>
        </div>
      <?php endforeach; ?>
    </div>
    
    <!-- Buttons trigger actions defined in view.js -->
    <button class="carousel-prev" data-carousel-id="<?php echo $carousel_id; ?>" data-wp-on--click="actions.moveBack">←</button>
    <button class="carousel-next" data-carousel-id="<?php echo $carousel_id; ?>" data-wp-on--click="actions.moveForward">→</button>
  </div>

  <!-- Fallback script remains unchanged -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Fallback script for carousel: <?php echo $carousel_id; ?>');
      
      setTimeout(function() {
        const prevBtn = document.querySelector('#<?php echo $carousel_id; ?> .carousel-prev');
        const nextBtn = document.querySelector('#<?php echo $carousel_id; ?> .carousel-next');
        
        if (prevBtn && !prevBtn.hasEventListeners) {
          console.log('Adding fallback click handler to prev button');
          prevBtn.addEventListener('click', function() {
            console.log('Fallback prev button clicked');
            if (window.rpCarouselFallback) {
              window.rpCarouselFallback.prevSlide('<?php echo $carousel_id; ?>');
            }
          });
        }
        
        if (nextBtn && !nextBtn.hasEventListeners) {
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