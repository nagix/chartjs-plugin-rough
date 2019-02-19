'use strict';

import Chart from '../core/core.controller.js';
import rough from 'roughjs';
import roughHelpers from '../helpers/helpers.rough';

var Rectangle = Chart.elements.Rectangle;

export default Rectangle.extend({

	// Ported from Chart.js 2.7.3. Modified for rough rectangle.
	draw: function() {
		var me = this;
		var vm = me._view;
		var left, right, top, bottom, signX, signY, borderSkipped;
		var borderWidth = vm.borderWidth;
		var canvas = rough.canvas(me._chart.canvas);

		if (!vm.horizontal) {
			// bar
			left = vm.x - vm.width / 2;
			right = vm.x + vm.width / 2;
			top = vm.y;
			bottom = vm.base;
			signX = 1;
			signY = bottom > top ? 1 : -1;
			borderSkipped = vm.borderSkipped || 'bottom';
		} else {
			// horizontal bar
			left = vm.base;
			right = vm.x;
			top = vm.y - vm.height / 2;
			bottom = vm.y + vm.height / 2;
			signX = right > left ? 1 : -1;
			signY = 1;
			borderSkipped = vm.borderSkipped || 'left';
		}

		// Canvas doesn't allow us to stroke inside the width so we can
		// adjust the sizes to fit if we're setting a stroke on the line
		if (borderWidth) {
			// borderWidth shold be less than bar width and bar height.
			var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
			borderWidth = borderWidth > barSize ? barSize : borderWidth;
			var halfStroke = borderWidth / 2;
			// Adjust borderWidth when bar top position is near vm.base(zero).
			var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
			var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
			var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
			var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
			// not become a vertical line?
			if (borderLeft !== borderRight) {
				top = borderTop;
				bottom = borderBottom;
			}
			// not become a horizontal line?
			if (borderTop !== borderBottom) {
				left = borderLeft;
				right = borderRight;
			}
		}

		// Corner points, from bottom-left to bottom-right clockwise
		// | 1 2 |
		// | 0 3 |
		var corners = [
			[left, bottom],
			[left, top],
			[right, top],
			[right, bottom]
		];

		// Find first (starting) corner with fallback to 'bottom'
		var borders = ['bottom', 'left', 'top', 'right'];
		var startCorner = borders.indexOf(borderSkipped, 0);
		if (startCorner === -1) {
			startCorner = 0;
		}

		function cornerAt(index) {
			return corners[(startCorner + index) % 4];
		}

		canvas.rectangle(
			corners[1][0], corners[1][1], corners[3][0] - corners[1][0], corners[3][1] - corners[1][1],
			roughHelpers.getFillOptions(vm));

		if (borderWidth) {
			var corner = cornerAt(0);
			for (var i = 1; i < 4; i++) {
				var nextCorner = cornerAt(i);
				canvas.line(corner[0], corner[1], nextCorner[0], nextCorner[1], roughHelpers.getStrokeOptions(vm));
				corner = nextCorner;
			}
		}
	}
});
