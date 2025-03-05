// src/slide/edit.js
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();
  return (
    <div {...blockProps}>
      <InnerBlocks />
    </div>
  );
}