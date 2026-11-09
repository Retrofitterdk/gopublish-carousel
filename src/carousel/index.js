import { registerBlockType } from '@wordpress/blocks';

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
				[ 'gopublish/carousel-slide' ],
				[ 'gopublish/carousel-slide' ],
				[ 'gopublish/carousel-slide' ],
			],
		},
	],
} );
