'use strict';

import Chart from 'chart.js';
import RoughLine from '../elements/element.roughLine';
import RoughPoint from '../elements/element.roughPoint';
import roughHelpers from '../helpers/helpers.rough';

var helpers = Chart.helpers;

var resolve = helpers.options.resolve;

var RadarController = Chart.controllers.radar;

export default RadarController.extend({

	datasetElementType: RoughLine,

	dataElementType: RoughPoint,

	// Ported from Chart.js 2.7.3. Modified for rough radar.
	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var line = meta.dataset;
		var points = meta.data;
		var custom = line.custom || {};
		var dataset = me.getDataset();
		var options = me.chart.options;
		var lineElementOptions = options.elements.line;
		var scale = me.chart.scale;

		// Compatibility: If the properties are defined with only the old name, use those values
		if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
			dataset.lineTension = dataset.tension;
		}

		helpers.extend(meta.dataset, {
			// Utility
			_datasetIndex: me.index,
			_scale: scale,
			// Data
			_children: points,
			_loop: true,
			// Model
			_model: helpers.merge({
				// Appearance
				tension: resolve([custom.tension, dataset.lineTension, lineElementOptions.tension]),
				backgroundColor: resolve([custom.backgroundColor, dataset.backgroundColor, lineElementOptions.backgroundColor]),
				borderWidth: resolve([custom.borderWidth, dataset.borderWidth, lineElementOptions.borderWidth]),
				borderColor: resolve([custom.borderColor, dataset.borderColor, lineElementOptions.borderColor]),
				fill: resolve([custom.fill, dataset.fill, lineElementOptions.fill]),
				borderCapStyle: resolve([custom.borderCapStyle, dataset.borderCapStyle, lineElementOptions.borderCapStyle]),
				borderDash: resolve([custom.borderDash, dataset.borderDash, lineElementOptions.borderDash]),
				borderDashOffset: resolve([custom.borderDashOffset, dataset.borderDashOffset, lineElementOptions.borderDashOffset]),
				borderJoinStyle: resolve([custom.borderJoinStyle, dataset.borderJoinStyle, lineElementOptions.borderJoinStyle])
			}, roughHelpers.resolve(dataset, options.plugins.rough))
		});

		meta.dataset.pivot();

		// Update Points
		helpers.each(points, function(point, index) {
			me.updateElement(point, index, reset);
		}, me);

		// Update bezier control points
		me.updateBezierControlPoints();
	},

	updateElement: function(point) {
		var me = this;

		RadarController.prototype.updateElement.apply(me, arguments);

		helpers.merge(point._model, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
	}
});
