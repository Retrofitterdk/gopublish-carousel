/**
 * The carousel's scroll area in the editor, shared by the blocks that
 * navigate it (the editor counterpart of view.js).
 */
import { useEffect, useState } from '@wordpress/element';

import { getStep } from './pages';

/**
 * Find and measure the scroll area (.carousel-track) of the carousel an
 * element belongs to: whether there is anything to scroll, and whether it's
 * at the start or the end.
 *
 * The scroll area is looked up through the DOM, because it's rendered by a
 * different block (Carousel Slides), and found again when the carousel's
 * content changes (e.g. the slides block mounts after the element).
 *
 * @param {Object} elementRef Ref to an element inside (or on) the carousel.
 * @param {Array}  deps       Values that change the layout (re-measure).
 * @return {Object} track (element or null), canScroll, atStart and atEnd.
 */
export function useCarouselTrack( elementRef, deps = [] ) {
	const [ track, setTrack ] = useState( null );
	const [ canScroll, setCanScroll ] = useState( false );
	const [ atStart, setAtStart ] = useState( true );
	const [ atEnd, setAtEnd ] = useState( false );

	useEffect( () => {
		const element = elementRef.current;
		const carousel = element?.closest( '.wp-block-gopublish-carousel' );
		if ( ! carousel ) {
			return;
		}
		const find = () =>
			setTrack( carousel.querySelector( '.carousel-track' ) );
		find();
		const { MutationObserver } = carousel.ownerDocument.defaultView;
		const observer = new MutationObserver( find );
		observer.observe( carousel, { childList: true, subtree: true } );
		return () => observer.disconnect();
	}, [ elementRef ] );

	useEffect( () => {
		if ( ! track ) {
			return;
		}
		// Same measurements as updateState() in view.js.
		const update = () => {
			const max = track.scrollWidth - track.clientWidth;
			const position = Math.abs( track.scrollLeft );
			setCanScroll( max > 1 );
			setAtStart( position <= 1 );
			setAtEnd( position >= max - 1 );
		};
		update();
		const { ResizeObserver } = track.ownerDocument.defaultView;
		const observer = new ResizeObserver( update );
		observer.observe( track );
		track.addEventListener( 'scroll', update, { passive: true } );
		return () => {
			observer.disconnect();
			track.removeEventListener( 'scroll', update );
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- deps are the caller's layout values.
	}, [ track, ...deps ] );

	return { track, canScroll, atStart, atEnd };
}

/**
 * Scroll the carousel by "Slides to scroll" slides forward (1) or back (-1),
 * rewinding at the ends when Rewind is on (same behaviour as view.js).
 *
 * @param {HTMLElement} track         The scroll area.
 * @param {number}      direction     1 or -1.
 * @param {Object}      state         Carousel state.
 * @param {boolean}     state.rewind  Whether Rewind at the end is on.
 * @param {boolean}     state.atStart Whether it's at the start.
 * @param {boolean}     state.atEnd   Whether it's at the end.
 */
export function scrollCarousel( track, direction, { rewind, atStart, atEnd } ) {
	const atEdge = direction > 0 ? atEnd : atStart;
	if ( ! track || ( atEdge && ! rewind ) ) {
		return;
	}
	const step = getStep( track );
	if ( ! step ) {
		return;
	}
	const view = track.ownerDocument.defaultView;
	const behavior = view.matchMedia( '(prefers-reduced-motion: reduce)' )
		.matches
		? 'auto'
		: 'smooth';
	const styles = view.getComputedStyle( track );
	// Right-to-left: forward scrolls to negative positions.
	const textDirection = styles.direction === 'rtl' ? -1 : 1;
	if ( atEdge ) {
		const maxPosition = track.scrollWidth - track.clientWidth;
		track.scrollTo( {
			left: direction > 0 ? 0 : textDirection * maxPosition,
			behavior,
		} );
		return;
	}
	// Slides to scroll for the current preview size.
	const slides =
		parseInt( styles.getPropertyValue( '--slides-to-scroll' ), 10 ) || 1;
	track.scrollBy( {
		left: textDirection * direction * slides * step,
		behavior,
	} );
}
