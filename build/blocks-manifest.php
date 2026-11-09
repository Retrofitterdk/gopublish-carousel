<?php
// This file is generated. Do not modify it manually.
return array(
	'carousel' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'gopublish/carousel',
		'version' => '0.2.7',
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
			'mobileWidth' => array(
				'type' => 'number',
				'default' => 75
			),
			'ariaLabel' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'textdomain' => 'gopublish-carousel',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScriptModule' => 'file:./view.js'
	),
	'carousel-slide' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'gopublish/carousel-slide',
		'version' => '0.2.7',
		'title' => 'Carousel Slide',
		'category' => 'widgets',
		'icon' => 'media-default',
		'description' => 'A wrapper block for carousel slides',
		'parent' => array(
			'gopublish/carousel'
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
	)
);
