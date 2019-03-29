'use strict';

import Chart from 'chart.js';
import RoughArc from '../elements/element.roughArc';
import roughHelpers from '../helpers/helpers.rough';

var helpers = Chart.helpers;

var resolve = helpers.options.resolve;

// Ported from Chart.js 2.7.3. Modified for rough polarArea.
Chart.defaults.polarArea.legend.labels.generateLabels = function(chart) {
	var data = chart.data;
	if (data.labels.length && data.datasets.length) {
		return data.labels.map(function(label, i) {
			var meta = chart.getDatasetMeta(0);
			var ds = data.datasets[0];
			var arc = meta.data[i];
			var custom = arc.custom || {};
			var options = chart.options;
			var arcOpts = options.elements.arc;
			var fill = resolve([custom.backgroundColor, ds.backgroundColor, arcOpts.backgroundColor], undefined, i);
			var stroke = resolve([custom.borderColor, ds.borderColor, arcOpts.borderColor], undefined, i);
			var bw = resolve([custom.borderWidth, ds.borderWidth, arcOpts.borderWidth], undefined, i);

			return {
				text: label,
				fillStyle: fill,
				strokeStyle: stroke,
				lineWidth: bw,
				hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
				rough: roughHelpers.resolve(ds, options.plugins.rough),

				// Extra data used for toggling the correct item
				index: i
			};
		});
	}
	return [];
};

var PolarAreaController = Chart.controllers.polarArea;

export default PolarAreaController.extend({

	dataElementType: RoughArc,

	updateElement: function(arc) {
		var me = this;
		var model = {};

		Object.defineProperty(arc, '_model', {
			configurable: true,
			get: function() {
				return model;
			},
			set: function(value) {
				Chart.helpers.merge(model, [value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough)]);
			}
		});

		PolarAreaController.prototype.updateElement.apply(me, arguments);

		delete arc._model;
		arc._model = model;
	}
});
