'use strict';

import Chart from 'chart.js';
import rough from 'roughjs';
import roughHelpers from '../helpers/helpers.rough';

var helpers = Chart.helpers;

/**
 * Ported from Chart.js 2.7.3.
 *
 * Helper method to merge the opacity into a color
 * For Chart.js 2.7.3 backward compatibility
 */
function mergeOpacity(colorString, opacity) {
	// opacity is not used in Chart.js 2.8 or later
	if (opacity === undefined) {
		return colorString;
	}
	var color = helpers.color(colorString);
	return color.alpha(opacity * color.alpha()).rgbaString();
}

var Tooltip = Chart.Tooltip;

export default Tooltip.extend({

	update: function() {
		var me = this;
		var roughOptions = [];
		var model;

		Tooltip.prototype.update.apply(me, arguments);

		model = me._model;
		if (me._active.length) {
			helpers.each(model.dataPoints, function(tooltipItem) {
				var meta = me._chart.getDatasetMeta(tooltipItem.datasetIndex);
				var activeElement = meta.data[tooltipItem.index];
				var view = activeElement._view;

				roughOptions.push({
					fillOptions: roughHelpers.getFillOptions(view),
					strokeOptions: roughHelpers.getStrokeOptions(view)
				});
			});
			model.rough = roughOptions;
		}

		return me;
	},

	drawBody: function(pt, vm, ctx, opacity) {
		var me = this;
		var bodyFontSize = vm.bodyFontSize;
		var body = vm.body;
		var roughOptions = vm.rough;
		var canvas = rough.canvas(me._chart.canvas);
		var each = helpers.each;
		var options;

		helpers.each = function(loopable, fn) {
			if (loopable === body) {
				each(loopable, function(bodyItem, i) {
					options = roughOptions[i];
					fn.apply(null, arguments);
				});
			} else {
				each.apply(null, arguments);
			}
		};
		ctx.fillRect = function(x, y, width, height) {
			var fillOptions = options.fillOptions;

			if (width === bodyFontSize) {
				CanvasRenderingContext2D.prototype.fillRect.apply(this, arguments);
			} else {
				canvas.rectangle(x, y, width, height, helpers.extend({}, fillOptions, {
					fill: mergeOpacity(fillOptions.fill, opacity)
				}));
			}
		};
		ctx.strokeRect = function(x, y, width, height) {
			var strokeOptions = options.strokeOptions;

			canvas.rectangle(x, y, width, height, helpers.extend({}, strokeOptions, {
				stroke: mergeOpacity(strokeOptions.stroke, opacity),
				strokeWidth: 1
			}));
		};

		Tooltip.prototype.drawBody.apply(me, arguments);

		helpers.each = each;
		delete ctx.fillRect;
		delete ctx.strokeRect;
	}
});
