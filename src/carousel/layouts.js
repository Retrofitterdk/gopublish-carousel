/**
 * The carousel's layout per viewport (columns, cutoff effect, slides to
 * scroll). Mirrors gopublish_carousel_layouts() and the helpers after it in
 * gopublish-carousel.php: keep them in sync.
 */

/**
 * Viewports that can override the base layout, from large to small. Each
 * inherits from the one before it (tablet from the base, mobile from tablet).
 */
export const VIEWPORTS = [ '@tablet', '@mobile' ];

/**
 * Sanitize a layout and add the values the CSS needs.
 *
 * With the cutoff effect, 2+ columns trim the last visible slide (columns
 * - 0.3 slides), and 1 column lets the next slide peek in (1.3 slides). The
 * amount (0.3) is the --cutoff-amount custom property: style.scss computes
 * the slide width from trim/peek; visible and gaps use the default.
 *
 * @param {Object}  layout         Columns, cutoff and scroll.
 * @param {number}  layout.columns Number of columns.
 * @param {boolean} layout.cutoff  Whether the cutoff effect is on.
 * @param {number}  layout.scroll  Slides to scroll.
 * @return {Object} The layout, with maxScroll, trim, peek, visible and gaps
 *                  added.
 */
function completeLayout( { columns, cutoff, scroll } ) {
	const safeColumns = Math.max( 1, Math.min( 6, parseInt( columns, 10 ) ) );
	const safeCutoff = !! cutoff;
	let visible = safeColumns;
	if ( safeCutoff ) {
		visible = safeColumns > 1 ? safeColumns - 0.3 : 1.3;
	}
	const maxScroll =
		safeCutoff && safeColumns > 1 ? safeColumns - 1 : safeColumns;

	return {
		columns: safeColumns,
		cutoff: safeCutoff,
		scroll: Math.max( 1, Math.min( maxScroll, parseInt( scroll, 10 ) ) ),
		maxScroll,
		trim: safeCutoff && safeColumns > 1,
		peek: safeCutoff && safeColumns === 1,
		visible,
		gaps: Math.ceil( visible ) - 1,
	};
}

/**
 * The viewport overrides, with the defaults for carousels from before
 * per-viewport layouts (no viewports attribute).
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Overrides keyed by viewport.
 */
export function getViewportOverrides( attributes ) {
	if ( attributes.viewports && typeof attributes.viewports === 'object' ) {
		return attributes.viewports;
	}
	return {
		'@tablet': {
			columns: Math.min( 2, parseInt( attributes.columns ?? 3, 10 ) ),
			cutoff: true,
		},
		'@mobile': { columns: 1, cutoff: true },
	};
}

/**
 * The layout for the base and each viewport.
 *
 * @param {Object} attributes Block attributes (columns, cutoff, scroll,
 *                            viewports).
 * @return {Object} Completed layouts keyed by 'base', '@tablet', '@mobile'.
 */
export function getLayouts( attributes ) {
	const base = {
		columns: attributes.columns ?? 3,
		cutoff: attributes.cutoff ?? true,
		scroll: attributes.scroll ?? 1,
	};
	// Old carousels: the cutoff effect had no effect with 1 column.
	if ( ! attributes.viewports && 1 === parseInt( base.columns, 10 ) ) {
		base.cutoff = false;
	}

	const overrides = getViewportOverrides( attributes );
	const layouts = { base: completeLayout( base ) };
	let current = base;
	VIEWPORTS.forEach( ( viewport ) => {
		const override = overrides[ viewport ] ?? {};
		current = { ...current };
		[ 'columns', 'cutoff', 'scroll' ].forEach( ( key ) => {
			if ( override[ key ] !== undefined && override[ key ] !== null ) {
				current[ key ] = override[ key ];
			}
		} );
		layouts[ viewport ] = completeLayout( current );
	} );
	return layouts;
}

/**
 * CSS custom properties for a layout.
 *
 * @param {Object} layout A completed layout.
 * @return {Object} Custom properties for style.scss.
 */
export function getLayoutProperties( layout ) {
	return {
		'--columns': layout.columns,
		'--cutoff-trim': layout.trim ? 1 : 0,
		'--cutoff-peek': layout.peek ? 1 : 0,
		'--slides-to-scroll': layout.scroll,
	};
}
