import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';

import './style.css';
import './editor.css';

/**
 * Internal dependencies
 */
const SUPPORTED_BLOCKS = [
  'core/image',
  'core/paragraph',
  'core/columns',
  'core/group',
  'core/heading',
];

const ANIMATION_OPTIONS = [
  { label: __('None', 'my-scroll-block'), value: 'none' },
  { label: __('Fade In', 'my-scroll-block'), value: 'fade-in' },
  { label: __('Slide In Left', 'my-scroll-block'), value: 'slide-in-left' },
  { label: __('Slide In Right', 'my-scroll-block'), value: 'slide-in-right' },
  { label: __('Slide In Up', 'my-scroll-block'), value: 'slide-in-up' },
  { label: __('Slide In Down', 'my-scroll-block'), value: 'slide-in-down' },
  { label: __('Scale Up', 'my-scroll-block'), value: 'scale-up' },
  { label: __('Rotate In', 'my-scroll-block'), value: 'rotate-in' },
];

const COVER_OPTIONS = [
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '100%', value: 100 },
];

// 1) Extend attributes for supported blocks.
addFilter('blocks.registerBlockType', 'my-scroll-block/extend-attributes', (settings, name) => {
  if (!SUPPORTED_BLOCKS.includes(name)) {
    return settings;
  }
  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      animationType: {
        type: 'string',
        default: 'none',
      },
      animationCover: {
        type: 'number',
        default: 80,
      },
    },
  };
});

// 2) Inject InspectorControls.
const withAnimationControls = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    if (!SUPPORTED_BLOCKS.includes(props.name)) {
      return <BlockEdit {...props} />;
    }
    const {
      attributes: { animationType = 'none', animationCover = 80 },
      setAttributes,
    } = props;

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Scroll Animation', 'my-scroll-block')} initialOpen={false}>
            <SelectControl
              label={__('Animation Type', 'my-scroll-block')}
              value={animationType}
              options={ANIMATION_OPTIONS}
              onChange={(value) => setAttributes({ animationType: value })}
            />
            <SelectControl
              label={__('Cover', 'my-scroll-block')}
              help={__(
                'How much of the element must be covered to complete the animation',
                'my-scroll-block'
              )}
              value={animationCover}
              options={COVER_OPTIONS}
              onChange={(value) => setAttributes({ animationCover: Number(value) })}
            />
          </PanelBody>
        </InspectorControls>
        <BlockEdit {...props} />
      </>
    );
  };
}, 'withAnimationControls');

addFilter('editor.BlockEdit', 'my-scroll-block/with-controls', withAnimationControls);

// 3) Add classes/styles to the saved content markup.
addFilter(
  'blocks.getSaveContent.extraProps',
  'my-scroll-block/save-props',
  (extraProps, blockType, attributes) => {
    if (!SUPPORTED_BLOCKS.includes(blockType.name)) {
      return extraProps;
    }
    const { animationType = 'none', animationCover = 80 } = attributes;
    if (animationType === 'none') {
      return extraProps;
    }

    // Class & data attribute
    extraProps.className = [
      extraProps.className,
      'scroll-anim-block',
      `scroll-anim-${String(animationType).replace(/\s+/g, '-').toLowerCase()}`,
    ]
      .filter(Boolean)
      .join(' ');

    extraProps['data-scroll-anim'] = '1';

    // Inline CSS variable for cover only (percentage)
    const styleVars = `--anim-cover:${Number(animationCover)}%;`;
    extraProps.style = extraProps.style ? `${extraProps.style};${styleVars}` : styleVars;

    return extraProps;
  }
);

// 4) Also reflect classes/attributes in the editor canvas for live preview.
addFilter(
  'editor.BlockListBlock',
  'my-scroll-block/list-props',
  createHigherOrderComponent((BlockListBlock) => {
    return (props) => {
      if (!SUPPORTED_BLOCKS.includes(props.name)) {
        return <BlockListBlock {...props} />;
      }
      const { animationType = 'none', animationCover = 80 } = props.attributes;
      const extraProps = {};
      if (animationType !== 'none') {
        extraProps.className = [
          props.className,
          'scroll-anim-block',
          `scroll-anim-${String(animationType).replace(/\s+/g, '-').toLowerCase()}`,
        ]
          .filter(Boolean)
          .join(' ');
        extraProps['data-scroll-anim'] = '1';
        extraProps.style = {
          ...(props.style || {}),
          '--anim-cover': `${Number(animationCover)}%`,
        };
      }
      return <BlockListBlock {...props} {...extraProps} />;
    };
  }, 'withListExtraProps')
);

// 5) Add animation indicator icon to blocks with animations.
addFilter(
  'editor.BlockListBlock',
  'my-scroll-block/animation-indicator',
  createHigherOrderComponent((BlockListBlock) => {
    return (props) => {
      if (!SUPPORTED_BLOCKS.includes(props.name)) {
        return <BlockListBlock {...props} />;
      }
      const { animationType = 'none' } = props.attributes;

      if (animationType === 'none') {
        return <BlockListBlock {...props} />;
      }

      return (
        <div className="scroll-anim-indicator-wrapper">
          <BlockListBlock {...props} />
          <div
            className="scroll-anim-indicator"
            title={__('Scroll Animation Applied', 'my-scroll-block')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
      );
    };
  }, 'withAnimationIndicator')
);

// No standalone block registration; this plugin extends core blocks only.
