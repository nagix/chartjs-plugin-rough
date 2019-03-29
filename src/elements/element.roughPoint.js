'use strict';

import Chart from 'chart.js';
import rough from 'roughjs';
import roughHelpers from '../helpers/helpers.rough';

// For Chart.js 2.7.3 backward compatibility
var isPointInArea = Chart.helpers.canvas._isPointInArea || function(point, area) {
	var epsilon = 1e-6;

	return point.x > area.left - epsilon && point.x < area.right + epsilon &&
		point.y > area.top - epsilon && point.y < area.bottom + epsilon;
};

var Point = Chart.elements.Point;

export default Point.extend({

	// Ported from Chart.js 2.7.3. Modified for rough point.
	draw: function(chartArea) {
		var me = this;
		var vm = me._view;
		var chart = me._chart;
		var ctx = chart.ctx;
		var canvas = rough.canvas(chart.canvas);

		if (vm.skip || chartArea !== undefined && !isPointInArea(vm, chartArea)) {
			return;
		}

		roughHelpers.drawPoint(ctx, vm.pointStyle, vm.radius, vm.x, vm.y, vm.rotation, canvas, vm);
	}
});
