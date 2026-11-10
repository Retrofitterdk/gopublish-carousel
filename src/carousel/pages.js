/**
 * Measurements of the carousel's scroll area, shared by the front end
 * (view.js) and the editor (Carousel Pagination).
 */

/**
 * The slides in the scroll area: its children. In the editor, a Query Loop
 * in Carousel Slides counts as its posts (the Post Template's list items
 * that are shown, which editor.scss lays out as slides); on the front end,
 * render.php has already made them slides.
 *
 * @param {HTMLElement} track The scroll area.
 * @return {HTMLElement[]} The slides.
 */
export function getSlides( track ) {
	return Array.from( track.children ).flatMap( ( child ) => {
		if ( ! child.classList.contains( 'wp-block-query' ) ) {
			return [ child ];
		}
		// Not the hidden copy the editor keeps of the post being edited.
		const posts = Array.from(
			child.querySelectorAll( ':scope > ul.wp-block-post-template > li' )
		).filter( ( post ) => post.getClientRects().length > 0 );
		return posts.length ? posts : [ child ];
	} );
}

/**
 * Distance from one slide to the next: slide width plus the gap.
 *
 * @param {HTMLElement} track The scroll area.
 * @return {number} Distance in pixels (0 without slides).
 */
export function getStep( track ) {
	const slides = getSlides( track );
	if ( ! slides.length ) {
		return 0;
	}
	return slides.length > 1
		? Math.abs( slides[ 1 ].offsetLeft - slides[ 0 ].offsetLeft )
		: slides[ 0 ].offsetWidth;
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
export function getScrollDirection( track ) {
	return track.ownerDocument.defaultView.getComputedStyle( track )
		.direction === 'rtl'
		? -1
		: 1;
}

/**
 * "Slides to scroll" for the current screen size (--slides-to-scroll, set
 * per viewport by render.php/edit.js).
 *
 * @param {HTMLElement} track The scroll area.
 * @return {number} Number of slides.
 */
export function getSlidesToScroll( track ) {
	return (
		parseInt(
			track.ownerDocument.defaultView
				.getComputedStyle( track )
				.getPropertyValue( '--slides-to-scroll' ),
			10
		) || 1
	);
}

/**
 * The carousel's pages, for the pagination dots: the scroll positions the
 * buttons reach (every "Slides to scroll" slides, plus the end), and the page
 * the carousel is on now.
 *
 * Example: 10 slides, 3 visible and 3 to scroll give 8 scroll positions
 * (slides 1–8 can be the first visible one) and 4 pages, starting at slides
 * 1, 4, 7 and 8.
 *
 * @param {HTMLElement} track The scroll area.
 * @return {Object} count (pages), current (0-based page), targets (the
 *                  0-based first slide of each page) and step (pixels per
 *                  slide).
 */
export function getPages( track ) {
	const total = getSlides( track ).length;
	const step = getStep( track );
	if ( ! total || ! step ) {
		return { count: total ? 1 : 0, current: 0, targets: [ 0 ], step };
	}

	const maxScroll = track.scrollWidth - track.clientWidth;
	const positions = Math.max(
		1,
		Math.min( total, Math.round( maxScroll / step ) + 1 )
	);
	const perPage = getSlidesToScroll( track );
	const count = 1 + Math.ceil( ( positions - 1 ) / perPage );
	const targets = Array.from( { length: count }, ( _, page ) =>
		Math.min( page * perPage, positions - 1 )
	);

	// The first visible slide decides the page; at the end, the last page.
	const index = Math.round( Math.abs( track.scrollLeft ) / step );
	const current =
		index >= positions - 1
			? count - 1
			: Math.min( count - 1, Math.round( index / perPage ) );

	return { count, current, targets, step };
}
