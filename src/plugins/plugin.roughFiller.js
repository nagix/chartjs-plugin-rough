'use strict';

import Chart from '../core/core.controller.js';
import rough from 'roughjs';
import roughHelpers from '../helpers/helpers.rough';

var helpers = Chart.helpers;

var FillerPlugin = Chart.plugins.getAll().filter(function(plugin) {
	return plugin.id === 'filler';
})[0];

// Ported from Chart.js 2.7.3.
function isDrawable(point) {
	return point && !point.skip;
}

// Ported from Chart.js 2.7.3. Modified for rough filler.
function drawArea(curve0, curve1, len0, len1) {
	var path, i;

	if (!len0 || !len1) {
		return;
	}

	// building first area curve (normal)
	path = 'M' + curve0[0].x + ' ' + curve0[0].y;
	for (i = 1; i < len0; ++i) {
		path += roughHelpers.lineTo(curve0[i - 1], curve0[i]);
	}

	// joining the two area curves
	path += 'L' + curve1[len1 - 1].x + ' ' + curve1[len1 - 1].y;

	// building opposite area curve (reverse)
	for (i = len1 - 1; i > 0; --i) {
		path += roughHelpers.lineTo(curve1[i], curve1[i - 1], true);
	}

	return path;
}

// Ported from Chart.js 2.7.3. Modified for rough filler.
function doFill(chart, points, mapper, view, color, loop) {
	var count = points.length;
	var span = view.spanGaps;
	var curve0 = [];
	var curve1 = [];
	var len0 = 0;
	var len1 = 0;
	var canvas = rough.canvas(chart.canvas);
	var path = '';
	var i, ilen, index, p0, p1, d0, d1;

	for (i = 0, ilen = (count + !!loop); i < ilen; ++i) {
		index = i % count;
		p0 = points[index]._view;
		p1 = mapper(p0, index, view);
		d0 = isDrawable(p0);
		d1 = isDrawable(p1);

		if (d0 && d1) {
			len0 = curve0.push(p0);
			len1 = curve1.push(p1);
		} else if (len0 && len1) {
			if (!span) {
				path += drawArea(curve0, curve1, len0, len1);
				len0 = len1 = 0;
				curve0 = [];
				curve1 = [];
			} else {
				if (d0) {
					curve0.push(p0);
				}
				if (d1) {
					curve1.push(p1);
				}
			}
		}
	}

	path += drawArea(curve0, curve1, len0, len1);

	canvas.path(path, roughHelpers.getFillOptions(view));
}

export default helpers.merge({}, [FillerPlugin, {
	// Ported from Chart.js 2.7.3.
	beforeDatasetDraw: function(chart, args) {
		var meta = args.meta.$filler;
		if (!meta) {
			return;
		}

		var ctx = chart.ctx;
		var el = meta.el;
		var view = el._view;
		var points = el._children || [];
		var mapper = meta.mapper;
		var color = view.backgroundColor || Chart.defaults.global.defaultColor;

		if (mapper && color && points.length) {
			helpers.canvas.clipArea(ctx, chart.chartArea);
			doFill(chart, points, mapper, view, color, el._loop);
			helpers.canvas.unclipArea(ctx);
		}
	}
}]);
