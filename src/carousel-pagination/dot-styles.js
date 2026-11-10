/**
 * The Carousel Pagination block's settings as the dots' custom properties
 * (style.scss). Mirrors gopublish_carousel_pagination_styles() in
 * gopublish-carousel.php: keep them in sync.
 */
import { getColorAttribute } from '../carousel-navigation/button-styles';

/**
 * Clamp a number of pixels.
 *
 * @param {number} value Value.
 * @param {number} min   Minimum.
 * @param {number} max   Maximum.
 * @return {string} CSS length.
 */
function pixels( value, min, max ) {
	return `${ Math.max( min, Math.min( max, Math.round( value ) ) ) }px`;
}

/**
 * Custom properties for the dots, for the wrapper's style.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Custom properties.
 */
export function getPaginationStyles( attributes ) {
	const properties = {};
	const dot = getColorAttribute( attributes, 'dotColor' );
	if ( dot ) {
		// A chosen colour is shown as is, not faded.
		properties[ '--pagination-dot-color' ] = dot;
		properties[ '--pagination-dot-opacity' ] = '1';
	}
	const current = getColorAttribute( attributes, 'currentDotColor' );
	if ( current ) {
		properties[ '--pagination-dot-current-color' ] = current;
	}
	if ( typeof attributes.dotSize === 'number' ) {
		properties[ '--pagination-dot-size' ] = pixels(
			attributes.dotSize,
			4,
			32
		);
	}
	if ( typeof attributes.dotSpacing === 'number' ) {
		properties[ '--pagination-dot-spacing' ] = pixels(
			attributes.dotSpacing,
			0,
			48
		);
	}
	return properties;
}
