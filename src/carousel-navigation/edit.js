import { useBlockEditContext, useBlockProps } from '@wordpress/block-editor';
import { useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import {
	scrollCarousel,
	useCarouselTrack,
} from '../carousel/use-carousel-track';

/**
 * The arrow icon from render.php (the previous button rotates it via CSS).
 *
 * @return {Element} SVG icon.
 */
function ArrowIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M1.16663 6.99984H12.8333M12.8333 6.99984L6.99996 1.1665M12.8333 6.99984L6.99996 12.8332"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

/**
 * The navigation in the editor: the same buttons as on the front end. They
 * scroll the carousel's slides and rewind at the ends like on the front end
 * (Rewind at the end comes from the Carousel through the block context).
 * While all slides fit, the buttons are dimmed instead of hidden, so the
 * block can still be selected.
 *
 * @param {Object} props         Block props.
 * @param {Object} props.context Block context.
 * @return {Element} Editor markup.
 */
export default function Edit( { context } ) {
	const ref = useRef();
	const rewind = context[ 'gopublish-carousel/rewind' ] ?? true;
	const { track, canScroll, atStart, atEnd } = useCarouselTrack( ref );
	// The layout support's classes (flex, justification). The editor only
	// adds them to blocks with inner blocks (through useInnerBlocksProps), so
	// this block adds them itself, like core does on the front end.
	const { __unstableLayoutClassNames: layoutClassNames } =
		useBlockEditContext();
	const blockProps = useBlockProps( {
		ref,
		className: [
			'navigation-container',
			layoutClassNames,
			canScroll ? '' : 'is-inactive',
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	const scroll = ( direction ) =>
		scrollCarousel( track, direction, { rewind, atStart, atEnd } );

	return (
		<div { ...blockProps }>
			<button
				type="button"
				className="carousel-prev"
				aria-label={ __( 'Previous slide', 'gopublish-carousel' ) }
				aria-disabled={ ! canScroll || ( ! rewind && atStart ) }
				onClick={ () => scroll( -1 ) }
			>
				<ArrowIcon />
			</button>
			<button
				type="button"
				className="carousel-next"
				aria-label={ __( 'Next slide', 'gopublish-carousel' ) }
				aria-disabled={ ! canScroll || ( ! rewind && atEnd ) }
				onClick={ () => scroll( 1 ) }
			>
				<ArrowIcon />
			</button>
		</div>
	);
}
