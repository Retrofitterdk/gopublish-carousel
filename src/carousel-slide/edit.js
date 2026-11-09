import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Edit() {
	// `carousel-slide` is an editor-only class (it isn't saved): it gives the
	// slide the same styles as the front-end slide wrapper from render.php,
	// so the carousel looks the same in the editor (see carousel editor.scss).
	const blockProps = useBlockProps( { className: 'carousel-slide' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return <div { ...innerBlocksProps } />;
}
