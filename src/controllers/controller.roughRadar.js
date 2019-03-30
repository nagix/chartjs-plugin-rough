'use strict';

import Chart from 'chart.js';
import RoughLine from '../elements/element.roughLine';
import RoughPoint from '../elements/element.roughPoint';
import roughHelpers from '../helpers/helpers.rough';

var extend = Chart.helpers.extend;

var RadarController = Chart.controllers.radar;

export default RadarController.extend({

	datasetElementType: RoughLine,

	dataElementType: RoughPoint,

	update: function() {
		var me = this;
		var line = me.getMeta().dataset;
		var model = {};

		Object.defineProperty(line, '_model', {
			configurable: true,
			get: function() {
				return model;
			},
			set: function(value) {
				extend(model, value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
			}
		});

		RadarController.prototype.update.apply(me, arguments);

		delete line._model;
		line._model = model;
	},

	updateElement: function(point) {
		var me = this;

		RadarController.prototype.updateElement.apply(me, arguments);

		extend(point._model, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
	}
});
