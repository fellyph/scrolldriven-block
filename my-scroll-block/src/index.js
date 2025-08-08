/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor. All other files
 * get applied to the editor only.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './style.scss';
import './editor.scss';

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
      animationDelay: {
        type: 'number',
        default: 0,
      },
      animationDisplacement: {
        type: 'number',
        default: 20,
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
      attributes: { animationType = 'none', animationDelay = 0, animationDisplacement = 20 },
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
            <TextControl
              label={__('Delay (ms)', 'my-scroll-block')}
              type="number"
              min={0}
              value={animationDelay}
              onChange={(value) => setAttributes({ animationDelay: Number(value) || 0 })}
            />
            <TextControl
              label={__('Displacement (px)', 'my-scroll-block')}
              type="number"
              min={0}
              max={100}
              value={animationDisplacement}
              onChange={(value) => setAttributes({ animationDisplacement: Number(value) || 0 })}
            />
            {/* No duration control; duration is driven by scroll timeline */}
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
    const { animationType = 'none', animationDelay = 0, animationDisplacement = 20 } = attributes;
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

    // Inline CSS variables for timing
    const styleVars = `--anim-delay:${Number(animationDelay)}ms;--anim-displacement:${Number(
      animationDisplacement
    )}px;`;
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
      const {
        animationType = 'none',
        animationDelay = 0,
        animationDisplacement = 20,
      } = props.attributes;
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
          '--anim-delay': `${Number(animationDelay)}ms`,
          '--anim-displacement': `${Number(animationDisplacement)}px`,
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
