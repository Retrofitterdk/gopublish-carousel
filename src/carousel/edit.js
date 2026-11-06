import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const ALLOWED_BLOCKS = [ 'gopublish/carousel-slide' ];
const TEMPLATE = [
	[ 'gopublish/carousel-slide', {} ],
	[ 'gopublish/carousel-slide', {} ],
	[ 'gopublish/carousel-slide', {} ],
];

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

export default function Edit( { attributes, setAttributes } ) {
	const { columns, scroll, cutoff, mobileWidth, ariaLabel } = attributes;
	const maxScroll = getMaxScroll( columns, cutoff );

	// Keep "Slides to scroll" within the limit when columns or cutoff change.
	const updateLayout = ( changes ) => {
		const next = { columns, cutoff, ...changes };
		const nextMax = getMaxScroll( next.columns, next.cutoff );
		setAttributes( {
			...changes,
			scroll: Math.min( scroll, nextMax ),
		} );
	};

	const blockProps = useBlockProps( {
		// Column count for the editor grid (editor.scss).
		style: { '--columns': columns },
	} );

	return (
		<div { ...blockProps }>
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

			<div className="carousel-container">
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					template={ TEMPLATE }
					templateLock={ false }
					orientation="horizontal"
				/>
			</div>
		</div>
	);
}
