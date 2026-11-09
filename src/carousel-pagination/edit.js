import {
	InspectorControls,
	PanelColorSettings,
	useBlockEditContext,
	useBlockProps,
	withColors,
} from '@wordpress/block-editor';
import {
	RangeControl,
	// Needed to add settings to the Dimensions panel, as core blocks do;
	// WordPress 7.1 only ships it under its experimental name.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { getPaginationStyles } from './dot-styles';

import { getPages, getScrollDirection } from '../carousel/pages';
import { useCarouselTrack } from '../carousel/use-carousel-track';

/**
 * The pagination in the editor: the same dots as on the front end, one per
 * page of the carousel, following its scroll position. Clicking a dot
 * scrolls there. While all slides fit, the dots are dimmed instead of
 * hidden, so the block can still be selected.
 *
 * The Color panel (Dots, Current dot) and Dot size and Dot spacing (in the
 * Dimensions panel) style the dots.
 *
 * @param {Object}                       props                    Block props.
 * @param {Object}                       props.attributes         Block attributes.
 * @param {(attributes: Object) => void} props.setAttributes      Updates attributes.
 * @param {string}                       props.clientId           Block client ID.
 * @param {Object}                       props.dotColor           Dots colour (withColors).
 * @param {(color: string) => void}      props.setDotColor        Sets it.
 * @param {Object}                       props.currentDotColor    Current dot colour.
 * @param {(color: string) => void}      props.setCurrentDotColor Sets it.
 * @return {Element} Editor markup.
 */
function Edit( {
	attributes,
	setAttributes,
	clientId,
	dotColor,
	setDotColor,
	currentDotColor,
	setCurrentDotColor,
} ) {
	const { dotSize, dotSpacing } = attributes;
	const ref = useRef();
	const { track, canScroll } = useCarouselTrack( ref );
	const [ pages, setPages ] = useState( {
		count: 1,
		current: 0,
		targets: [ 0 ],
		step: 0,
	} );

	// Re-measure when the slides scroll, resize or change.
	useEffect( () => {
		if ( ! track ) {
			return;
		}
		const update = () => setPages( getPages( track ) );
		update();
		const view = track.ownerDocument.defaultView;
		const resizeObserver = new view.ResizeObserver( update );
		resizeObserver.observe( track );
		const mutationObserver = new view.MutationObserver( update );
		mutationObserver.observe( track, { childList: true } );
		track.addEventListener( 'scroll', update, { passive: true } );
		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			track.removeEventListener( 'scroll', update );
		};
	}, [ track ] );

	// The layout support's classes (see Carousel Navigation's edit.js).
	const { __unstableLayoutClassNames: layoutClassNames } =
		useBlockEditContext();
	const blockProps = useBlockProps( {
		ref,
		className: [
			'carousel-pagination',
			layoutClassNames,
			canScroll ? '' : 'is-inactive',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: getPaginationStyles( attributes ),
	} );

	const goTo = ( page ) => {
		if ( ! track ) {
			return;
		}
		const reduceMotion = track.ownerDocument.defaultView.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		track.scrollTo( {
			left:
				getScrollDirection( track ) *
				pages.targets[ page ] *
				pages.step,
			behavior: reduceMotion ? 'auto' : 'smooth',
		} );
	};

	return (
		<div { ...blockProps }>
			<InspectorControls group="dimensions">
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Dot size', 'gopublish-carousel' ) }
					hasValue={ () => dotSize !== undefined }
					onDeselect={ () => setAttributes( { dotSize: undefined } ) }
					resetAllFilter={ () => ( { dotSize: undefined } ) }
					isShownByDefault
				>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Dot size', 'gopublish-carousel' ) }
						help={ __( 'In pixels.', 'gopublish-carousel' ) }
						value={ dotSize ?? 10 }
						min={ 4 }
						max={ 32 }
						onChange={ ( value ) =>
							setAttributes( { dotSize: value } )
						}
					/>
				</ToolsPanelItem>
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Dot spacing', 'gopublish-carousel' ) }
					hasValue={ () => dotSpacing !== undefined }
					onDeselect={ () =>
						setAttributes( { dotSpacing: undefined } )
					}
					resetAllFilter={ () => ( { dotSpacing: undefined } ) }
					isShownByDefault
				>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Dot spacing', 'gopublish-carousel' ) }
						help={ __(
							'In pixels. Dots stay at least 24 pixels apart, centre to centre, so they are easy to tap.',
							'gopublish-carousel'
						) }
						value={ dotSpacing ?? 14 }
						min={ 0 }
						max={ 48 }
						onChange={ ( value ) =>
							setAttributes( { dotSpacing: value } )
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
							label: __( 'Dots', 'gopublish-carousel' ),
							value: dotColor.color,
							onChange: setDotColor,
						},
						{
							label: __( 'Current dot', 'gopublish-carousel' ),
							value: currentDotColor.color,
							onChange: setCurrentDotColor,
						},
					] }
				/>
			</InspectorControls>
			{ pages.targets.map( ( target, page ) => (
				<button
					key={ page }
					type="button"
					className="carousel-dot"
					aria-label={ sprintf(
						/* translators: Label of a pagination dot. %d: Number of the first slide it scrolls to. */
						__( 'Go to slide %d', 'gopublish-carousel' ),
						target + 1
					) }
					aria-current={ page === pages.current }
					onClick={ () => goTo( page ) }
				/>
			) ) }
		</div>
	);
}

export default withColors( 'dotColor', 'currentDotColor' )( Edit );
