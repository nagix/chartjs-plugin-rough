'use strict';

import Chart from 'chart.js';
import RoughLine from '../elements/element.roughLine';
import RoughPoint from '../elements/element.roughPoint';
import roughHelpers from '../helpers/helpers.rough';

var helpers = Chart.helpers;

var valueOrDefault = helpers.valueOrDefault;
var resolve = helpers.options.resolve;

var LineController = Chart.controllers.line;

// Ported from Chart.js 2.7.3.
function lineEnabled(dataset, options) {
	return valueOrDefault(dataset.showLine, options.showLines);
}

export default LineController.extend({

	datasetElementType: RoughLine,

	dataElementType: RoughPoint,

	// Ported from Chart.js 2.7.3. Modified for rough line.
	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var line = meta.dataset;
		var points = meta.data || [];
		var options = me.chart.options;
		var lineElementOptions = options.elements.line;
		var scale = me.getScaleForId(meta.yAxisID);
		var i, ilen, custom;
		var dataset = me.getDataset();
		var showLine = lineEnabled(dataset, options);

		// Update Line
		if (showLine) {
			custom = line.custom || {};

			// Compatibility: If the properties are defined with only the old name, use those values
			if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
				dataset.lineTension = dataset.tension;
			}

			// Utility
			line._scale = scale;
			line._datasetIndex = me.index;
			// Data
			line._children = points;
			// Model
			line._model = helpers.merge({
				// Appearance
				// The default behavior of lines is to break at null values, according
				// to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
				// This option gives lines the ability to span gaps
				spanGaps: valueOrDefault(dataset.spanGaps, options.spanGaps),
				tension: resolve([custom.tension, dataset.lineTension, lineElementOptions.tension]),
				backgroundColor: resolve([custom.backgroundColor, dataset.backgroundColor, lineElementOptions.backgroundColor]),
				borderWidth: resolve([custom.borderWidth, dataset.borderWidth, lineElementOptions.borderWidth]),
				borderColor: resolve([custom.borderColor, dataset.borderColor, lineElementOptions.borderColor]),
				borderCapStyle: resolve([custom.borderCapStyle, dataset.borderCapStyle, lineElementOptions.borderCapStyle]),
				borderDash: resolve([custom.borderDash, dataset.borderDash, lineElementOptions.borderDash]),
				borderDashOffset: resolve([custom.borderDashOffset, dataset.borderDashOffset, lineElementOptions.borderDashOffset]),
				borderJoinStyle: resolve([custom.borderJoinStyle, dataset.borderJoinStyle, lineElementOptions.borderJoinStyle]),
				fill: resolve([custom.fill, dataset.fill, lineElementOptions.fill]),
				steppedLine: resolve([custom.steppedLine, dataset.steppedLine, lineElementOptions.stepped]),
				cubicInterpolationMode: resolve([custom.cubicInterpolationMode, dataset.cubicInterpolationMode, lineElementOptions.cubicInterpolationMode])
			}, roughHelpers.resolve(dataset, options.plugins.rough));

			line.pivot();
		}

		// Update Points
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			me.updateElement(points[i], i, reset);
		}

		if (showLine && line._model.tension !== 0) {
			me.updateBezierControlPoints();
		}

		// Now pivot the point for animation
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			points[i].pivot();
		}
	},

	updateElement: function(point) {
		var me = this;

		LineController.prototype.updateElement.apply(me, arguments);

		helpers.merge(point._model, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
	}
});
