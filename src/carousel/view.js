import { store, getContext, getElement } from '@wordpress/interactivity';

const TRANSITION_MS = 300;
const TRANSITION = `transform ${ TRANSITION_MS }ms ease-out`;
// Extra time before the fallback unlocks the carousel, in case
// `transitionend` never fires (hidden tab, interrupted transition, etc.).
const FALLBACK_MARGIN_MS = 200;
const SWIPE_THRESHOLD = 50;
// A mouse press that moves further than this is a drag, not a click.
const DRAG_CLICK_THRESHOLD = 5;

// Pending fallback timer per carousel, keyed by wrapper element.
const fallbackTimers = new WeakMap();

function isMobileView() {
	return window.matchMedia( '(max-width: 782px)' ).matches;
}

/**
 * True when every slide fits in view at the current breakpoint, so there is
 * nothing to scroll (computed in render.php).
 *
 * @param {Object} context Carousel context.
 * @return {boolean} Whether the carousel is static right now.
 */
function isStatic( context ) {
	return isMobileView() ? context.staticMobile : context.staticDesktop;
}

/**
 * How many slides are in view at the current breakpoint. Fractions mean a
 * partly visible slide (cutoff effect or mobile width). Mirrors render.php.
 *
 * @param {Object} context Carousel context.
 * @return {number} Number of slides in view.
 */
function visibleCount( context ) {
	if ( isMobileView() ) {
		return 100 / context.slideWidthMobile;
	}
	return context.cutoff && context.itemsPerView > 1
		? context.itemsPerView - 0.3
		: context.itemsPerView;
}

/**
 * Make real slides outside the view unreachable: `inert` removes them from
 * the tab order and from screen readers, so focus can't land on something
 * that isn't visible. Partly visible slides count as visible.
 *
 * Clones are left alone: they are always hidden from assistive technology
 * (aria-hidden + tabindex="-1" from render.php) but stay clickable, because
 * they can be visible next to the real slides.
 *
 * @param {Object}      context Carousel context.
 * @param {HTMLElement} track   The .carousel-track element.
 */
function updateHiddenSlides( context, track ) {
	const staticNow = isStatic( context );
	const first = context.currentIndex;
	// Small tolerance so e.g. exactly 2 slides in view doesn't round up to 3.
	const last = first + Math.ceil( visibleCount( context ) - 0.01 ) - 1;

	Array.from( track.children ).forEach( ( slide, position ) => {
		if ( slide.classList.contains( 'carousel-clone' ) ) {
			return;
		}
		const hidden = ! staticNow && ( position < first || position > last );
		slide.toggleAttribute( 'inert', hidden );
	} );
}

/**
 * Find the carousel parts from any element inside (or on) the wrapper.
 *
 * @param {HTMLElement} element Element with a directive, e.g. a button.
 * @return {{wrapper: HTMLElement|null, track: HTMLElement|null, container: HTMLElement|null}} Parts.
 */
function getParts( element ) {
	const wrapper = element.closest(
		'[data-wp-interactive="gopublish-carousel"]'
	);
	return {
		wrapper,
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
 * When the carousel is static at the current breakpoint, the clones are hidden
 * (via .is-static) and the track is not moved.
 *
 * Also updates which slides are reachable (see updateHiddenSlides()).
 *
 * @param {Object}      context         Carousel context.
 * @param {Object}      parts           Result of getParts().
 * @param {HTMLElement} parts.wrapper   The block wrapper.
 * @param {HTMLElement} parts.track     The .carousel-track element.
 * @param {HTMLElement} parts.container The .carousel-container element.
 */
function applyTransform( context, { wrapper, track, container } ) {
	const staticNow = isStatic( context );
	wrapper.classList.toggle( 'is-static', staticNow );
	updateHiddenSlides( context, track );
	if ( staticNow ) {
		track.style.transform = 'none';
		return;
	}

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
 * Jump to a position without animating (used for the seamless loop).
 *
 * @param {Object} context Carousel context.
 * @param {Object} parts   Result of getParts().
 * @param {number} offset  Number of slides to shift currentIndex by.
 */
function resetWithoutAnimation( context, parts, offset ) {
	parts.track.style.transition = 'none';
	context.currentIndex += offset;
	applyTransform( context, parts );
	window.requestAnimationFrame( () => {
		parts.track.getBoundingClientRect(); // Force reflow.
		parts.track.style.transition = TRANSITION;
	} );
}

/**
 * Update the live region text, e.g. "Slide 3 of 9" (first slide in view).
 * The region is bound with data-wp-text, and screen readers announce the
 * change politely (aria-live="polite").
 *
 * @param {Object} context Carousel context.
 */
function announce( context ) {
	const { currentIndex, clonesCount, itemsTotal } = context;
	const slideNumber =
		( ( ( ( currentIndex - clonesCount ) % itemsTotal ) + itemsTotal ) %
			itemsTotal ) +
		1;
	context.announcement = context.announcementTemplate
		.replace( '%1$d', slideNumber )
		.replace( '%2$d', itemsTotal );
}

/**
 * Called when a slide transition has finished, either from `transitionend`
 * or from the fallback timer, whichever comes first.
 *
 * Unlocks the carousel and, after sliding onto the clones, jumps back to the
 * matching real slide without animation (seamless looping). Then announces
 * the new position to screen readers.
 *
 * @param {Object} context Carousel context.
 * @param {Object} parts   Result of getParts().
 */
function finishTransition( context, parts ) {
	clearTimeout( fallbackTimers.get( parts.wrapper ) );
	fallbackTimers.delete( parts.wrapper );

	// Already handled (e.g. the fallback ran before transitionend).
	if ( ! context.isTransitioning ) {
		return;
	}
	context.isTransitioning = false;

	if ( context.currentIndex >= context.itemsTotal + context.clonesCount ) {
		resetWithoutAnimation( context, parts, -context.itemsTotal );
	} else if ( context.currentIndex < context.clonesCount ) {
		resetWithoutAnimation( context, parts, context.itemsTotal );
	}

	announce( context );
}

/**
 * Move the carousel forward (1) or back (-1) by `scroll` slides.
 *
 * @param {Object}      context   Carousel context.
 * @param {HTMLElement} element   Any element inside the carousel.
 * @param {number}      direction 1 or -1.
 */
function move( context, element, direction ) {
	if ( context.isTransitioning || isStatic( context ) ) {
		return;
	}
	const parts = getParts( element );
	if ( ! parts.track || ! parts.container ) {
		return;
	}
	context.isTransitioning = true;
	context.currentIndex += direction * context.scroll;
	applyTransform( context, parts );

	// Never stay locked: finish anyway if transitionend doesn't arrive.
	fallbackTimers.set(
		parts.wrapper,
		setTimeout(
			() => finishTransition( context, parts ),
			TRANSITION_MS + FALLBACK_MARGIN_MS
		)
	);
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
			const parts = getParts( wrapper );
			const { track } = parts;
			if ( ! track || ! parts.container ) {
				return;
			}
			const context = getContext();

			// transitionend bubbles, so transitions inside the slides (e.g.
			// hover effects) also arrive here. Only react to the track's own
			// transform transition.
			track.addEventListener( 'transitionend', ( e ) => {
				if ( e.target === track && e.propertyName === 'transform' ) {
					finishTransition( context, parts );
				}
			} );

			// Initial position, without animation.
			track.style.transition = 'none';
			applyTransform( context, parts );
			track.getBoundingClientRect(); // Force reflow.
			setTimeout( () => {
				track.style.transition = TRANSITION;
			}, 50 );

			window.addEventListener( 'resize', () =>
				applyTransform( context, parts )
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
			let suppressClick = false;
			const endDrag = () => {
				if ( isDragging ) {
					isDragging = false;
					swipe( mouseCurrentX - mouseStartX );
				}
			};

			track.addEventListener( 'mousedown', ( e ) => {
				// Only the primary (left) button drags.
				if ( e.button !== 0 ) {
					return;
				}
				e.preventDefault();
				mouseStartX = mouseCurrentX = e.clientX;
				isDragging = true;
			} );
			track.addEventListener( 'mousemove', ( e ) => {
				if ( isDragging ) {
					mouseCurrentX = e.clientX;
				}
			} );
			track.addEventListener( 'mouseup', () => {
				// The browser fires a click right after mouseup. If the mouse
				// moved, it was a drag: swallow that click so links and buttons
				// inside the slide aren't activated.
				if (
					isDragging &&
					Math.abs( mouseCurrentX - mouseStartX ) >
						DRAG_CLICK_THRESHOLD
				) {
					suppressClick = true;
					// Safety: never let the flag outlive this click, or it
					// could swallow a later keyboard "click" (Enter on a link).
					setTimeout( () => {
						suppressClick = false;
					}, 0 );
				}
				endDrag();
			} );
			track.addEventListener( 'mouseleave', endDrag );

			// Capture phase, so this runs before any handler inside the slide.
			track.addEventListener(
				'click',
				( e ) => {
					if ( suppressClick ) {
						suppressClick = false;
						e.preventDefault();
						e.stopPropagation();
					}
				},
				true
			);
		},
	},
} );
