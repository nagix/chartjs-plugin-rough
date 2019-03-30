'use strict';

import Chart from 'chart.js';
import RoughRectangle from '../elements/element.roughRectangle';
import roughHelpers from '../helpers/helpers.rough';

var BarController = Chart.controllers.bar;

export default BarController.extend({

	dataElementType: RoughRectangle,

	updateElement: function(rectangle) {
		var me = this;
		var model = {};

		Object.defineProperty(rectangle, '_model', {
			configurable: true,
			get: function() {
				return model;
			},
			set: function(value) {
				Chart.helpers.extend(model, value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
			}
		});

		BarController.prototype.updateElement.apply(me, arguments);

		delete rectangle._model;
		rectangle._model = model;
	}
});
