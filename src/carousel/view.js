import { store, getContext, getElement } from '@wordpress/interactivity';

/**
 * The scroll area (.carousel-track) of the carousel an element belongs to.
 *
 * @param {HTMLElement} element Any element inside (or on) the carousel wrapper.
 * @return {HTMLElement|null} The scroll area.
 */
function getTrack( element ) {
	return (
		element
			.closest( '[data-wp-interactive="gopublish-carousel"]' )
			?.querySelector( '.carousel-track' ) ?? null
	);
}

/**
 * Scroll by "Slides to scroll" slides forward (1) or back (-1).
 *
 * The browser does the scrolling and snaps to the nearest slide (CSS scroll
 * snap); smooth unless the user prefers reduced motion (scroll-behavior in
 * style.scss).
 *
 * @param {Object}      context   Carousel context.
 * @param {HTMLElement} element   Any element inside the carousel.
 * @param {number}      direction 1 or -1.
 */
function scrollBySlides( context, element, direction ) {
	const track = getTrack( element );
	const [ first, second ] = track?.children ?? [];
	if ( ! first ) {
		return;
	}
	// Distance from one slide to the next: slide width plus the gap.
	const step = second
		? Math.abs( second.offsetLeft - first.offsetLeft )
		: first.offsetWidth;
	track.scrollBy( { left: direction * context.scroll * step } );
}

store( 'gopublish-carousel', {
	actions: {
		moveForward() {
			scrollBySlides( getContext(), getElement().ref, 1 );
		},
		moveBack() {
			scrollBySlides( getContext(), getElement().ref, -1 );
		},
	},
	callbacks: {
		/**
		 * Runs once per carousel (data-wp-init on the wrapper): hides the
		 * navigation (.is-static) while all slides fit, i.e. there is nothing
		 * to scroll. Re-checked whenever the scroll area changes size.
		 */
		init() {
			const wrapper = getElement().ref;
			const track = getTrack( wrapper );
			if ( ! track ) {
				return;
			}
			const update = () =>
				wrapper.classList.toggle(
					'is-static',
					track.scrollWidth <= track.clientWidth + 1
				);
			update();
			new window.ResizeObserver( update ).observe( track );
		},
	},
} );
