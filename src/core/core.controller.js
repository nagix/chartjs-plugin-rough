'use strict';

import Chart from 'chart.js';

var helpers = Chart.helpers;

// For Chart.js 2.7.3 backward compatibility
helpers.canvas = helpers.canvas || {};
helpers.canvas._isPointInArea = helpers.canvas._isPointInArea || function(point, area) {
	var epsilon = 1e-6; // 1e-6 is margin in pixels for accumulated error.

	return point.x > area.left - epsilon && point.x < area.right + epsilon &&
		point.y > area.top - epsilon && point.y < area.bottom + epsilon;
};

export default Chart;
