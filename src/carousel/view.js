import { store, getContext, getElement } from '@wordpress/interactivity';

const TRANSITION = 'transform 0.3s ease-out';
const SWIPE_THRESHOLD = 50;

function isMobileView() {
	return window.matchMedia( '(max-width: 782px)' ).matches;
}

/**
 * Find the carousel parts from any element inside (or on) the wrapper.
 *
 * @param {HTMLElement} element Element with a directive, e.g. a button.
 * @return {{track: HTMLElement|null, container: HTMLElement|null}} Parts.
 */
function getParts( element ) {
	const wrapper = element.closest(
		'[data-wp-interactive="gopublish-carousel"]'
	);
	return {
		track: wrapper?.querySelector( '.carousel-track' ) ?? null,
		container: wrapper?.querySelector( '.carousel-container' ) ?? null,
	};
}

/**
 * Move the track to match context.currentIndex.
 *
 * The transform is set directly on the element (not via a directive) because
 * the loop reset below needs it applied synchronously, before the transition
 * is switched back on.
 *
 * @param {Object}      context   Carousel context.
 * @param {HTMLElement} track     The .carousel-track element.
 * @param {HTMLElement} container The .carousel-container element.
 */
function applyTransform( context, track, container ) {
	let slideWidthPercent;
	if ( isMobileView() ) {
		slideWidthPercent = context.slideWidthMobile;
		container.classList.add( 'mobile-partial-view' );
	} else if ( ! context.cutoff || context.itemsPerView === 1 ) {
		slideWidthPercent = 100 / context.itemsPerView;
		container.classList.remove( 'mobile-partial-view' );
	} else {
		slideWidthPercent = 100 / ( context.itemsPerView - 0.3 );
		container.classList.remove( 'mobile-partial-view' );
	}
	const offsetPercentage = slideWidthPercent * context.currentIndex;
	track.style.transform = `translateX(-${ offsetPercentage }%)`;
}

/**
 * Move the carousel forward (1) or back (-1) by `scroll` slides.
 *
 * @param {Object}      context   Carousel context.
 * @param {HTMLElement} element   Any element inside the carousel.
 * @param {number}      direction 1 or -1.
 */
function move( context, element, direction ) {
	if ( context.isTransitioning ) {
		return;
	}
	const { track, container } = getParts( element );
	if ( ! track || ! container ) {
		return;
	}
	context.isTransitioning = true;
	context.currentIndex += direction * context.scroll;
	applyTransform( context, track, container );
}

store( 'gopublish-carousel', {
	actions: {
		moveForward() {
			move( getContext(), getElement().ref, 1 );
		},
		moveBack() {
			move( getContext(), getElement().ref, -1 );
		},
	},
	callbacks: {
		/**
		 * Runs once per carousel (data-wp-init on the wrapper).
		 * Sets the start position and attaches the gesture listeners.
		 */
		init() {
			// Keep references: the listeners below run outside the
			// Interactivity scope, so they can't call getContext() themselves.
			const wrapper = getElement().ref;
			const { track, container } = getParts( wrapper );
			if ( ! track || ! container ) {
				return;
			}
			const context = getContext();

			const resetWithoutAnimation = ( offset ) => {
				track.style.transition = 'none';
				context.currentIndex += offset;
				applyTransform( context, track, container );
				window.requestAnimationFrame( () => {
					track.getBoundingClientRect(); // Force reflow.
					track.style.transition = TRANSITION;
				} );
			};

			// Seamless looping: after sliding onto the clones, jump back to
			// the matching real slide without animation.
			track.addEventListener( 'transitionend', () => {
				context.isTransitioning = false;
				if (
					context.currentIndex >=
					context.itemsTotal + context.clonesCount
				) {
					resetWithoutAnimation( -context.itemsTotal );
				} else if ( context.currentIndex < context.clonesCount ) {
					resetWithoutAnimation( context.itemsTotal );
				}
			} );

			// Initial position, without animation.
			track.style.transition = 'none';
			applyTransform( context, track, container );
			track.getBoundingClientRect(); // Force reflow.
			setTimeout( () => {
				track.style.transition = TRANSITION;
			}, 50 );

			window.addEventListener( 'resize', () =>
				applyTransform( context, track, container )
			);

			const swipe = ( deltaX ) => {
				if ( Math.abs( deltaX ) > SWIPE_THRESHOLD ) {
					move( context, wrapper, deltaX < 0 ? 1 : -1 );
				}
			};

			// Touch swipe.
			let touchStartX = 0;
			let touchCurrentX = 0;
			let isSwiping = false;

			track.addEventListener( 'touchstart', ( e ) => {
				if ( ! e.touches?.length ) {
					return;
				}
				touchStartX = touchCurrentX = e.touches[ 0 ].clientX;
				isSwiping = true;
			} );
			track.addEventListener( 'touchmove', ( e ) => {
				if ( isSwiping && e.touches?.length ) {
					touchCurrentX = e.touches[ 0 ].clientX;
				}
			} );
			track.addEventListener( 'touchend', () => {
				if ( isSwiping ) {
					isSwiping = false;
					swipe( touchCurrentX - touchStartX );
				}
			} );

			// Mouse drag.
			let mouseStartX = 0;
			let mouseCurrentX = 0;
			let isDragging = false;
			const endDrag = () => {
				if ( isDragging ) {
					isDragging = false;
					swipe( mouseCurrentX - mouseStartX );
				}
			};

			track.addEventListener( 'mousedown', ( e ) => {
				e.preventDefault();
				mouseStartX = mouseCurrentX = e.clientX;
				isDragging = true;
			} );
			track.addEventListener( 'mousemove', ( e ) => {
				if ( isDragging ) {
					mouseCurrentX = e.clientX;
				}
			} );
			track.addEventListener( 'mouseup', endDrag );
			track.addEventListener( 'mouseleave', endDrag );
		},
	},
} );
