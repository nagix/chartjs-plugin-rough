'use strict';

import Chart from '../core/core.controller.js';
import rough from 'roughjs';
import roughHelpers from '../helpers/helpers.rough';

var Arc = Chart.elements.Point;

export default Arc.extend({

	// Ported from Chart.js 2.7.3. Modified for rough point.
	draw: function(chartArea) {
		var me = this;
		var vm = me._view;
		var chart = me._chart;
		var ctx = chart.ctx;
		var canvas = rough.canvas(chart.canvas);

		if (vm.skip) {
			return;
		}

		// Clipping for Points.
		if (chartArea === undefined || Chart.helpers.canvas._isPointInArea(vm, chartArea)) {
			roughHelpers.drawPoint(ctx, vm.pointStyle, vm.radius, vm.x, vm.y, vm.rotation, canvas, vm);
		}
	}
});
