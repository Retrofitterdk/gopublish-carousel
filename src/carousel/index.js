import { createBlock, registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';

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
		// Before 0.5.0, the slides were the Carousel's own inner blocks and the
		// Carousel rendered the navigation itself. The markup is the same
		// (still valid), so isEligible picks these carousels out, and migrate
		// adds a Carousel Navigation (full width, right-justified, as before)
		// and wraps the slides in Carousel Slides. render.php handles the old
		// structure until the post is saved.
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
					createBlock( 'gopublish/carousel-navigation', {
						align: 'full',
					} ),
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
				[ 'gopublish/carousel-navigation', { align: 'full' } ],
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
				[ 'gopublish/carousel-pagination' ],
			],
		},
	],
} );

// A carousel has one of each part: one Carousel Slides (one scroll area;
// render.php only renders the first), one Navigation and one Pagination.
// The Carousel's allowed-blocks list can't enforce that, because the parts
// name the Carousel as their parent, which the editor treats as allowed on
// its own. This filter covers the inserter, the "Add block" button and
// pasting.
const ONE_PER_CAROUSEL = [
	'gopublish/carousel-slides',
	'gopublish/carousel-navigation',
	'gopublish/carousel-pagination',
];

addFilter(
	'blockEditor.__unstableCanInsertBlockType',
	'gopublish-carousel/one-of-each-part',
	( canInsert, blockType, rootClientId, { getBlock } ) => {
		if (
			! canInsert ||
			! ONE_PER_CAROUSEL.includes( blockType.name ) ||
			! rootClientId
		) {
			return canInsert;
		}
		const parent = getBlock( rootClientId );
		return ! (
			parent?.name === 'gopublish/carousel' &&
			parent.innerBlocks.some(
				( innerBlock ) => innerBlock.name === blockType.name
			)
		);
	}
);
