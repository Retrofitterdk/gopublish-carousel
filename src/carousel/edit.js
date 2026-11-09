import {
	BlockControls,
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import {
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const ALLOWED_BLOCKS = [ 'gopublish/carousel-slide' ];

/**
 * The largest allowed "Slides to scroll" value. Mirrors render.php: with the
 * cutoff effect, one slide fewer than the number of columns.
 *
 * @param {number}  columns Number of columns.
 * @param {boolean} cutoff  Whether the cutoff effect is on.
 * @return {number} Maximum slides to scroll.
 */
function getMaxScroll( columns, cutoff ) {
	return cutoff && columns > 1 ? columns - 1 : columns;
}

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

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { columns, scroll, cutoff, rewind, mobileWidth, ariaLabel } =
		attributes;
	const maxScroll = getMaxScroll( columns, cutoff );

	// "Show all slides": an editor-only grid view (not saved).
	const [ showAll, setShowAll ] = useState( false );
	// Whether the slides overflow the row, i.e. there is something to scroll.
	const [ canScroll, setCanScroll ] = useState( false );
	// Scroll position: at the first or the last scroll position.
	const [ atStart, setAtStart ] = useState( true );
	const [ atEnd, setAtEnd ] = useState( false );
	const trackRef = useRef();

	const slideCount = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( clientId ),
		[ clientId ]
	);
	const { insertBlock } = useDispatch( blockEditorStore );

	// Add a slide at the end (it gets selected and scrolled into view).
	const addSlide = () =>
		insertBlock(
			createBlock( 'gopublish/carousel-slide' ),
			slideCount,
			clientId
		);

	// Show the arrows only when the slides overflow, and track the start/end,
	// like the front end. The row's width follows the editor canvas,
	// including device previews.
	useEffect( () => {
		const track = trackRef.current;
		if ( ! track || showAll ) {
			return;
		}
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
	}, [ showAll, slideCount, columns, cutoff, mobileWidth ] );

	// The arrows only scroll the row (by "Slides to scroll"), and rewind at
	// the ends when Rewind is on.
	const scrollBySlides = ( direction ) => {
		const track = trackRef.current;
		const [ first, second ] = track?.children ?? [];
		const atEdge = direction > 0 ? atEnd : atStart;
		if ( ! first || ( atEdge && ! rewind ) ) {
			return;
		}
		// Distance from one slide to the next: slide width plus the gap.
		const step = second
			? Math.abs( second.offsetLeft - first.offsetLeft )
			: first.offsetWidth;
		const reduceMotion = track.ownerDocument.defaultView.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		const behavior = reduceMotion ? 'auto' : 'smooth';
		// Right-to-left: forward scrolls to negative positions (see view.js).
		const textDirection =
			track.ownerDocument.defaultView.getComputedStyle( track )
				.direction === 'rtl'
				? -1
				: 1;
		if ( atEdge ) {
			const maxPosition = track.scrollWidth - track.clientWidth;
			track.scrollTo( {
				left: direction > 0 ? 0 : textDirection * maxPosition,
				behavior,
			} );
			return;
		}
		track.scrollBy( {
			left: textDirection * direction * scroll * step,
			behavior,
		} );
	};

	// Keep "Slides to scroll" within the limit when columns or cutoff change.
	const updateLayout = ( changes ) => {
		const next = { columns, cutoff, ...changes };
		const nextMax = getMaxScroll( next.columns, next.cutoff );
		setAttributes( {
			...changes,
			scroll: Math.min( scroll, nextMax ),
		} );
	};

	// Same classes and widths as the front end (render.php), so the front-end
	// styles apply in the editor too. Nothing here is saved.
	const blockProps = useBlockProps( {
		className: [
			`columns-${ columns }`,
			cutoff ? 'cutoff' : 'no-cutoff',
			showAll ? 'is-editor-grid' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			'--columns': columns,
			'--mobile-width': `${ mobileWidth }%`,
		},
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'carousel-track', ref: trackRef },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			orientation: 'horizontal',
			// Slides are added from the toolbar instead.
			renderAppender: false,
		}
	);

	return (
		<div { ...blockProps }>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon="plus-alt2"
						label={ __( 'Add slide', 'gopublish-carousel' ) }
						onClick={ addSlide }
					/>
					<ToolbarButton
						icon="grid-view"
						label={ __( 'Show all slides', 'gopublish-carousel' ) }
						isPressed={ showAll }
						onClick={ () => setShowAll( ! showAll ) }
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Carousel settings', 'gopublish-carousel' ) }
				>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Columns', 'gopublish-carousel' ) }
						help={ __(
							'Number of slides visible at once.',
							'gopublish-carousel'
						) }
						value={ columns }
						onChange={ ( value ) =>
							updateLayout( { columns: value } )
						}
						min={ 1 }
						max={ 6 }
					/>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Slides to scroll', 'gopublish-carousel' ) }
						help={ __(
							'Number of slides to move when navigating. With the cutoff effect, it must be lower than the number of columns.',
							'gopublish-carousel'
						) }
						value={ scroll }
						onChange={ ( value ) =>
							setAttributes( { scroll: value } )
						}
						min={ 1 }
						max={ maxScroll }
						disabled={ maxScroll === 1 }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Use cutoff effect',
							'gopublish-carousel'
						) }
						help={ __(
							'Partly show the last visible slide, hinting that there are more slides to scroll through.',
							'gopublish-carousel'
						) }
						checked={ cutoff }
						onChange={ ( value ) =>
							updateLayout( { cutoff: value } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Rewind at the end',
							'gopublish-carousel'
						) }
						help={ __(
							'On the last slide, Next goes back to the first, and Previous on the first slide goes to the last. When off, the buttons are disabled at the ends.',
							'gopublish-carousel'
						) }
						checked={ rewind }
						onChange={ ( value ) =>
							setAttributes( { rewind: value } )
						}
					/>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __(
							'Mobile slide width (%)',
							'gopublish-carousel'
						) }
						help={ __(
							'Width of each slide on mobile and tablet screens, as a percentage of the carousel width.',
							'gopublish-carousel'
						) }
						value={ mobileWidth }
						onChange={ ( value ) =>
							setAttributes( { mobileWidth: value } )
						}
						min={ 1 }
						max={ 100 }
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Carousel label', 'gopublish-carousel' ) }
					help={ __(
						'Describes the carousel for screen reader users, e.g. "Customer testimonials". With a label, the carousel becomes a landmark they can jump to.',
						'gopublish-carousel'
					) }
					value={ ariaLabel }
					onChange={ ( value ) =>
						setAttributes( { ariaLabel: value } )
					}
				/>
			</InspectorControls>

			{ ! showAll && canScroll && (
				<div className="navigation-container">
					<button
						type="button"
						className="carousel-prev"
						aria-label={ __(
							'Previous slide',
							'gopublish-carousel'
						) }
						aria-disabled={ ! rewind && atStart }
						onClick={ () => scrollBySlides( -1 ) }
					>
						<ArrowIcon />
					</button>
					<button
						type="button"
						className="carousel-next"
						aria-label={ __( 'Next slide', 'gopublish-carousel' ) }
						aria-disabled={ ! rewind && atEnd }
						onClick={ () => scrollBySlides( 1 ) }
					>
						<ArrowIcon />
					</button>
				</div>
			) }

			<div className="carousel-container">
				<div { ...innerBlocksProps } />
			</div>
		</div>
	);
}
