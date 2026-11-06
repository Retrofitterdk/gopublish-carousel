import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

/**
 * Saves the inner blocks (the slides). The front end is rendered by
 * render.php, which ignores this markup and renders the slides itself.
 *
 * @return {Element} Saved block markup.
 */
export default function Save() {
	const blockProps = useBlockProps.save();
	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}
