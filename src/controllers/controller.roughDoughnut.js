'use strict';

import Chart from '../core/core.controller.js';
import RoughArc from '../elements/element.roughArc';
import roughHelpers from '../helpers/helpers.rough';

var defaults = Chart.defaults;
var helpers = Chart.helpers;

var resolve = helpers.options.resolve;

// Ported from Chart.js 2.7.3. Modified for rough doughnut.
defaults.doughnut.legend.labels.generateLabels = defaults.pie.legend.labels.generateLabels = function(chart) {
	var data = chart.data;
	if (data.labels.length && data.datasets.length) {
		return data.labels.map(function(label, i) {
			var meta = chart.getDatasetMeta(0);
			var ds = data.datasets[0];
			var arc = meta.data[i];
			var custom = arc && arc.custom || {};
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

var DoughnutController = Chart.controllers.doughnut;

export default DoughnutController.extend({

	dataElementType: RoughArc,

	// Ported from Chart.js 2.7.3. Modified for rough doughnut.
	updateElement: function(arc, index, reset) {
		var me = this;
		var chart = me.chart;
		var chartArea = chart.chartArea;
		var opts = chart.options;
		var animationOpts = opts.animation;
		var centerX = (chartArea.left + chartArea.right) / 2;
		var centerY = (chartArea.top + chartArea.bottom) / 2;
		var startAngle = opts.rotation; // non reset case handled later
		var endAngle = opts.rotation; // non reset case handled later
		var dataset = me.getDataset();
		var circumference = reset && animationOpts.animateRotate ? 0 : arc.hidden ? 0 : me.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI));
		var innerRadius = reset && animationOpts.animateScale ? 0 : me.innerRadius;
		var outerRadius = reset && animationOpts.animateScale ? 0 : me.outerRadius;

		helpers.extend(arc, {
			// Utility
			_datasetIndex: me.index,
			_index: index,

			// Desired view properties
			_model: {
				x: centerX + chart.offsetX,
				y: centerY + chart.offsetY,
				startAngle: startAngle,
				endAngle: endAngle,
				circumference: circumference,
				outerRadius: outerRadius,
				innerRadius: innerRadius,
				label: helpers.valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
			}
		});

		var model = arc._model;

		// Resets the visual styles
		var custom = arc.custom || {};
		var elementOpts = opts.elements.arc;
		model.backgroundColor = resolve([custom.backgroundColor, dataset.backgroundColor, elementOpts.backgroundColor], undefined, index);
		model.borderColor = resolve([custom.borderColor, dataset.borderColor, elementOpts.borderColor], undefined, index);
		model.borderWidth = resolve([custom.borderWidth, dataset.borderWidth, elementOpts.borderWidth], undefined, index);

		helpers.merge(model, roughHelpers.resolve(dataset, opts.plugins.rough));

		// Set correct angles if not resetting
		if (!reset || !animationOpts.animateRotate) {
			if (index === 0) {
				model.startAngle = opts.rotation;
			} else {
				model.startAngle = me.getMeta().data[index - 1]._model.endAngle;
			}

			model.endAngle = model.startAngle + model.circumference;
		}

		arc.pivot();
	}
});
