'use strict';

import Chart from 'chart.js';
import RoughRectangle from '../elements/element.roughRectangle';
import roughHelpers from '../helpers/helpers.rough';

var helpers = Chart.helpers;

var resolve = helpers.options.resolve;

var BarController = Chart.controllers.bar;

export default BarController.extend({

	dataElementType: RoughRectangle,

	// Ported from Chart.js 2.7.3. Modified for rough bar.
	updateElement: function(rectangle, index, reset) {
		var me = this;
		var chart = me.chart;
		var meta = me.getMeta();
		var dataset = me.getDataset();
		var custom = rectangle.custom || {};
		var options = chart.options;
		var rectangleOptions = options.elements.rectangle;

		rectangle._xScale = me.getScaleForId(meta.xAxisID);
		rectangle._yScale = me.getScaleForId(meta.yAxisID);
		rectangle._datasetIndex = me.index;
		rectangle._index = index;

		rectangle._model = helpers.merge({
			datasetLabel: dataset.label,
			label: chart.data.labels[index],
			borderSkipped: helpers.valueOrDefault(custom.borderSkipped, rectangleOptions.borderSkipped),
			backgroundColor: resolve([custom.backgroundColor, dataset.backgroundColor, rectangleOptions.backgroundColor], undefined, index),
			borderColor: resolve([custom.borderColor, dataset.borderColor, rectangleOptions.borderColor], undefined, index),
			borderWidth: resolve([custom.borderWidth, dataset.borderWidth, rectangleOptions.borderWidth], undefined, index)
		}, roughHelpers.resolve(dataset, options.plugins.rough));

		me.updateElementGeometry(rectangle, index, reset);

		rectangle.pivot();
	}
});
