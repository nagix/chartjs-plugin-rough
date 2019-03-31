'use strict';

import Chart from 'chart.js';
import rough from 'roughjs';
import roughHelpers from '../helpers/helpers.rough';

var Line = Chart.elements.Line;

export default Line.extend({

	// Ported from Chart.js 2.8.0. Modified for rough line.
	draw: function() {
		var me = this;
		var vm = me._view;
		var spanGaps = vm.spanGaps;
		var points = me._children.slice(); // clone array
		var lastDrawnIndex = -1;
		var index, current, previous, currentVM;
		var canvas = rough.canvas(me._chart.canvas);
		var path = '';

		// If we are looping, adding the first point again
		if (me._loop && points.length) {
			points.push(points[0]);
		}

		// Stroke Line
		lastDrawnIndex = -1;

		for (index = 0; index < points.length; ++index) {
			current = points[index];
			previous = Chart.helpers.previousItem(points, index);
			currentVM = current._view;

			// First point moves to it's starting position no matter what
			if (index === 0) {
				if (!currentVM.skip) {
					path += 'M' + currentVM.x + ' ' + currentVM.y;
					lastDrawnIndex = index;
				}
			} else {
				previous = lastDrawnIndex === -1 ? previous : points[lastDrawnIndex];

				if (!currentVM.skip) {
					if ((lastDrawnIndex !== (index - 1) && !spanGaps) || lastDrawnIndex === -1) {
						// There was a gap and this is the first point after the gap
						path += 'M' + currentVM.x + ' ' + currentVM.y;
					} else {
						// Line to next point
						path += roughHelpers.lineTo(previous._view, current._view);
					}
					lastDrawnIndex = index;
				}
			}
		}

		canvas.path(path, roughHelpers.getStrokeOptions(vm));
	}
});
