import { useBlockEditContext, useBlockProps } from '@wordpress/block-editor';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { getPages, getScrollDirection } from '../carousel/pages';
import { useCarouselTrack } from '../carousel/use-carousel-track';

/**
 * The pagination in the editor: the same dots as on the front end, one per
 * page of the carousel, following its scroll position. Clicking a dot
 * scrolls there. While all slides fit, the dots are dimmed instead of
 * hidden, so the block can still be selected.
 *
 * @return {Element} Editor markup.
 */
export default function Edit() {
	const ref = useRef();
	const { track, canScroll } = useCarouselTrack( ref );
	const [ pages, setPages ] = useState( {
		count: 1,
		current: 0,
		targets: [ 0 ],
		step: 0,
	} );

	// Re-measure when the slides scroll, resize or change.
	useEffect( () => {
		if ( ! track ) {
			return;
		}
		const update = () => setPages( getPages( track ) );
		update();
		const view = track.ownerDocument.defaultView;
		const resizeObserver = new view.ResizeObserver( update );
		resizeObserver.observe( track );
		const mutationObserver = new view.MutationObserver( update );
		mutationObserver.observe( track, { childList: true } );
		track.addEventListener( 'scroll', update, { passive: true } );
		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			track.removeEventListener( 'scroll', update );
		};
	}, [ track ] );

	// The layout support's classes (see Carousel Navigation's edit.js).
	const { __unstableLayoutClassNames: layoutClassNames } =
		useBlockEditContext();
	const blockProps = useBlockProps( {
		ref,
		className: [
			'carousel-pagination',
			layoutClassNames,
			canScroll ? '' : 'is-inactive',
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	const goTo = ( page ) => {
		if ( ! track ) {
			return;
		}
		const reduceMotion = track.ownerDocument.defaultView.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		track.scrollTo( {
			left:
				getScrollDirection( track ) *
				pages.targets[ page ] *
				pages.step,
			behavior: reduceMotion ? 'auto' : 'smooth',
		} );
	};

	return (
		<div { ...blockProps }>
			{ pages.targets.map( ( target, page ) => (
				<button
					key={ page }
					type="button"
					className="carousel-dot"
					aria-label={ sprintf(
						/* translators: Label of a pagination dot. %d: Number of the first slide it scrolls to. */
						__( 'Go to slide %d', 'gopublish-carousel' ),
						target + 1
					) }
					aria-current={ page === pages.current }
					onClick={ () => goTo( page ) }
				/>
			) ) }
		</div>
	);
}
