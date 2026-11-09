import {
	BlockControls,
	getSpacingPresetCssVar,
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import {
	Button,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
	// WordPress 7.1 still only ships these under their experimental names
	// (the stable names exist in the npm package, not in core).
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import {
	getLayoutProperties,
	getLayouts,
	getViewportOverrides,
} from './layouts';
import { scrollCarousel, useCarouselTrack } from './use-carousel-track';

// The Carousel's inner blocks: Carousel Slides (the scroll area).
const ALLOWED_BLOCKS = [ 'gopublish/carousel-slides' ];

// The layout's screen sizes and the editor's device preview names. The base
// layout (Desktop) applies to every screen size unless Tablet or Mobile
// changes it; each inherits from the one before it.
const SCREEN_SIZES = [
	{
		viewport: 'base',
		device: 'Desktop',
		label: __( 'Desktop', 'gopublish-carousel' ),
	},
	{
		viewport: '@tablet',
		device: 'Tablet',
		label: __( 'Tablet', 'gopublish-carousel' ),
	},
	{
		viewport: '@mobile',
		device: 'Mobile',
		label: __( 'Mobile', 'gopublish-carousel' ),
	},
];

// Plain lengths or spacing preset variables (same check as
// gopublish_carousel_gap_value() in PHP).
const GAP_PATTERN =
	/^(?:0|\d*\.?\d+(?:px|em|rem|%|vw|vh|ch)|var\(--wp--preset--spacing--[a-z0-9-]+\))$/;

/**
 * The CSS value for a Block spacing (blockGap) setting, for --carousel-gap.
 * Mirrors gopublish_carousel_gap_value() in PHP.
 *
 * @param {string|Object|undefined} gap The blockGap value.
 * @return {string|undefined} CSS value, or undefined if unset or invalid.
 */
function getGapValue( gap ) {
	// Separate values per axis: the space between slides is the horizontal one.
	const value = getSpacingPresetCssVar(
		gap && typeof gap === 'object' ? gap.left : gap
	);
	if ( ! value || ! GAP_PATTERN.test( value ) ) {
		return undefined;
	}
	// A unitless 0 is invalid in calc() additions (the slide width formula).
	return value === '0' ? '0px' : value;
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
	const { rewind, ariaLabel, style } = attributes;
	// Layout per viewport (layouts.js, same as render.php). The base layout
	// applies to all screen sizes unless tablet or mobile override it.
	const layouts = getLayouts( attributes );
	const overrides = getViewportOverrides( attributes );

	// The screen size whose layout the settings edit. It follows the editor's
	// device preview (and switching it switches the preview), so you always
	// see the layout you're changing. Editors without a device preview keep
	// their own choice.
	const deviceType = useSelect(
		( select ) => select( 'core/editor' )?.getDeviceType?.(),
		[]
	);
	const { setDeviceType } = useDispatch( 'core/editor' ) ?? {};
	const [ localViewport, setLocalViewport ] = useState( 'base' );
	const screenSize =
		SCREEN_SIZES.find( ( size ) =>
			deviceType
				? size.device === deviceType
				: size.viewport === localViewport
		) ?? SCREEN_SIZES[ 0 ];
	const { viewport } = screenSize;
	const layout = layouts[ viewport ];
	const parentSize =
		SCREEN_SIZES[ SCREEN_SIZES.indexOf( screenSize ) - 1 ] ?? null;

	const selectScreenSize = ( value ) => {
		const size = SCREEN_SIZES.find( ( item ) => item.viewport === value );
		if ( setDeviceType && deviceType ) {
			setDeviceType( size.device );
		} else {
			setLocalViewport( value );
		}
	};

	// Old carousels (no viewports attribute) get their layout written out on
	// the first change, so it doesn't jump: the tablet/mobile defaults, and
	// the base cutoff effect as it was shown (off with 1 column).
	const getWrittenOutLayout = () =>
		attributes.viewports
			? { viewports: { ...attributes.viewports } }
			: {
					cutoff: layouts.base.cutoff,
					viewports: { ...overrides },
				};

	// Change columns, cutoff or scroll for the selected screen size.
	const setLayoutValue = ( key, value ) => {
		const changes = getWrittenOutLayout();
		if ( viewport === 'base' ) {
			changes[ key ] = value;
		} else {
			changes.viewports[ viewport ] = {
				...changes.viewports[ viewport ],
				[ key ]: value,
			};
		}
		setAttributes( changes );
	};

	// Tablet/mobile: drop the overrides, so it inherits everything again.
	const isOverridden = ( key ) =>
		viewport !== 'base' && overrides[ viewport ]?.[ key ] !== undefined;
	const hasOverrides = [ 'columns', 'cutoff', 'scroll' ].some( isOverridden );
	const resetScreenSize = () => {
		const changes = getWrittenOutLayout();
		delete changes.viewports[ viewport ];
		setAttributes( changes );
	};

	// Help text: the description on Desktop, the inheritance on tablet/mobile.
	const getHelp = ( key, description ) => {
		if ( ! parentSize ) {
			return description;
		}
		return isOverridden( key )
			? sprintf(
					/* translators: %s: Screen size, e.g. "Tablet". */
					__( 'Changed for %s.', 'gopublish-carousel' ),
					screenSize.label
				)
			: sprintf(
					/* translators: %s: Larger screen size, e.g. "Desktop". */
					__( 'Same as %s.', 'gopublish-carousel' ),
					parentSize.label
				);
	};

	// "Show all slides": an editor-only grid view (not saved).
	const [ showAll, setShowAll ] = useState( false );
	const wrapperRef = useRef();

	// The Carousel Slides block, which the toolbar buttons work on.
	const slidesClientId = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockName } = select( blockEditorStore );
			return getBlockOrder( clientId ).find(
				( id ) => getBlockName( id ) === 'gopublish/carousel-slides'
			);
		},
		[ clientId ]
	);
	const slideCount = useSelect(
		( select ) =>
			slidesClientId
				? select( blockEditorStore ).getBlockCount( slidesClientId )
				: 0,
		[ slidesClientId ]
	);
	const { insertBlock } = useDispatch( blockEditorStore );

	// Like on the front end (render.php): the base layout and Block spacing
	// inline, and the per-viewport layouts and gaps in a style element with
	// the same media queries as the front end, passed from PHP
	// (gopublish_carousel_editor_data()). In the editor canvas, they apply in
	// Tablet and Mobile preview.
	const mediaQueries = window.gopublishCarousel?.mediaQueries;
	const gap = getGapValue( style?.spacing?.blockGap );
	const viewportClass = `gopublish-carousel-${ clientId }`;
	const viewportCSS = Object.entries( mediaQueries ?? {} )
		.map( ( [ screen, mediaQuery ] ) => {
			const properties = layouts[ screen ]
				? getLayoutProperties( layouts[ screen ] )
				: {};
			const viewportGap = getGapValue(
				style?.[ screen ]?.spacing?.blockGap
			);
			if ( viewportGap ) {
				properties[ '--carousel-gap' ] = viewportGap;
			}
			const declarations = Object.entries( properties )
				.map(
					( [ name, value ] ) => `${ name }:${ value } !important;`
				)
				.join( '' );
			return declarations
				? `${ mediaQuery }{.${ viewportClass }{${ declarations }}}`
				: '';
		} )
		.join( '' );

	// Add a slide at the end (it gets selected and scrolled into view).
	const addSlide = () =>
		insertBlock(
			createBlock( 'gopublish/carousel-slide' ),
			slideCount,
			slidesClientId
		);

	// Show the arrows only when the slides overflow, and track the start/end,
	// like the front end. The row's width follows the editor canvas,
	// including device previews.
	const { track, canScroll, atStart, atEnd } = useCarouselTrack( wrapperRef, [
		showAll,
		slideCount,
		viewportCSS,
	] );
	const scrollBySlides = ( direction ) =>
		scrollCarousel( track, direction, { rewind, atStart, atEnd } );

	// Same classes and widths as the front end (render.php), so the front-end
	// styles apply in the editor too. Nothing here is saved.
	const blockProps = useBlockProps( {
		ref: wrapperRef,
		className: [
			`columns-${ layouts.base.columns }`,
			layouts.base.cutoff ? 'cutoff' : 'no-cutoff',
			showAll ? 'is-editor-grid' : '',
			viewportCSS ? viewportClass : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			...getLayoutProperties( layouts.base ),
			'--carousel-gap': gap,
		},
	} );

	// The inner blocks' wrapper is display: contents (editor.scss), so the
	// Carousel Slides block lays out as on the front end.
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'carousel-inner-blocks' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			renderAppender: false,
		}
	);

	return (
		<div { ...blockProps }>
			{ viewportCSS && <style>{ viewportCSS }</style> }
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon="plus-alt2"
						label={ __( 'Add slide', 'gopublish-carousel' ) }
						onClick={ addSlide }
						disabled={ ! slidesClientId }
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
				<PanelBody title={ __( 'Layout', 'gopublish-carousel' ) }>
					<ToggleGroupControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						isBlock
						label={ __( 'Screen size', 'gopublish-carousel' ) }
						help={ __(
							'Desktop settings apply to every screen size unless Tablet or Mobile changes them. Also switches the editor preview.',
							'gopublish-carousel'
						) }
						value={ viewport }
						onChange={ selectScreenSize }
					>
						{ SCREEN_SIZES.map( ( size ) => (
							<ToggleGroupControlOption
								key={ size.viewport }
								value={ size.viewport }
								label={ size.label }
							/>
						) ) }
					</ToggleGroupControl>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Columns', 'gopublish-carousel' ) }
						help={ getHelp(
							'columns',
							__(
								'Number of slides visible at once.',
								'gopublish-carousel'
							)
						) }
						value={ layout.columns }
						onChange={ ( value ) =>
							setLayoutValue( 'columns', value )
						}
						min={ 1 }
						max={ 6 }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Use cutoff effect',
							'gopublish-carousel'
						) }
						help={ getHelp(
							'cutoff',
							__(
								'Partly show the last visible slide (or, with one column, the next slide), hinting that there are more slides to scroll through.',
								'gopublish-carousel'
							)
						) }
						checked={ layout.cutoff }
						onChange={ ( value ) =>
							setLayoutValue( 'cutoff', value )
						}
					/>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Slides to scroll', 'gopublish-carousel' ) }
						help={ getHelp(
							'scroll',
							__(
								'Number of slides to move when navigating. With the cutoff effect, it must be lower than the number of columns.',
								'gopublish-carousel'
							)
						) }
						value={ layout.scroll }
						onChange={ ( value ) =>
							setLayoutValue( 'scroll', value )
						}
						min={ 1 }
						max={ layout.maxScroll }
						disabled={ layout.maxScroll === 1 }
					/>
					{ parentSize && hasOverrides && (
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={ resetScreenSize }
						>
							{ sprintf(
								/* translators: %s: Larger screen size, e.g. "Desktop". */
								__( 'Reset to %s', 'gopublish-carousel' ),
								parentSize.label
							) }
						</Button>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Navigation', 'gopublish-carousel' ) }>
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

			<div { ...innerBlocksProps } />
		</div>
	);
}
