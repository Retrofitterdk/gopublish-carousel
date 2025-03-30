import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
  const { columns, autoplay, scroll } = attributes;
  const blockProps = useBlockProps({
    style: { '--columns': columns }, // Passing column count as a CSS variable
  });
  const CAROUSEL_TEMPLATE = [
    ['gopublish/carousel-slide', {} ],
    ['gopublish/carousel-slide', {} ],
    ['gopublish/carousel-slide', {} ],
];
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
          allowedBlocks={['gopublish/carousel-slide']}
          template={ CAROUSEL_TEMPLATE }
          templateLock={false}
          orientation="horizontal"
        />
      </div>
    </div>
  );
}