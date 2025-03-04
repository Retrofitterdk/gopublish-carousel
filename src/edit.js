import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, RangeControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
  const { columns, autoplay, loop, scroll } = attributes;
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title="Carousel Settings">
          <RangeControl
            label="Columns"
            value={columns}
            onChange={(value) => setAttributes({ columns: value })}
            min={1}
            max={6}
          />
          <RangeControl
            label="Slides to Scroll"
            value={scroll}
            onChange={(value) => setAttributes({ scroll: value })}
            min={1}
            max={columns}
          />
        </PanelBody>
      </InspectorControls>
      
      <div className="carousel-container">
        <InnerBlocks
          allowedBlocks={['core/group']}
          template={[['core/group', {}]]}
          templateLock={false}
          orientation="horizontal"
        />
      </div>
    </div>
  );
}