import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'gopublish/carousel-slide' ];

/**
 * The carousel's scroll area in the editor: the same classes as on the front
 * end (.carousel-container > .carousel-track), so style.scss applies. The
 * Carousel's toolbar adds slides and switches to "Show all slides".
 *
 * @return {Element} Editor markup.
 */
export default function Edit() {
	const blockProps = useBlockProps( { className: 'carousel-container' } );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'carousel-track' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			orientation: 'horizontal',
			// Slides are added from the Carousel's toolbar instead.
			renderAppender: false,
		}
	);

	return (
		<div { ...blockProps }>
			<div { ...innerBlocksProps } />
		</div>
	);
}
