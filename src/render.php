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
    'currentIndex' => 0,             // Initial index (JS will reposition for looping)
    'itemsPerView' => $columns,      // Number of columns/slides per view
    'scroll'       => $scroll,       // Number of slides to scroll per click
    'autoplay'     => $attributes['autoplay'] ?? false,
    'loop'         => $loop,         // Loop enabled or not
    'itemsTotal'   => $realSlides    // Total real slides
  ])
]);

$slide_width = (100 / $columns) . '%';

// Optional debug info
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
      // Output only the real slides - JavaScript will handle cloning for infinite loop
      foreach ($block->parsed_block['innerBlocks'] as $index => $inner_block) : ?>
        <div class="carousel-slide"
             data-slide-index="<?php echo $index; ?>"
             style="width: <?php echo $slide_width; ?>">
          <?php echo render_block($inner_block); ?>
        </div>
      <?php endforeach; ?>
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

  <style>
    /* Basic carousel styling */
    #<?php echo $carousel_id; ?> .carousel-container {
      position: relative;
      overflow: hidden;
      width: 100%;
    }
    
    #<?php echo $carousel_id; ?> .carousel-track {
      display: flex;
      transition: transform 0.3s ease-out;
    }
    
    #<?php echo $carousel_id; ?> .carousel-slide {
      flex-shrink: 0;
      box-sizing: border-box;
      padding: 0 10px;
    }
    
    /* Navigation buttons */
    #<?php echo $carousel_id; ?> .carousel-prev,
    #<?php echo $carousel_id; ?> .carousel-next {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #ddd;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    
    #<?php echo $carousel_id; ?> .carousel-prev:hover,
    #<?php echo $carousel_id; ?> .carousel-next:hover {
      opacity: 1;
    }
    
    #<?php echo $carousel_id; ?> .carousel-prev {
      left: 10px;
    }
    
    #<?php echo $carousel_id; ?> .carousel-next {
      right: 10px;
    }
    
    #<?php echo $carousel_id; ?> .carousel-prev:disabled,
    #<?php echo $carousel_id; ?> .carousel-next:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  </style>

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