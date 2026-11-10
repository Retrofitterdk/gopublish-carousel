import {
	BlockControls,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

// Slides, and Query Loops: a slide per post (editor.scss lays the posts out
// as slides; render.php in the plugin's main file renders them as slides).
const ALLOWED_BLOCKS = [ 'gopublish/carousel-slide', 'core/query' ];

/**
 * The carousel's scroll area in the editor: the same classes as on the front
 * end (.carousel-container > .carousel-track), so style.scss applies.
 *
 * Toolbar: Add slide (at the end) and Show all slides (an editor-only grid
 * view of every slide, not saved).
 *
 * @param {Object} props          Block props.
 * @param {string} props.clientId Block client ID.
 * @return {Element} Editor markup.
 */
export default function Edit( { clientId } ) {
	const [ showAll, setShowAll ] = useState( false );
	const slideCount = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( clientId ),
		[ clientId ]
	);
	const { insertBlock } = useDispatch( blockEditorStore );

	// Add a slide at the end (it gets selected and scrolled into view).
	const addSlide = () =>
		insertBlock(
			createBlock( 'gopublish/carousel-slide' ),
			slideCount,
			clientId
		);

	const blockProps = useBlockProps( {
		className: [ 'carousel-container', showAll ? 'is-editor-grid' : '' ]
			.filter( Boolean )
			.join( ' ' ),
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'carousel-track' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			orientation: 'horizontal',
			// Slides are added from the toolbar instead.
			renderAppender: false,
		}
	);

	return (
		<div { ...blockProps }>
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarButton
						icon="plus-alt2"
						label={ __( 'Add slide', 'gopublish-carousel' ) }
						onClick={ addSlide }
					/>
					<ToolbarButton
						icon="grid-view"
						label={ __( 'Show all slides', 'gopublish-carousel' ) }
						isPressed={ showAll }
						onClick={ () => setShowAll( ! showAll ) }
					/>
				</ToolbarGroup>
			</BlockControls>
			<div { ...innerBlocksProps } />
		</div>
	);
}
