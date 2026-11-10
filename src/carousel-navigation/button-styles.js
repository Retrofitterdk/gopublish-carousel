/**
 * The Carousel Navigation block's colour and border settings as the buttons'
 * custom properties (style.scss). Mirrors
 * gopublish_carousel_navigation_button_styles() in gopublish-carousel.php:
 * keep them in sync.
 */
import { getCSSValueFromRawStyle } from '@wordpress/style-engine';

const SIDES = [ 'top', 'right', 'bottom', 'left' ];
const CORNERS = [ 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ];
const BORDER_DEFAULTS = { color: 'currentcolor', style: 'solid', width: '0' };

/**
 * A colour or border value as CSS: preset references become custom
 * properties.
 *
 * @param {string|number|undefined} value Attribute value.
 * @return {string} CSS value, or an empty string if unset.
 */
function cssValue( value ) {
	if ( typeof value !== 'string' && typeof value !== 'number' ) {
		return '';
	}
	return String( getCSSValueFromRawStyle( String( value ).trim() ) );
}

/**
 * A preset colour slug as a preset reference.
 *
 * @param {string|undefined} slug Colour slug.
 * @return {string|undefined} Reference, e.g. 'var:preset|color|accent-1'.
 */
function preset( slug ) {
	return slug ? `var:preset|color|${ slug }` : undefined;
}

/**
 * Join per-side or per-corner values, with a default for unset ones.
 *
 * @param {string[]} values       CSS values ('' when unset).
 * @param {string}   defaultValue Value for unset ones.
 * @return {string} Space-separated values, or '' if none is set.
 */
function joinValues( values, defaultValue ) {
	return values.some( Boolean )
		? values.map( ( value ) => value || defaultValue ).join( ' ' )
		: '';
}

/**
 * A colour setting as CSS, from a pair of attributes made by withColors(): a
 * palette slug (name, e.g. 'iconColor') or a custom colour ('custom' + name).
 * Mirrors gopublish_carousel_color_attribute() in PHP.
 *
 * @param {Object} attributes Block attributes.
 * @param {string} name       Attribute name of the palette slug.
 * @return {string} CSS value, or an empty string if unset.
 */
export function getColorAttribute( attributes, name ) {
	return cssValue(
		preset( attributes[ name ] ) ??
			attributes[
				`custom${ name.charAt( 0 ).toUpperCase() }${ name.slice( 1 ) }`
			]
	);
}

/**
 * Custom properties for the buttons, for the wrapper's style.
 *
 * @param {Object} attributes Block attributes (the colour attributes,
 *                            buttonPadding, iconSize, borderColor and style).
 * @return {Object} Custom properties.
 */
export function getButtonStyles( attributes ) {
	const { borderColor, style = {} } = attributes;
	const border = style.border ?? {};
	const color = ( name ) => getColorAttribute( attributes, name );

	const icon = color( 'iconColor' );
	const background = color( 'buttonColor' );
	// Without hover colours, hovering swaps the icon and background colours.
	const backgroundHover = color( 'buttonHoverColor' ) || icon;
	const iconHover = color( 'iconHoverColor' ) || ( icon ? background : '' );

	const properties = Object.fromEntries(
		Object.entries( {
			'--nav-button-icon-color': icon,
			'--nav-button-background': background,
			'--nav-button-icon-color-hover': iconHover,
			'--nav-button-background-hover': backgroundHover,
			'--nav-button-outline-color': backgroundHover,
		} ).filter( ( [ , value ] ) => value )
	);

	// Space between the icon and the button's edge, per side, and the icon's
	// size in pixels.
	SIDES.forEach( ( side ) => {
		const value = cssValue( attributes.buttonPadding?.[ side ] );
		if ( value ) {
			properties[ `--nav-button-padding-${ side }` ] = value;
		}
	} );
	if ( typeof attributes.iconSize === 'number' ) {
		properties[ '--nav-button-icon-size' ] = `${ Math.max(
			8,
			Math.min( 128, Math.round( attributes.iconSize ) )
		) }px`;
	}

	const values = {};
	Object.entries( BORDER_DEFAULTS ).forEach( ( [ feature, fallback ] ) => {
		const linked = cssValue(
			( feature === 'color' ? preset( borderColor ) : undefined ) ??
				border[ feature ]
		);
		const value =
			linked ||
			joinValues(
				SIDES.map( ( side ) =>
					cssValue( border[ side ]?.[ feature ] )
				),
				fallback
			);
		if ( value ) {
			values[ feature ] = value;
		}
	} );
	// A colour or style without a width: a thin border, so it shows.
	if ( Object.keys( values ).length && ! values.width ) {
		values.width = '1px';
	}
	Object.entries( values ).forEach( ( [ feature, value ] ) => {
		properties[ `--nav-button-border-${ feature }` ] = value;
	} );

	const radius =
		border.radius && typeof border.radius === 'object'
			? joinValues(
					CORNERS.map( ( corner ) =>
						cssValue( border.radius[ corner ] )
					),
					'0'
				)
			: cssValue( border.radius );
	if ( radius ) {
		properties[ '--nav-button-radius' ] = radius;
	}

	return properties;
}
