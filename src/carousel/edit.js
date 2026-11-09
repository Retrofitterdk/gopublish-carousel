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
	ToolbarDropdownMenu,
	// WordPress 7.1 still only ships these under their experimental names
	// (the stable names exist in the npm package, not in core).
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import {
	getLayoutProperties,
	getLayouts,
	getViewportOverrides,
} from './layouts';

// The Carousel's parts: Carousel Slides (the scroll area), Carousel
// Navigation and Carousel Pagination.
const PARTS = [
	'gopublish/carousel-navigation',
	'gopublish/carousel-slides',
	'gopublish/carousel-pagination',
];

// The Carousel's inner blocks: its parts, and headings and paragraphs to
// introduce or describe it (a heading also names it for screen readers; see
// render.php).
const ALLOWED_BLOCKS = [ ...PARTS, 'core/heading', 'core/paragraph' ];

// Alignments the inner blocks can choose (Navigation and Pagination width:
// content, wide or full; see style.scss). The Carousel has no layout support,
// so without this the editor wouldn't offer them.
const INNER_LAYOUT = { type: 'default', alignments: [ 'wide', 'full' ] };

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

	// The Carousel Slides block, where "Add to carousel" adds slides.
	const slidesClientId = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockName } = select( blockEditorStore );
			return getBlockOrder( clientId ).find(
				( id ) => getBlockName( id ) === 'gopublish/carousel-slides'
			);
		},
		[ clientId ]
	);
	// Whether the carousel has its Navigation and Pagination (one of each:
	// see the filter in index.js).
	const hasNavigation = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockName } = select( blockEditorStore );
			return getBlockOrder( clientId ).some(
				( id ) => getBlockName( id ) === 'gopublish/carousel-navigation'
			);
		},
		[ clientId ]
	);
	const hasPagination = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockName } = select( blockEditorStore );
			return getBlockOrder( clientId ).some(
				( id ) => getBlockName( id ) === 'gopublish/carousel-pagination'
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
	// Where text goes: before the first part (after any heading or
	// paragraph already above the parts).
	const firstPartIndex = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockName } = select( blockEditorStore );
			return getBlockOrder( clientId ).findIndex( ( id ) =>
				PARTS.includes( getBlockName( id ) )
			);
		},
		[ clientId ]
	);
	const slidesIndex = useSelect(
		( select ) =>
			select( blockEditorStore )
				.getBlockOrder( clientId )
				.indexOf( slidesClientId ),
		[ clientId, slidesClientId ]
	);
	// Where a recreated Carousel Slides goes: before the first Pagination.
	const paginationIndex = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockName } = select( blockEditorStore );
			return getBlockOrder( clientId ).findIndex(
				( id ) => getBlockName( id ) === 'gopublish/carousel-pagination'
			);
		},
		[ clientId ]
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

	// "Add to carousel": a slide at the end of Carousel Slides (it gets
	// selected and scrolled into view; without Carousel Slides, one is added
	// with the slide), Navigation before the slides, Pagination after them
	// (each only if the carousel doesn't have one yet), a heading at the top
	// and a paragraph above the parts.
	const addSlide = () =>
		slidesClientId
			? insertBlock(
					createBlock( 'gopublish/carousel-slide' ),
					slideCount,
					slidesClientId
				)
			: insertBlock(
					createBlock(
						'gopublish/carousel-slides',
						{ lock: { remove: true } },
						[ createBlock( 'gopublish/carousel-slide' ) ]
					),
					paginationIndex < 0 ? undefined : paginationIndex,
					clientId
				);
	const addText = ( name, blockAttributes, atStart ) =>
		insertBlock(
			createBlock( name, blockAttributes ),
			atStart || firstPartIndex < 0 ? 0 : firstPartIndex,
			clientId
		);
	const addPart = ( name, before ) =>
		insertBlock(
			createBlock( name ),
			slidesIndex < 0 ? undefined : slidesIndex + ( before ? 0 : 1 ),
			clientId
		);

	// Same classes and widths as the front end (render.php), so the front-end
	// styles apply in the editor too. Nothing here is saved.
	const blockProps = useBlockProps( {
		className: [
			`columns-${ layouts.base.columns }`,
			layouts.base.cutoff ? 'cutoff' : 'no-cutoff',
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
			// Only one Carousel Slides: see the filter in index.js.
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			renderAppender: false,
			layout: INNER_LAYOUT,
		}
	);

	return (
		<div { ...blockProps }>
			{ viewportCSS && <style>{ viewportCSS }</style> }
			<BlockControls group="block">
				<ToolbarDropdownMenu
					icon="plus-alt2"
					label={ __( 'Add to carousel', 'gopublish-carousel' ) }
					controls={ [
						{
							title: __( 'Slide', 'gopublish-carousel' ),
							icon: 'media-default',
							onClick: addSlide,
						},
						{
							title: __( 'Navigation', 'gopublish-carousel' ),
							icon: 'leftright',
							isDisabled: hasNavigation,
							onClick: () =>
								addPart(
									'gopublish/carousel-navigation',
									true
								),
						},
						{
							title: __( 'Pagination', 'gopublish-carousel' ),
							icon: 'ellipsis',
							isDisabled: hasPagination,
							onClick: () =>
								addPart(
									'gopublish/carousel-pagination',
									false
								),
						},
						{
							title: __( 'Heading', 'gopublish-carousel' ),
							icon: 'heading',
							onClick: () =>
								addText( 'core/heading', { level: 2 }, true ),
						},
						{
							title: __( 'Paragraph', 'gopublish-carousel' ),
							icon: 'editor-paragraph',
							onClick: () =>
								addText( 'core/paragraph', {}, false ),
						},
					] }
				/>
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
						'Describes the carousel for screen reader users, e.g. "Customer testimonials". With a label, the carousel becomes a landmark they can jump to. Leave empty to use the carousel\'s heading, if it has one.',
						'gopublish-carousel'
					) }
					value={ ariaLabel }
					onChange={ ( value ) =>
						setAttributes( { ariaLabel: value } )
					}
				/>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</div>
	);
}
