import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { dispatch } from '@wordpress/data';

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
      attributes: { animationType = 'none' },
      setAttributes,
    } = props;

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Scroll Animation', 'my-scroll-block')} initialOpen={true}>
            <SelectControl
              label={__('Animation Type', 'my-scroll-block')}
              value={animationType}
              options={ANIMATION_OPTIONS}
              onChange={(value) => setAttributes({ animationType: value })}
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
    const { animationType = 'none' } = attributes;
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
      const { animationType = 'none' } = props.attributes;
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
      }
      return <BlockListBlock {...props} {...extraProps} />;
    };
  }, 'withListExtraProps')
);

function openBlockInspector(clientId) {
  try {
    // Ensure the block is selected
    dispatch('core/block-editor').selectBlock(clientId);
  } catch (e) {}
  try {
    // Post editor (classic block editor screen)
    dispatch('core/edit-post').openGeneralSidebar('edit-post/block');
  } catch (e) {}
  try {
    // Site editor (FSE)
    dispatch('core/edit-site').openGeneralSidebar('edit-site/block-inspector');
  } catch (e) {}
}

// 5) Add animation indicator icon to blocks with animations and make it clickable.
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

      const handleActivate = (event) => {
        event.preventDefault();
        event.stopPropagation();
        openBlockInspector(props.clientId);
      };

      const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          handleActivate(event);
        }
      };

      return (
        <div className="scroll-anim-indicator-wrapper">
          <BlockListBlock {...props} />
          <div
            className="scroll-anim-indicator"
            title={__('Scroll Animation Applied (click to open settings)', 'my-scroll-block')}
            role="button"
            tabIndex={0}
            onClick={handleActivate}
            onKeyDown={handleKeyDown}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
      );
    };
  }, 'withAnimationIndicator')
);

// No standalone block registration; this plugin extends core blocks only.
