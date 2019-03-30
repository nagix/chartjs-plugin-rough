'use strict';

import Chart from 'chart.js';
import rough from 'roughjs';
import roughHelpers from '../helpers/helpers.rough';

var defaults = Chart.defaults;
var helpers = Chart.helpers;

// For Chart.js 2.7.1 backward compatibility
var layouts = Chart.layouts || Chart.layoutService;

var valueOrDefault = helpers.valueOrDefault;

// Ported from Chart.js 2.8.0. Modified for rough legend.
// Generates labels shown in the legend
defaults.global.legend.labels.generateLabels = function(chart) {
	var data = chart.data;
	return helpers.isArray(data.datasets) ? data.datasets.map(function(dataset, i) {
		return {
			text: dataset.label,
			fillStyle: helpers.valueAtIndexOrDefault(dataset.backgroundColor, 0),
			hidden: !chart.isDatasetVisible(i),
			lineCap: dataset.borderCapStyle,
			lineDash: dataset.borderDash,
			lineDashOffset: dataset.borderDashOffset,
			lineJoin: dataset.borderJoinStyle,
			lineWidth: dataset.borderWidth,
			strokeStyle: dataset.borderColor,
			pointStyle: dataset.pointStyle,
			rough: roughHelpers.resolve(dataset, chart.options.plugins.rough),

			// Below is extra data used for toggling the datasets
			datasetIndex: i
		};
	}, this) : [];
};

var RoughLegend = Chart.Legend.extend({

	draw: function() {
		var me = this;
		var globalDefaults = defaults.global;
		var each = helpers.each;
		var drawPoint = helpers.canvas.drawPoint;
		var canvas = rough.canvas(me.chart.canvas);
		var ctx = me.ctx;
		var roughOpts;

		helpers.each = function(loopable, fn) {
			each(loopable, function(legendItem) {
				roughOpts = helpers.extend({
					borderColor: valueOrDefault(legendItem.strokeStyle, globalDefaults.defaultColor),
					borderWidth: valueOrDefault(legendItem.lineWidth, globalDefaults.elements.line.borderWidth),
					backgroundColor: valueOrDefault(legendItem.fillStyle, globalDefaults.defaultColor)
				}, legendItem.rough);

				fn.apply(null, arguments);
			});
		};

		helpers.canvas.drawPoint = function(context, style, radius, x, y, rotation) {
			roughHelpers.drawPoint(context, style, radius, x, y, rotation, canvas, roughOpts);
		};

		ctx.strokeRect = function() {
			// noop
		};

		ctx.fillRect = function(x, y, width, height) {
			canvas.rectangle(x, y, width, height, roughHelpers.getFillOptions(roughOpts));
			if (roughOpts.borderWidth !== 0) {
				canvas.rectangle(x, y, width, height, roughHelpers.getStrokeOptions(roughOpts));
			}
		};

		Chart.Legend.prototype.draw.apply(me, arguments);

		helpers.each = each;
		helpers.canvas.drawPoint = drawPoint;
		delete ctx.fillRect;
		delete ctx.strokeRect;
	}
});

// Ported from Chart.js 2.8.0. Modified for rough legend.
function createNewLegendAndAttach(chart, legendOpts) {
	var legend = new RoughLegend({
		ctx: chart.ctx,
		options: legendOpts,
		chart: chart
	});

	layouts.configure(chart, legend, legendOpts);
	layouts.addBox(chart, legend);
	chart.legend = legend;
}

export default {
	id: 'legend',

	_element: RoughLegend,

	// Ported from Chart.js 2.8.0.
	beforeInit: function(chart) {
		var legendOpts = chart.options.legend;

		if (legendOpts) {
			createNewLegendAndAttach(chart, legendOpts);
		}
	},

	// Ported from Chart.js 2.8.0.
	beforeUpdate: function(chart) {
		var legendOpts = chart.options.legend;
		var legend = chart.legend;

		if (legendOpts) {
			helpers.mergeIf(legendOpts, defaults.global.legend);

			if (legend) {
				layouts.configure(chart, legend, legendOpts);
				legend.options = legendOpts;
			} else {
				createNewLegendAndAttach(chart, legendOpts);
			}
		} else if (legend) {
			layouts.removeBox(chart, legend);
			delete chart.legend;
		}
	},

	// Ported from Chart.js 2.8.0.
	afterEvent: function(chart, e) {
		var legend = chart.legend;
		if (legend) {
			legend.handleEvent(e);
		}
	}
};
