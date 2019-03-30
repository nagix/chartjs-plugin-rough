'use strict';

import Chart from 'chart.js';
import RoughPoint from '../elements/element.roughPoint';
import roughHelpers from '../helpers/helpers.rough';

var BubbleController = Chart.controllers.bubble;

export default BubbleController.extend({

	dataElementType: RoughPoint,

	updateElement: function(point) {
		var me = this;
		var model = {};

		Object.defineProperty(point, '_model', {
			configurable: true,
			get: function() {
				return model;
			},
			set: function(value) {
				Chart.helpers.extend(model, value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
			}
		});

		BubbleController.prototype.updateElement.apply(me, arguments);

		delete point._model;
		point._model = model;
	}
});
