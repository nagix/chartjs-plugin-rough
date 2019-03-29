'use strict';

import Chart from 'chart.js';
import RoughLine from '../elements/element.roughLine';
import RoughPoint from '../elements/element.roughPoint';
import roughHelpers from '../helpers/helpers.rough';

var helpers = Chart.helpers;

var LineController = Chart.controllers.line;

export default LineController.extend({

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
				helpers.merge(model, [value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough)]);
			}
		});

		LineController.prototype.update.apply(me, arguments);

		delete line._model;
		line._model = model;
	},

	updateElement: function(point) {
		var me = this;

		LineController.prototype.updateElement.apply(me, arguments);

		helpers.merge(point._model, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
	}
});
