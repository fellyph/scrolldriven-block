import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';
import {
	PanelBody,
	ColorPicker,
	RangeControl,
	SelectControl,
	ToggleControl,
	BaseControl,
} from '@wordpress/components';

import './editor.css';
import './style.css';

const Edit = ({ attributes, setAttributes }) => {
	const { barColor, barHeight, position, backgroundColor, showPercentage } =
		attributes;
	const blockProps = useBlockProps();
	const instanceId = useInstanceId(Edit);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__('Progress Bar Settings', 'my-scroll-block')}
					initialOpen={true}
				>
					<SelectControl
						label={__('Position', 'my-scroll-block')}
						value={position}
						options={[
							{ label: __('Top', 'my-scroll-block'), value: 'top' },
							{ label: __('Bottom', 'my-scroll-block'), value: 'bottom' },
						]}
						onChange={(value) => setAttributes({ position: value })}
						help={__('Where to display the progress bar', 'my-scroll-block')}
					/>

					<RangeControl
						label={__('Bar Height (px)', 'my-scroll-block')}
						value={barHeight}
						onChange={(value) => setAttributes({ barHeight: value })}
						min={2}
						max={20}
						step={1}
					/>

					<BaseControl
						id={`progress-bar-color-${instanceId}`}
						label={__('Progress Bar Color', 'my-scroll-block')}
						className="color-picker-control"
					>
						<ColorPicker
							color={barColor}
							onChange={(value) => setAttributes({ barColor: value })}
							enableAlpha
						/>
					</BaseControl>

					<BaseControl
						id={`progress-bg-color-${instanceId}`}
						label={__('Background Color', 'my-scroll-block')}
						className="color-picker-control"
					>
						<ColorPicker
							color={backgroundColor}
							onChange={(value) => setAttributes({ backgroundColor: value })}
							enableAlpha
						/>
					</BaseControl>

					<ToggleControl
						label={__('Show Percentage', 'my-scroll-block')}
						checked={showPercentage}
						onChange={(value) => setAttributes({ showPercentage: value })}
						help={__('Display scroll percentage number', 'my-scroll-block')}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="reading-progress-preview">
					<div
						className="reading-progress-track"
						style={{
							height: `${barHeight}px`,
							backgroundColor,
							position: 'relative',
							overflow: 'hidden',
							borderRadius: '2px',
						}}
					>
						<div
							className="reading-progress-bar"
							style={{
								height: '100%',
								backgroundColor: barColor,
								width: '60%',
								transition: 'width 0.3s ease',
							}}
						/>
					</div>
					<div className="reading-progress-info">
						<p>
							<strong>📊 {__('Reading Progress Bar', 'my-scroll-block')}</strong>
						</p>
						<p>
							{__('Position:', 'my-scroll-block')}{' '}
							<em>
								{position === 'top'
									? __('Top', 'my-scroll-block')
									: __('Bottom', 'my-scroll-block')}
							</em>
						</p>
						<p>
							{__('This bar will be fixed at the', 'my-scroll-block')}{' '}
							{position === 'top'
								? __('top', 'my-scroll-block')
								: __('bottom', 'my-scroll-block')}{' '}
							{__(
								'of the page and track scroll progress using CSS scroll timeline.',
								'my-scroll-block'
							)}
						</p>
						{showPercentage && (
							<p>
								<em>✓ {__('Percentage display enabled', 'my-scroll-block')}</em>
							</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

const Save = ({ attributes }) => {
	const { barColor, barHeight, position, backgroundColor, showPercentage } = attributes;
	const blockProps = useBlockProps.save({
		className: `reading-progress-container position-${position}`,
		style: {
			'--progress-bar-color': barColor,
			'--progress-bar-height': `${barHeight}px`,
			'--progress-bg-color': backgroundColor,
		},
	});

	return (
		<div {...blockProps}>
			<div className="reading-progress-track">
				<div className="reading-progress-bar" />
			</div>
			{showPercentage && (
				<div className="reading-progress-percentage">
					<span className="percentage-value">0%</span>
				</div>
			)}
		</div>
	);
};

registerBlockType('my-scroll-block/reading-progress', {
	edit: Edit,
	save: Save,
});
