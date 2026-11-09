import {
	InspectorControls,
	PanelColorSettings,
	// The spacing sizes control core uses for padding; only available under
	// its experimental name.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalSpacingSizesControl as SpacingSizesControl,
	useBlockEditContext,
	useBlockProps,
	withColors,
} from '@wordpress/block-editor';
import {
	Button,
	Flex,
	FlexItem,
	PanelBody,
	RangeControl,
	// Needed to add settings to the Dimensions panel, as core blocks do;
	// WordPress 7.1 only ships it under its experimental name.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { RawHTML, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { getButtonStyles } from './button-styles';
import IconPicker from './icon-picker';

import {
	scrollCarousel,
	useCarouselTrack,
} from '../carousel/use-carousel-track';

/**
 * The default arrow (gopublish_carousel_navigation_icon() in PHP), in a 24px
 * canvas like the registry's icons. Previous mirrors it via CSS.
 *
 * @return {Element} SVG icon.
 */
function ArrowIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="-5 -5 24 24"
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

/**
 * Whether an icon points back (left), judging by its name, e.g.
 * 'core/chevron-left' or 'core/previous': it's then mirrored the other way
 * round, so Next still points forward. Mirrors
 * gopublish_carousel_icon_points_back() in PHP.
 *
 * @param {string|undefined} name Namespaced icon name.
 * @return {boolean} Whether it points back.
 */
function pointsBack( name ) {
	return /(^|[/-])(left|previous|back)(-|$)/.test( name ?? '' );
}

/**
 * The navigation in the editor: the same buttons as on the front end. They
 * scroll the carousel's slides and rewind at the ends like on the front end
 * (Rewind at the end comes from the Carousel through the block context).
 * While all slides fit, the buttons are dimmed instead of hidden, so the
 * block can still be selected.
 *
 * The Icon panel picks the buttons' icon from the icon registry (WordPress
 * 7.1+); without a registry, it isn't shown and the default arrow is used.
 * The Color panel (Icon, Background and their hover colours), the Border
 * settings and Button padding and Icon size (in the Dimensions panel) style
 * the buttons.
 *
 * @param {Object}                       props                     Block props.
 * @param {Object}                       props.attributes          Block attributes.
 * @param {(attributes: Object) => void} props.setAttributes       Updates attributes.
 * @param {string}                       props.clientId            Block client ID.
 * @param {Object}                       props.context             Block context.
 * @param {Object}                       props.iconColor           Icon colour (withColors).
 * @param {(color: string) => void}      props.setIconColor        Sets it.
 * @param {Object}                       props.iconHoverColor      Icon colour on hover.
 * @param {(color: string) => void}      props.setIconHoverColor   Sets it.
 * @param {Object}                       props.buttonColor         Background colour.
 * @param {(color: string) => void}      props.setButtonColor      Sets it.
 * @param {Object}                       props.buttonHoverColor    Background colour on hover.
 * @param {(color: string) => void}      props.setButtonHoverColor Sets it.
 * @return {Element} Editor markup.
 */
function Edit( {
	attributes,
	setAttributes,
	clientId,
	context,
	iconColor,
	setIconColor,
	iconHoverColor,
	setIconHoverColor,
	buttonColor,
	setButtonColor,
	buttonHoverColor,
	setButtonHoverColor,
} ) {
	const { icon, buttonPadding, iconSize } = attributes;
	const [ isPickerOpen, setIsPickerOpen ] = useState( false );
	const { hasIconRegistry, iconRecord } = useSelect(
		( select ) => {
			const core = select( 'core' );
			const registry = !! core.getEntityConfig?.( 'root', 'icon' );
			return {
				hasIconRegistry: registry,
				iconRecord:
					registry && icon
						? core.getEntityRecord( 'root', 'icon', icon )
						: null,
			};
		},
		[ icon ]
	);
	// The chosen icon's SVG, or the default arrow (also while it loads, or if
	// the icon is no longer registered: the front end falls back the same way).
	const iconElement = iconRecord?.content ? (
		<RawHTML>{ iconRecord.content }</RawHTML>
	) : (
		<ArrowIcon />
	);

	const ref = useRef();
	const rewind = context[ 'gopublish-carousel/rewind' ] ?? true;
	const { track, canScroll, atStart, atEnd } = useCarouselTrack( ref );
	// The layout support's classes (flex, justification). The editor only
	// adds them to blocks with inner blocks (through useInnerBlocksProps), so
	// this block adds them itself, like core does on the front end.
	const { __unstableLayoutClassNames: layoutClassNames } =
		useBlockEditContext();
	const blockProps = useBlockProps( {
		ref,
		className: [
			'navigation-container',
			pointsBack( icon ) ? 'has-backward-icon' : '',
			layoutClassNames,
			canScroll ? '' : 'is-inactive',
		]
			.filter( Boolean )
			.join( ' ' ),
		// The Color and Border settings style the buttons (block.json skips
		// adding them to the wrapper), like render.php does.
		style: getButtonStyles( attributes ),
	} );

	const scroll = ( direction ) =>
		scrollCarousel( track, direction, { rewind, atStart, atEnd } );

	return (
		<div { ...blockProps }>
			{ hasIconRegistry && (
				<InspectorControls>
					<PanelBody title={ __( 'Icon', 'gopublish-carousel' ) }>
						<Flex align="center" justify="flex-start">
							<FlexItem className="gopublish-carousel-icon-preview">
								{ iconElement }
							</FlexItem>
							<FlexItem>
								<Button
									__next40pxDefaultSize
									variant="secondary"
									onClick={ () => setIsPickerOpen( true ) }
								>
									{ __(
										'Choose icon',
										'gopublish-carousel'
									) }
								</Button>
							</FlexItem>
							{ icon && (
								<FlexItem>
									<Button
										__next40pxDefaultSize
										variant="tertiary"
										onClick={ () =>
											setAttributes( { icon: undefined } )
										}
									>
										{ __( 'Reset', 'gopublish-carousel' ) }
									</Button>
								</FlexItem>
							) }
						</Flex>
					</PanelBody>
				</InspectorControls>
			) }
			<InspectorControls group="dimensions">
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Button padding', 'gopublish-carousel' ) }
					hasValue={ () => !! buttonPadding }
					onDeselect={ () =>
						setAttributes( { buttonPadding: undefined } )
					}
					resetAllFilter={ () => ( { buttonPadding: undefined } ) }
					isShownByDefault
				>
					<SpacingSizesControl
						label={ __( 'Button padding', 'gopublish-carousel' ) }
						values={ buttonPadding }
						onChange={ ( values ) =>
							setAttributes( {
								buttonPadding: Object.values(
									values ?? {}
								).some( ( value ) => value !== undefined )
									? values
									: undefined,
							} )
						}
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Icon size', 'gopublish-carousel' ) }
					hasValue={ () => iconSize !== undefined }
					onDeselect={ () =>
						setAttributes( { iconSize: undefined } )
					}
					resetAllFilter={ () => ( { iconSize: undefined } ) }
					isShownByDefault
				>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Icon size', 'gopublish-carousel' ) }
						help={ __( 'In pixels.', 'gopublish-carousel' ) }
						value={ iconSize ?? 24 }
						min={ 12 }
						max={ 96 }
						onChange={ ( value ) =>
							setAttributes( { iconSize: value } )
						}
					/>
				</ToolsPanelItem>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelColorSettings
					__experimentalIsRenderedInSidebar
					title={ __( 'Color', 'gopublish-carousel' ) }
					colorSettings={ [
						{
							label: __( 'Icon', 'gopublish-carousel' ),
							value: iconColor.color,
							onChange: setIconColor,
						},
						{
							label: __( 'Background', 'gopublish-carousel' ),
							value: buttonColor.color,
							onChange: setButtonColor,
						},
						{
							label: __(
								'Icon (hover & focus)',
								'gopublish-carousel'
							),
							value: iconHoverColor.color,
							onChange: setIconHoverColor,
						},
						{
							label: __(
								'Background (hover & focus)',
								'gopublish-carousel'
							),
							value: buttonHoverColor.color,
							onChange: setButtonHoverColor,
						},
					] }
				/>
			</InspectorControls>
			{ isPickerOpen && (
				<IconPicker
					value={ icon }
					onChange={ ( name ) => setAttributes( { icon: name } ) }
					onClose={ () => setIsPickerOpen( false ) }
				/>
			) }
			<button
				type="button"
				className="carousel-prev"
				aria-label={ __( 'Previous slide', 'gopublish-carousel' ) }
				aria-disabled={ ! canScroll || ( ! rewind && atStart ) }
				onClick={ () => scroll( -1 ) }
			>
				{ iconElement }
			</button>
			<button
				type="button"
				className="carousel-next"
				aria-label={ __( 'Next slide', 'gopublish-carousel' ) }
				aria-disabled={ ! canScroll || ( ! rewind && atEnd ) }
				onClick={ () => scroll( 1 ) }
			>
				{ iconElement }
			</button>
		</div>
	);
}

export default withColors(
	'iconColor',
	'iconHoverColor',
	'buttonColor',
	'buttonHoverColor'
)( Edit );
