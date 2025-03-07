<?php
/**
 * Plugin Name:       Carousel Slider - Be2Green
 * Description:       An interactive block with the Interactivity API.
 * Version:           0.1.0
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       demo-carousel
 *
 * @package           squareonesoftware
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_demo_carousel_block_init() {
    // Register main carousel block
    register_block_type_from_metadata( __DIR__ . '/build/carousel' );

    // Register custom slide inner block
    $slide_block = register_block_type_from_metadata( __DIR__ . '/build/carousel-slide' );
    
}
add_action( 'init', 'create_block_demo_carousel_block_init', 9 );  // Note the priority