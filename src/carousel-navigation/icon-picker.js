import { Button, Modal, SearchControl, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { RawHTML, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * A dialog for choosing an icon from the icon registry (WordPress 7.1+): all
 * registered icons (core's and any collections themes or plugins add), with
 * a search on name and label. The same data as core's Icon block, whose own
 * picker isn't available to plugins.
 *
 * @param {Object}                 props          Props.
 * @param {string}                 props.value    The chosen icon's name, e.g. "core/next".
 * @param {(name: string) => void} props.onChange Called with the chosen icon's name.
 * @param {() => void}             props.onClose  Closes the dialog.
 * @return {Element} The dialog.
 */
export default function IconPicker( { value, onChange, onClose } ) {
	const [ search, setSearch ] = useState( '' );
	const { icons, isResolved } = useSelect(
		( select ) => ( {
			icons: select( 'core' ).getEntityRecords( 'root', 'icon' ),
			isResolved: select( 'core' ).hasFinishedResolution(
				'getEntityRecords',
				[ 'root', 'icon' ]
			),
		} ),
		[]
	);

	const shown = useMemo( () => {
		const term = search.trim().toLowerCase();
		return ( icons ?? [] ).filter(
			( icon ) =>
				! term ||
				icon.name.toLowerCase().includes( term ) ||
				( icon.label ?? '' ).toLowerCase().includes( term )
		);
	}, [ icons, search ] );

	return (
		<Modal
			title={ __( 'Choose icon', 'gopublish-carousel' ) }
			onRequestClose={ onClose }
			size="large"
			className="gopublish-carousel-icon-picker"
		>
			<SearchControl
				__nextHasNoMarginBottom
				value={ search }
				onChange={ setSearch }
				label={ __( 'Search icons', 'gopublish-carousel' ) }
			/>
			<p className="gopublish-carousel-icon-picker__help">
				{ __(
					'Previous and Next show the icon mirrored: left- and right-pointing icons both work.',
					'gopublish-carousel'
				) }
			</p>
			{ ! isResolved && <Spinner /> }
			{ isResolved && ! shown.length && (
				<p>{ __( 'No icons found.', 'gopublish-carousel' ) }</p>
			) }
			<div className="gopublish-carousel-icon-picker__grid">
				{ shown.map( ( icon ) => (
					<Button
						key={ icon.name }
						className="gopublish-carousel-icon-picker__icon"
						label={ icon.label || icon.name }
						showTooltip
						isPressed={ icon.name === value }
						onClick={ () => {
							onChange( icon.name );
							onClose();
						} }
					>
						<RawHTML>{ icon.content }</RawHTML>
					</Button>
				) ) }
			</div>
		</Modal>
	);
}
