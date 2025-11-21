import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl, ToggleControl } from '@wordpress/components';
import { dispatch } from '@wordpress/data';

import './style.css';
import './editor.css';

// Import the Reading Progress Block
import './progress-block/index.js';

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
	{ label: __('Blur In', 'my-scroll-block'), value: 'blur-in' },
	{ label: __('3D Rotate In', 'my-scroll-block'), value: 'rotate-3d-in' },
	{ label: __('Circle Reveal', 'my-scroll-block'), value: 'circle-reveal' },
	{ label: __('Curtain Reveal', 'my-scroll-block'), value: 'curtain-reveal' },
	{ label: __('🔄 Fade In & Out', 'my-scroll-block'), value: 'fade-in-out' },
	{ label: __('🔄 Slide Up In & Out', 'my-scroll-block'), value: 'slide-up-in-out' },
	{ label: __('🔄 Scale In & Out', 'my-scroll-block'), value: 'scale-in-out' },
	{ label: __('🔄 Rotate In & Out', 'my-scroll-block'), value: 'rotate-in-out' },
	{ label: __('🔄 3D Rotate In & Out', 'my-scroll-block'), value: 'rotate-3d-in-out' },
];

const RANGE_OPTIONS = [
	{ label: __('Default (20% - 100%)', 'my-scroll-block'), value: 'default' },
	{ label: __('Quick (0% - 50%)', 'my-scroll-block'), value: 'quick' },
	{ label: __('Slow (10% - 100%)', 'my-scroll-block'), value: 'slow' },
	{ label: __('Late Start (50% - 100%)', 'my-scroll-block'), value: 'late' },
	{ label: __('Custom', 'my-scroll-block'), value: 'custom' },
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
			animationRange: {
				type: 'string',
				default: 'default',
			},
			animationEntryStart: {
				type: 'number',
				default: 20,
			},
			animationEntryEnd: {
				type: 'number',
				default: 100,
			},
			animationExitStart: {
				type: 'number',
				default: 0,
			},
			animationExitEnd: {
				type: 'number',
				default: 100,
			},
			parallaxEnabled: {
				type: 'boolean',
				default: false,
			},
			parallaxStrength: {
				type: 'number',
				default: 50,
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
			attributes: {
				animationType = 'none',
				animationRange = 'default',
				animationEntryStart = 20,
				animationEntryEnd = 100,
				animationExitStart = 0,
				animationExitEnd = 100,
				parallaxEnabled = false,
				parallaxStrength = 50,
			},
			setAttributes,
		} = props;

		const isInOutAnimation = animationType.includes('in-out');

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Scroll Animation', 'my-scroll-block')} initialOpen={true}>
						<SelectControl
							label={__('Animation Type', 'my-scroll-block')}
							value={animationType}
							options={ANIMATION_OPTIONS}
							onChange={(value) => setAttributes({ animationType: value })}
							help={
								animationType.includes('in-out')
									? __(
											'🔄 This animation plays on both entry and exit',
											'my-scroll-block'
										)
									: ''
							}
						/>

						{animationType !== 'none' && (
							<>
								<SelectControl
									label={__('Animation Timing', 'my-scroll-block')}
									value={animationRange}
									options={RANGE_OPTIONS}
									onChange={(value) => {
										const updates = { animationRange: value };
										// Set preset values
										if (value === 'quick') {
											updates.animationEntryStart = 0;
											updates.animationEntryEnd = 50;
										} else if (value === 'slow') {
											updates.animationEntryStart = 10;
											updates.animationEntryEnd = 100;
										} else if (value === 'late') {
											updates.animationEntryStart = 50;
											updates.animationEntryEnd = 100;
										} else if (value === 'default') {
											updates.animationEntryStart = 20;
											updates.animationEntryEnd = 100;
										}
										setAttributes(updates);
									}}
									help={__(
										'When should the animation start and finish',
										'my-scroll-block'
									)}
								/>

								{animationRange === 'custom' && (
									<>
										<RangeControl
											label={__('Entry Start (%)', 'my-scroll-block')}
											value={animationEntryStart}
											onChange={(value) =>
												setAttributes({ animationEntryStart: value })
											}
											min={0}
											max={100}
											step={5}
											help={__(
												'When to start the entry animation',
												'my-scroll-block'
											)}
										/>
										<RangeControl
											label={__('Entry End (%)', 'my-scroll-block')}
											value={animationEntryEnd}
											onChange={(value) =>
												setAttributes({ animationEntryEnd: value })
											}
											min={0}
											max={100}
											step={5}
											help={__(
												'When to complete the entry animation',
												'my-scroll-block'
											)}
										/>

										{isInOutAnimation && (
											<>
												<RangeControl
													label={__('Exit Start (%)', 'my-scroll-block')}
													value={animationExitStart}
													onChange={(value) =>
														setAttributes({ animationExitStart: value })
													}
													min={0}
													max={100}
													step={5}
													help={__(
														'When to start the exit animation',
														'my-scroll-block'
													)}
												/>
												<RangeControl
													label={__('Exit End (%)', 'my-scroll-block')}
													value={animationExitEnd}
													onChange={(value) =>
														setAttributes({ animationExitEnd: value })
													}
													min={0}
													max={100}
													step={5}
													help={__(
														'When to complete the exit animation',
														'my-scroll-block'
													)}
												/>
											</>
										)}
									</>
								)}
							</>
						)}


						<ToggleControl
							label={__('Enable Parallax Effect', 'my-scroll-block')}
							checked={parallaxEnabled}
							onChange={(value) => setAttributes({ parallaxEnabled: value })}
							help={__('Adds a parallax scrolling effect to the block background or content.', 'my-scroll-block')}
						/>

						{parallaxEnabled && (
							<RangeControl
								label={__('Parallax Strength', 'my-scroll-block')}
								value={parallaxStrength}
								onChange={(value) => setAttributes({ parallaxStrength: value })}
								min={10}
								max={200}
								step={10}
								help={__('Higher values create more movement.', 'my-scroll-block')}
							/>
						)}
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
		const {
			animationType = 'none',
			animationRange = 'default',
			animationEntryStart = 20,
			animationEntryEnd = 100,
			animationExitStart = 0,
			animationExitEnd = 100,
			parallaxEnabled = false,
			parallaxStrength = 50,
		} = attributes;

		if (animationType === 'none' && !parallaxEnabled) {
			return extraProps;
		}

		// Class & data attributes
		extraProps.className = [
			extraProps.className,
			'scroll-anim-block',
			`scroll-anim-${String(animationType).replace(/\s+/g, '-').toLowerCase()}`,
		]
			.filter(Boolean)
			.join(' ');

		extraProps['data-scroll-anim'] = '1';
		extraProps['data-anim-range'] = animationRange;

		// Add custom range values as data attributes if using custom range
		if (animationRange === 'custom') {
			extraProps['data-entry-start'] = animationEntryStart;
			extraProps['data-entry-end'] = animationEntryEnd;
			if (animationType.includes('in-out')) {
				extraProps['data-exit-start'] = animationExitStart;
				extraProps['data-exit-end'] = animationExitEnd;
			}
		}

		if (parallaxEnabled) {
			extraProps['data-parallax'] = '1';
			extraProps['data-parallax-strength'] = parallaxStrength;
			extraProps.style = {
				...extraProps.style,
				'--parallax-strength': `${parallaxStrength}px`,
			};
		}

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
				animationRange = 'default',
				animationEntryStart = 20,
				animationEntryEnd = 100,
				animationExitStart = 0,
				animationExitEnd = 100,
				parallaxEnabled = false,
				parallaxStrength = 50,
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
				extraProps['data-anim-range'] = animationRange;

				if (animationRange === 'custom') {
					extraProps['data-entry-start'] = animationEntryStart;
					extraProps['data-entry-end'] = animationEntryEnd;
					if (animationType.includes('in-out')) {
						extraProps['data-exit-start'] = animationExitStart;
						extraProps['data-exit-end'] = animationExitEnd;
					}
				}
			}


			if (parallaxEnabled) {
				extraProps['data-parallax'] = '1';
				extraProps['data-parallax-strength'] = parallaxStrength;
				extraProps.style = {
					...props.style,
					'--parallax-strength': `${parallaxStrength}px`,
				};
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
			const { animationType = 'none', parallaxEnabled = false } = props.attributes;

			if (animationType === 'none' && !parallaxEnabled) {
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
						title={__(
							'Scroll Animation Applied (click to open settings)',
							'my-scroll-block'
						)}
						role="button"
						tabIndex={0}
						onClick={handleActivate}
						onKeyDown={handleKeyDown}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
						</svg>
					</div>
				</div>
			);
		};
	}, 'withAnimationIndicator')
);

// No standalone block registration; this plugin extends core blocks only.
