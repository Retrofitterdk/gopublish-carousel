// src/slide/save.js
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  const blockProps = useBlockProps.save({
    className: 'rp-carousel-slide'
  });
  return (
    <div {...blockProps}>
      <InnerBlocks.Content />
    </div>
  );
}