import { createBlock, registerBlockType } from '@wordpress/blocks';

import './style.scss';
import './editor.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: Edit,
	save,
	// A new carousel starts with three empty slides. A default variation is
	// used instead of an InnerBlocks `template`: the template prop is
	// deprecated in newer editor versions, and its replacement isn't
	// available in WordPress 7.1 yet. Variations work in all versions.
	deprecated: [
		// Before 0.5.0, the slides were the Carousel's own inner blocks. The
		// markup is the same (still valid), so isEligible picks these
		// carousels out, and migrate wraps their slides in Carousel Slides.
		// render.php handles the old structure until the post is saved.
		{
			attributes: metadata.attributes,
			supports: metadata.supports,
			save,
			isEligible: ( attributes, innerBlocks ) =>
				innerBlocks.some(
					( innerBlock ) =>
						innerBlock.name === 'gopublish/carousel-slide'
				),
			migrate: ( attributes, innerBlocks ) => [
				attributes,
				[
					createBlock(
						'gopublish/carousel-slides',
						{ lock: { remove: true } },
						innerBlocks
					),
				],
			],
		},
	],
	variations: [
		{
			name: 'carousel',
			title: metadata.title,
			description: metadata.description,
			icon: metadata.icon,
			isDefault: true,
			scope: [ 'inserter' ],
			// 3 columns on large screens, 2 on tablet and 1 on mobile (all
			// with the cutoff effect, the block's default).
			attributes: {
				viewports: {
					'@tablet': { columns: 2 },
					'@mobile': { columns: 1 },
				},
			},
			innerBlocks: [
				[
					'gopublish/carousel-slides',
					// The carousel needs its slides: Carousel Slides can't be
					// removed on its own (only together with the Carousel).
					{ lock: { remove: true } },
					[
						[ 'gopublish/carousel-slide' ],
						[ 'gopublish/carousel-slide' ],
						[ 'gopublish/carousel-slide' ],
					],
				],
			],
		},
	],
} );
