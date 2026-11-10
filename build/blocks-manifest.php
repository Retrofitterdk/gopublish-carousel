<?php
// This file is generated. Do not modify it manually.
return array(
	'carousel' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'gopublish/carousel',
		'version' => '0.6.0',
		'title' => 'Carousel',
		'category' => 'widgets',
		'icon' => 'slides',
		'description' => 'A carousel for blocks using the Interactivity API.',
		'example' => array(
			
		),
		'supports' => array(
			'align' => array(
				'wide',
				'full'
			),
			'interactivity' => true,
			'spacing' => array(
				'margin' => array(
					'top',
					'bottom'
				),
				'padding' => true,
				'blockGap' => true,
				'__experimentalDefaultControls' => array(
					'padding' => true,
					'blockGap' => true
				)
			),
			'dimensions' => array(
				'minHeight' => true
			)
		),
		'attributes' => array(
			'columns' => array(
				'type' => 'number',
				'default' => 3
			),
			'cutoff' => array(
				'type' => 'boolean',
				'default' => true
			),
			'scroll' => array(
				'type' => 'number',
				'default' => 1
			),
			'rewind' => array(
				'type' => 'boolean',
				'default' => true
			),
			'viewports' => array(
				'type' => 'object'
			),
			'ariaLabel' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'providesContext' => array(
			'gopublish-carousel/rewind' => 'rewind'
		),
		'textdomain' => 'gopublish-carousel',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScriptModule' => 'file:./view.js'
	),
	'carousel-navigation' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'gopublish/carousel-navigation',
		'version' => '0.6.0',
		'title' => 'Carousel Navigation',
		'category' => 'widgets',
		'icon' => 'leftright',
		'description' => 'Previous and next buttons for a carousel.',
		'parent' => array(
			'gopublish/carousel'
		),
		'attributes' => array(
			'icon' => array(
				'type' => 'string'
			),
			'overlay' => array(
				'type' => 'boolean',
				'default' => false
			),
			'iconColor' => array(
				'type' => 'string'
			),
			'customIconColor' => array(
				'type' => 'string'
			),
			'iconHoverColor' => array(
				'type' => 'string'
			),
			'customIconHoverColor' => array(
				'type' => 'string'
			),
			'buttonColor' => array(
				'type' => 'string'
			),
			'customButtonColor' => array(
				'type' => 'string'
			),
			'buttonHoverColor' => array(
				'type' => 'string'
			),
			'customButtonHoverColor' => array(
				'type' => 'string'
			),
			'buttonPadding' => array(
				'type' => 'object'
			),
			'iconSize' => array(
				'type' => 'number'
			)
		),
		'usesContext' => array(
			'gopublish-carousel/slidesId',
			'gopublish-carousel/rewind'
		),
		'supports' => array(
			'html' => false,
			'reusable' => false,
			'interactivity' => true,
			'align' => array(
				'wide',
				'full'
			),
			'__experimentalBorder' => array(
				'color' => true,
				'radius' => true,
				'style' => true,
				'width' => true,
				'__experimentalSkipSerialization' => true,
				'__experimentalDefaultControls' => array(
					'color' => true,
					'radius' => true,
					'width' => true
				)
			),
			'layout' => array(
				'default' => array(
					'type' => 'flex',
					'justifyContent' => 'right',
					'flexWrap' => 'nowrap'
				),
				'allowSwitching' => false,
				'allowInheriting' => false,
				'allowOrientation' => false,
				'allowVerticalAlignment' => false,
				'allowJustification' => true,
				'allowSizingOnChildren' => false
			),
			'spacing' => array(
				'margin' => array(
					'top',
					'bottom'
				),
				'padding' => true
			)
		),
		'textdomain' => 'gopublish-carousel',
		'editorScript' => 'file:./index.js',
		'render' => 'file:./render.php'
	),
	'carousel-pagination' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'gopublish/carousel-pagination',
		'version' => '0.6.0',
		'title' => 'Carousel Pagination',
		'category' => 'widgets',
		'icon' => 'ellipsis',
		'description' => 'Dots for jumping to a position in a carousel.',
		'parent' => array(
			'gopublish/carousel'
		),
		'attributes' => array(
			'dotColor' => array(
				'type' => 'string'
			),
			'customDotColor' => array(
				'type' => 'string'
			),
			'currentDotColor' => array(
				'type' => 'string'
			),
			'customCurrentDotColor' => array(
				'type' => 'string'
			),
			'dotSize' => array(
				'type' => 'number'
			),
			'dotSpacing' => array(
				'type' => 'number'
			)
		),
		'usesContext' => array(
			'gopublish-carousel/slidesId',
			'gopublish-carousel/itemsTotal'
		),
		'supports' => array(
			'html' => false,
			'reusable' => false,
			'interactivity' => true,
			'align' => array(
				'wide',
				'full'
			),
			'layout' => array(
				'default' => array(
					'type' => 'flex',
					'justifyContent' => 'center',
					'flexWrap' => 'wrap'
				),
				'allowSwitching' => false,
				'allowInheriting' => false,
				'allowOrientation' => false,
				'allowVerticalAlignment' => false,
				'allowJustification' => true,
				'allowSizingOnChildren' => false
			),
			'spacing' => array(
				'margin' => array(
					'top',
					'bottom'
				),
				'padding' => true
			)
		),
		'textdomain' => 'gopublish-carousel',
		'editorScript' => 'file:./index.js',
		'render' => 'file:./render.php'
	),
	'carousel-slide' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'gopublish/carousel-slide',
		'version' => '0.6.0',
		'title' => 'Carousel Slide',
		'category' => 'widgets',
		'icon' => 'media-default',
		'description' => 'A wrapper block for carousel slides',
		'parent' => array(
			'gopublish/carousel-slides'
		),
		'supports' => array(
			'align' => array(
				'wide',
				'full'
			),
			'spacing' => array(
				'margin' => array(
					'top',
					'bottom'
				),
				'padding' => true,
				'blockGap' => true,
				'__experimentalDefaultControls' => array(
					'padding' => true,
					'blockGap' => true
				)
			),
			'dimensions' => array(
				'minHeight' => true
			),
			'html' => false
		),
		'textdomain' => 'gopublish-carousel',
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css'
	),
	'carousel-slides' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'gopublish/carousel-slides',
		'version' => '0.6.0',
		'title' => 'Carousel Slides',
		'category' => 'widgets',
		'icon' => 'images-alt2',
		'description' => 'The slides of a carousel, in a scrollable row: slides, and Query Loops with a slide per post.',
		'parent' => array(
			'gopublish/carousel'
		),
		'allowedBlocks' => array(
			'gopublish/carousel-slide',
			'core/query'
		),
		'usesContext' => array(
			'gopublish-carousel/slidesId'
		),
		'supports' => array(
			'html' => false,
			'reusable' => false,
			'interactivity' => true
		),
		'textdomain' => 'gopublish-carousel',
		'editorScript' => 'file:./index.js',
		'render' => 'file:./render.php'
	)
);
