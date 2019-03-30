'use strict';

import Chart from 'chart.js';
import RoughTooltip from '../core/core.roughTooltip';
import RoughBarController from '../controllers/controller.roughBar';
import RoughBubbleController from '../controllers/controller.roughBubble';
import RoughDoughnutController from '../controllers/controller.roughDoughnut';
import RoughHorizontalBarController from '../controllers/controller.roughHorizontalBar';
import RoughLineController from '../controllers/controller.roughLine';
import RoughPolarAreaController from '../controllers/controller.roughPolarArea';
import RoughRadarController from '../controllers/controller.roughRadar';
import RoughFillerPlugin from './plugin.roughFiller';
import RoughLegendPlugin from './plugin.roughLegend';

// For Chart.js 2.7.1 backward compatibility
var layouts = Chart.layouts || Chart.layoutService;

var plugins = Chart.plugins;

Chart.defaults.global.plugins.rough = {
	roughness: 1,
	bowing: 1,
	fillStyle: 'hachure',
	fillWeight: 0.5,
	hachureAngle: -41,
	hachureGap: 4,
	curveStepCount: 9,
	simplification: 0
};

var roughControllers = {
	bar: RoughBarController,
	bubble: RoughBubbleController,
	doughnut: RoughDoughnutController,
	horizontalBar: RoughHorizontalBarController,
	line: RoughLineController,
	polarArea: RoughPolarAreaController,
	pie: RoughDoughnutController,
	radar: RoughRadarController,
	scatter: RoughLineController
};

// Ported from Chart.js 2.8.0. Modified for style controllers.
function buildOrUpdateControllers() {
	var me = this;
	var newControllers = [];

	Chart.helpers.each(me.data.datasets, function(dataset, datasetIndex) {
		var meta = me.getDatasetMeta(datasetIndex);
		var type = dataset.type || me.config.type;

		if (meta.type && meta.type !== type) {
			me.destroyDatasetMeta(datasetIndex);
			meta = me.getDatasetMeta(datasetIndex);
		}
		meta.type = type;

		if (meta.controller) {
			meta.controller.updateIndex(datasetIndex);
			meta.controller.linkScales();
		} else {
			var ControllerClass = roughControllers[meta.type];
			if (ControllerClass === undefined) {
				throw new Error('"' + meta.type + '" is not a chart type.');
			}

			meta.controller = new ControllerClass(me, datasetIndex);
			newControllers.push(meta.controller);
		}
	}, me);

	return newControllers;
}

// Ported from Chart.js 2.8.0. Modified for style tooltip.
function initToolTip() {
	var me = this;
	me.tooltip = new RoughTooltip({
		_chart: me,
		_chartInstance: me, // deprecated, backward compatibility
		_data: me.data,
		_options: me.options.tooltips
	}, me);
}

var descriptors = plugins.descriptors;

plugins.descriptors = function(chart) {
	var rough = chart._rough;

	// Replace filler/legend plugins with rough filler/legend plugins
	if (rough) {
		// chart._plugins for Chart.js 2.7.1 backward compatibility
		var cache = chart.$plugins || chart._plugins || (chart.$plugins = chart._plugins = {});
		if (cache.id === this._cacheId) {
			return cache.descriptors;
		}

		var p = this._plugins;
		var result;

		this._plugins = p.map(function(plugin) {
			if (plugin.id === 'filler') {
				return RoughFillerPlugin;
			} else if (plugin.id === 'legend') {
				return RoughLegendPlugin;
			}
			return plugin;
		});
	}

	result = descriptors.apply(this, arguments);

	if (rough) {
		this._plugins = p;
	}

	return result;
};

export default {
	id: 'rough',

	beforeInit: function(chart) {
		chart._rough = {};

		chart.buildOrUpdateControllers = buildOrUpdateControllers;
		chart.initToolTip = initToolTip;

		// Remove the existing legend if exists
		if (chart.legend) {
			layouts.removeBox(chart, chart.legend);
			delete chart.legend;
		}

		// Invalidate plugin cache and create new one
		delete chart.$plugins;
		// For Chart.js 2.7.1 backward compatibility
		delete chart._plugins;
		plugins.descriptors(chart);
	}
};
