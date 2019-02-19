'use strict';

import Chart from 'chart.js';

import RoughBarController from '../controllers/controller.roughBar';
import RoughBubbleController from '../controllers/controller.roughBubble';
import RoughDoughnutController from '../controllers/controller.roughDoughnut';
import RoughHorizontalBarController from '../controllers/controller.roughHorizontalBar';
import RoughLineController from '../controllers/controller.roughLine';
import RoughPolarAreaController from '../controllers/controller.roughPolarArea';
import RoughRadarController from '../controllers/controller.roughRadar';

import RoughFillerPlugin from './plugin.roughFiller';
import RoughLegendPlugin from './plugin.roughLegend';

var controllers = Chart.controllers;
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

var descriptors = plugins.descriptors;

plugins.descriptors = function(chart) {
	var rough = chart._rough;

	if (rough) {
		var cache = chart.$plugins || (chart.$plugins = {});
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

		chart.buildOrUpdateControllers = function() {
			var result;

			Chart.controllers = roughControllers;
			result = Chart.prototype.buildOrUpdateControllers.apply(this, arguments);
			Chart.controllers = controllers;

			return result;
		};

		if (chart.legend) {
			Chart.layouts.removeBox(chart, chart.legend);
			delete chart.legend;
		}
	}
};
