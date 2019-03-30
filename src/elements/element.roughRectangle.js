'use strict';

import Chart from 'chart.js';
import rough from 'roughjs';
import roughHelpers from '../helpers/helpers.rough';


// Ported from Chart.js 2.8.0. Modified for rough rectangle.
function getBarBounds(vm) {
	var x = vm.x;
	var y = vm.y;
	var width = vm.width;
	var base = vm.base;
	var half;

	if (width !== undefined) {
		half = width / 2;
		return {
			l: x - half,
			r: x + half,
			t: Math.min(y, base),
			b: Math.max(y, base)
		};
	}
	half = vm.height / 2;
	return {
		l: Math.min(x, base),
		r: Math.max(x, base),
		t: y - half,
		b: y + half
	};
}

// Ported from Chart.js 2.8.0. Modified for rough rectangle.
function parseBorderSkipped(vm) {
	var edge = vm.borderSkipped;
	var base = vm.base;
	var res = {};

	if (!edge) {
		return res;
	}

	if (vm.horizontal) {
		if (base > vm.x) {
			edge = edge === 'left' ? 'right' : edge === 'right' ? 'left' : edge;
		}
	} else if (base < vm.y) {
		edge = edge === 'bottom' ? 'top' : edge === 'top' ? 'bottom' : edge;
	}

	res[edge] = true;
	return res;
}

// Ported from Chart.js 2.8.0. Modified for rough rectangle.
function parseBorderWidth(vm, maxW, maxH) {
	var value = vm.borderWidth;
	var skip = parseBorderSkipped(vm);
	var top, right, bottom, left;

	if (Chart.helpers.isObject(value)) {
		top = +value.top || 0;
		right = +value.right || 0;
		bottom = +value.bottom || 0;
		left = +value.left || 0;
	} else {
		top = right = bottom = left = +value || 0;
	}

	return {
		t: skip.top || (top < 0) ? 0 : top > maxH ? maxH : top,
		r: skip.right || (right < 0) ? 0 : right > maxW ? maxW : right,
		b: skip.bottom || (bottom < 0) ? 0 : bottom > maxH ? maxH : bottom,
		l: skip.left || (left < 0) ? 0 : left > maxW ? maxW : left
	};
}

var Rectangle = Chart.elements.Rectangle;

export default Rectangle.extend({

	// Ported from Chart.js 2.8.0. Modified for rough rectangle.
	draw: function() {
		var me = this;
		var vm = me._view;
		var bounds = getBarBounds(vm);
		var border = parseBorderWidth(vm, (bounds.r - bounds.l) / 2, (bounds.b - bounds.t) / 2);
		var left = bounds.l + border.l / 2;
		var top = bounds.t + border.t / 2;
		var right = bounds.r - border.r / 2;
		var bottom = bounds.b - border.b / 2;
		var canvas = rough.canvas(me._chart.canvas);
		var fillOptions = roughHelpers.getFillOptions(vm);
		var strokeOptions = roughHelpers.getStrokeOptions(vm);

		canvas.rectangle(left, top, right - left, bottom - top, fillOptions);
		if (border.l) {
			strokeOptions.strokeWidth = border.l;
			canvas.line(left, bottom, left, top, strokeOptions);
		}
		if (border.t) {
			strokeOptions.strokeWidth = border.t;
			canvas.line(left, top, right, top, strokeOptions);
		}
		if (border.r) {
			strokeOptions.strokeWidth = border.r;
			canvas.line(right, top, right, bottom, strokeOptions);
		}
		if (border.b) {
			strokeOptions.strokeWidth = border.b;
			canvas.line(right, bottom, left, bottom, strokeOptions);
		}
	}
});
