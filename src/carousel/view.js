import {
	store,
	getContext,
	getElement,
	withScope,
} from '@wordpress/interactivity';

// Browsers without the scrollend event (older Safari) treat the scroll as
// finished once no scroll event has fired for this long (ms).
const SCROLL_SETTLE_DELAY = 150;
const supportsScrollEnd = 'onscrollend' in window;
const settleTimers = new WeakMap();

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
 * Distance from one slide to the next: slide width plus the gap.
 *
 * @param {HTMLElement} track The scroll area.
 * @return {number} Distance in pixels (0 without slides).
 */
function getStep( track ) {
	const [ first, second ] = track.children;
	if ( ! first ) {
		return 0;
	}
	return second
		? Math.abs( second.offsetLeft - first.offsetLeft )
		: first.offsetWidth;
}

/**
 * Horizontal scroll direction: 1 left-to-right, -1 right-to-left.
 *
 * In right-to-left text, the slides run from right to left and scrollLeft
 * counts down from 0, so "forward" means scrolling to negative positions.
 *
 * @param {HTMLElement} track The scroll area.
 * @return {number} 1 or -1.
 */
function getScrollDirection( track ) {
	return window.getComputedStyle( track ).direction === 'rtl' ? -1 : 1;
}

/**
 * Measure the scroll area and update canScroll, atStart and atEnd, and with
 * them the buttons' disabled state (prevDisabled, nextDisabled).
 *
 * Uses the absolute scroll position, so it also works right-to-left, where
 * scrollLeft counts down from 0.
 *
 * @param {Object}      context Carousel context.
 * @param {HTMLElement} track   The scroll area.
 */
function updateState( context, track ) {
	const maxScroll = track.scrollWidth - track.clientWidth;
	const position = Math.abs( track.scrollLeft );
	// 1px tolerance for subpixel rounding.
	context.canScroll = maxScroll > 1;
	context.atStart = position <= 1;
	context.atEnd = position >= maxScroll - 1;
	// With Rewind off, the buttons are disabled at the ends.
	context.prevDisabled = ! context.rewind && context.atStart;
	context.nextDisabled = ! context.rewind && context.atEnd;
}

/**
 * The slides that are fully visible in the scroll area (1-based).
 *
 * A partly shown slide (cutoff effect) doesn't count. Compares positions on
 * screen, so it also works right-to-left.
 *
 * @param {HTMLElement} track The scroll area.
 * @return {{first: number, last: number}} First and last fully visible slide,
 *                                         or 0 for both if none is.
 */
function getVisibleSlides( track ) {
	const area = track.getBoundingClientRect();
	let first = 0;
	let last = 0;
	Array.from( track.children ).forEach( ( slide, index ) => {
		const box = slide.getBoundingClientRect();
		// 1px tolerance for subpixel rounding.
		if ( box.left >= area.left - 1 && box.right <= area.right + 1 ) {
			first = first || index + 1;
			last = index + 1;
		}
	} );
	return { first, last };
}

/**
 * The scroll has finished: update the state and, if the scroll was started by
 * a button, announce the fully visible slides ("Slide 4 of 9" or "Slides 8 to
 * 9 of 9").
 *
 * @param {Object}      context Carousel context.
 * @param {HTMLElement} track   The scroll area.
 */
function settle( context, track ) {
	updateState( context, track );

	if ( ! context.announcePending ) {
		return;
	}
	context.announcePending = false;

	let { first, last } = getVisibleSlides( track );
	if ( ! first ) {
		// No slide fits entirely (slides wider than the carousel): use the one
		// at the current scroll position.
		const step = getStep( track );
		const index = step
			? Math.round( Math.abs( track.scrollLeft ) / step )
			: 0;
		first = last = Math.min( index, context.itemsTotal - 1 ) + 1;
	}
	context.announcement =
		first === last
			? context.announcementTemplate
					.replace( '%1$d', first )
					.replace( '%2$d', context.itemsTotal )
			: context.announcementRange
					.replace( '%1$d', first )
					.replace( '%2$d', last )
					.replace( '%3$d', context.itemsTotal );
}

/**
 * Scroll by "Slides to scroll" slides forward (1) or back (-1).
 *
 * The browser does the scrolling and snaps to the nearest slide (CSS scroll
 * snap); smooth unless the user prefers reduced motion (scroll-behavior in
 * style.scss). At the end (or start), it rewinds to the other end if Rewind
 * is on, and does nothing if it's off (the button is aria-disabled then).
 *
 * @param {Object}      context   Carousel context.
 * @param {HTMLElement} element   Any element inside the carousel.
 * @param {number}      direction 1 or -1.
 */
function scrollBySlides( context, element, direction ) {
	const track = getTrack( element );
	const step = track ? getStep( track ) : 0;
	const atEdge = direction > 0 ? context.atEnd : context.atStart;
	if ( ! step || ( atEdge && ! context.rewind ) ) {
		return;
	}
	// Announce where the carousel ends up once the scroll has finished.
	context.announcePending = true;
	const textDirection = getScrollDirection( track );
	if ( atEdge ) {
		// Rewind: from the end back to the start, or from the start to the end.
		const maxScroll = track.scrollWidth - track.clientWidth;
		track.scrollTo( {
			left: direction > 0 ? 0 : textDirection * maxScroll,
		} );
		return;
	}
	// Slides to scroll can differ per viewport, so it's read from the CSS
	// (--slides-to-scroll, set by render.php) for the current screen size.
	const slides =
		parseInt(
			window
				.getComputedStyle( track )
				.getPropertyValue( '--slides-to-scroll' ),
			10
		) || 1;
	track.scrollBy( {
		left: textDirection * direction * slides * step,
	} );
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
		 * Runs once per carousel (data-wp-init on the scroll area): measures
		 * the state, and again whenever the scroll area changes size (e.g.
		 * the window is resized, or the small-screen slide width kicks in).
		 */
		initTrack() {
			const context = getContext();
			const track = getElement().ref;
			updateState( context, track );
			new window.ResizeObserver(
				withScope( () => updateState( context, track ) )
			).observe( track );
		},

		/**
		 * The scroll has finished (data-wp-on--scrollend).
		 */
		onScrollEnd() {
			settle( getContext(), getElement().ref );
		},

		/**
		 * Fallback for browsers without scrollend (data-wp-on-async--scroll):
		 * settle once scrolling has paused.
		 */
		onScroll() {
			if ( supportsScrollEnd ) {
				return;
			}
			const context = getContext();
			const track = getElement().ref;
			window.clearTimeout( settleTimers.get( track ) );
			settleTimers.set(
				track,
				window.setTimeout(
					withScope( () => settle( context, track ) ),
					SCROLL_SETTLE_DELAY
				)
			);
		},
	},
} );
