/*!
 * chartjs-plugin-rough v0.2.0
 * https://nagix.github.io/chartjs-plugin-rough
 * (c) 2019 Akihiko Kusanagi
 * Released under the MIT license
 */
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js'), require('roughjs')) :
typeof define === 'function' && define.amd ? define(['chart.js', 'roughjs'], factory) :
(global = global || self, global.ChartRough = factory(global.Chart, global.rough));
}(this, function (Chart, rough) { 'use strict';

Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;
rough = rough && rough.hasOwnProperty('default') ? rough['default'] : rough;

var PI = Math.PI;
var RAD_PER_DEG = PI / 180;
var QUARTER_PI = PI / 4;
var TWO_THIRDS_PI = PI * 2 / 3;

var roughHelpers = {

	roughKeys: [
		'roughness',
		'bowing',
		'fillStyle',
		'fillWeight',
		'hachureAngle',
		'hachureGap',
		'curveStepCount',
		'simplification'
	],

	drawPoint: function(ctx, style, radius, x, y, rotation, canvas, options) {
		var fillOpts = this.getFillOptions(options);
		var strokeOpts = this.getStrokeOptions(options);
		var rad = (rotation || 0) * RAD_PER_DEG;
		var type, xOffset, yOffset, xCornerOffset, yCornerOffset, size, cornerRadius, vertices, path, arcPrefix;

		if (style && typeof style === 'object') {
			type = style.toString();
			if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
				ctx.drawImage(style, x - style.width / 2, y - style.height / 2, style.width, style.height);
				return;
			}
		}

		if (isNaN(radius) || radius <= 0) {
			return;
		}

		switch (style) {
		// Default includes circle
		default:
			canvas.circle(x, y, radius * 2, fillOpts);
			canvas.circle(x, y, radius * 2, strokeOpts);
			break;
		case 'triangle':
			vertices = [];
			vertices.push([x + Math.sin(rad) * radius, y - Math.cos(rad) * radius]);
			rad += TWO_THIRDS_PI;
			vertices.push([x + Math.sin(rad) * radius, y - Math.cos(rad) * radius]);
			rad += TWO_THIRDS_PI;
			vertices.push([x + Math.sin(rad) * radius, y - Math.cos(rad) * radius]);
			canvas.polygon(vertices, fillOpts);
			canvas.polygon(vertices, strokeOpts);
			break;
		case 'rectRounded':
			cornerRadius = radius * 0.516;
			xCornerOffset = Math.cos(rad) * cornerRadius;
			yCornerOffset = Math.sin(rad) * cornerRadius;
			rad += QUARTER_PI;
			size = radius - cornerRadius;
			xOffset = Math.cos(rad) * size;
			yOffset = Math.sin(rad) * size;
			arcPrefix = 'A' + cornerRadius + ' ' + cornerRadius + ' 0 0 1 ';
			path =
				'M' + (x - xOffset - xCornerOffset) + ' ' + (y - yOffset - yCornerOffset) +
				arcPrefix + (x - xOffset + yCornerOffset) + ' ' + (y - yOffset - xCornerOffset) +
				'L' + (x + yOffset + yCornerOffset) + ' ' + (y - xOffset - xCornerOffset) +
				arcPrefix + (x + yOffset + xCornerOffset) + ' ' + (y - xOffset + yCornerOffset) +
				'L' + (x + xOffset + xCornerOffset) + ' ' + (y + yOffset + yCornerOffset) +
				arcPrefix + (x + xOffset - yCornerOffset) + ' ' + (y + yOffset + xCornerOffset) +
				'L' + (x - yOffset - yCornerOffset) + ' ' + (y + xOffset + xCornerOffset) +
				arcPrefix + (x - yOffset - xCornerOffset) + ' ' + (y + xOffset - yCornerOffset) + 'Z';
			canvas.path(path, fillOpts);
			canvas.path(path, strokeOpts);
			break;
		case 'rect':
			if (!rotation) {
				size = Math.SQRT1_2 * radius;
				canvas.rectangle(x - size, y - size, 2 * size, 2 * size, fillOpts);
				canvas.rectangle(x - size, y - size, 2 * size, 2 * size, strokeOpts);
				break;
			}
			rad += QUARTER_PI;
			/* falls through */
		case 'rectRot':
			xOffset = Math.cos(rad) * radius;
			yOffset = Math.sin(rad) * radius;
			vertices = [
				[x - xOffset, y - yOffset],
				[x + yOffset, y - xOffset],
				[x + xOffset, y + yOffset],
				[x - yOffset, y + xOffset]
			];
			canvas.polygon(vertices, fillOpts);
			canvas.polygon(vertices, strokeOpts);
			break;
		case 'crossRot':
			rad += QUARTER_PI;
			/* falls through */
		case 'cross':
			xOffset = Math.cos(rad) * radius;
			yOffset = Math.sin(rad) * radius;
			canvas.line(x - xOffset, y - yOffset, x + xOffset, y + yOffset, strokeOpts);
			canvas.line(x + yOffset, y - xOffset, x - yOffset, y + xOffset, strokeOpts);
			break;
		case 'star':
			xOffset = Math.cos(rad) * radius;
			yOffset = Math.sin(rad) * radius;
			canvas.line(x - xOffset, y - yOffset, x + xOffset, y + yOffset, strokeOpts);
			canvas.line(x + yOffset, y - xOffset, x - yOffset, y + xOffset, strokeOpts);
			rad += QUARTER_PI;
			xOffset = Math.cos(rad) * radius;
			yOffset = Math.sin(rad) * radius;
			canvas.line(x - xOffset, y - yOffset, x + xOffset, y + yOffset, strokeOpts);
			canvas.line(x + yOffset, y - xOffset, x - yOffset, y + xOffset, strokeOpts);
			break;
		case 'line':
			xOffset = Math.cos(rad) * radius;
			yOffset = Math.sin(rad) * radius;
			canvas.line(x - xOffset, y - yOffset, x + xOffset, y + yOffset, strokeOpts);
			break;
		case 'dash':
			canvas.line(x, y, x + Math.cos(rad) * radius, y + Math.sin(rad) * radius, strokeOpts);
			break;
		}
	},

	lineTo: function(previous, target, flip) {
		var stepped = target.steppedLine;
		var midpoint, path;

		if (stepped) {
			if (stepped === 'middle') {
				midpoint = (previous.x + target.x) / 2;
				path = 'L' + midpoint + ' ' + (flip ? target.y : previous.y) +
					'L' + midpoint + ' ' + (flip ? previous.y : target.y);
			} else if ((stepped === 'after' && !flip) || (stepped !== 'after' && flip)) {
				path = 'L' + previous.x + ' ' + target.y;
			} else {
				path = 'L' + target.x + ' ' + previous.y;
			}
			return path + 'L' + target.x + ' ' + target.y;
		}

		if (!target.tension) {
			return 'L' + target.x + ' ' + target.y;
		}

		return 'C ' +
			(flip ? previous.controlPointPreviousX : previous.controlPointNextX) + ' ' +
			(flip ? previous.controlPointPreviousY : previous.controlPointNextY) + ',' +
			(flip ? target.controlPointNextX : target.controlPointPreviousX) + ' ' +
			(flip ? target.controlPointNextY : target.controlPointPreviousY) + ',' +
			target.x + ' ' + target.y;
	},

	resolve: function(dataset, options) {
		var override = dataset.rough;

		if (override === false) {
			return null;
		}
		if (override === true) {
			override = {};
		}

		return Chart.helpers.merge({}, [options, override]);
	},

	getFillOptions: function(options) {
		var values = {
			stroke: 'transparent',
			fill: options.backgroundColor
		};

		this.roughKeys.forEach(function(key) {
			if (options[key] !== undefined) {
				values[key] = options[key];
			}
		});
		return values;
	},

	getStrokeOptions: function(options) {
		var keys = ['roughness', 'bowing', 'curveStepCount', 'simplification'];
		var values = {
			stroke: options.borderColor,
			strokeWidth: options.borderWidth
		};

		keys.forEach(function(key) {
			if (options[key] !== undefined) {
				values[key] = options[key];
			}
		});
		return values;
	}
};

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

var RoughTooltip = Tooltip.extend({

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

var RoughRectangle = Rectangle.extend({

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

var BarController = Chart.controllers.bar;

var RoughBarController = BarController.extend({

	dataElementType: RoughRectangle,

	updateElement: function(rectangle) {
		var me = this;
		var model = {};

		Object.defineProperty(rectangle, '_model', {
			configurable: true,
			get: function() {
				return model;
			},
			set: function(value) {
				Chart.helpers.extend(model, value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
			}
		});

		BarController.prototype.updateElement.apply(me, arguments);

		delete rectangle._model;
		rectangle._model = model;
	}
});

// For Chart.js 2.7.3 backward compatibility
var isPointInArea = Chart.helpers.canvas._isPointInArea || function(point, area) {
	var epsilon = 1e-6;

	return point.x > area.left - epsilon && point.x < area.right + epsilon &&
		point.y > area.top - epsilon && point.y < area.bottom + epsilon;
};

var Point = Chart.elements.Point;

var RoughPoint = Point.extend({

	// Ported from Chart.js 2.8.0. Modified for rough point.
	draw: function(chartArea) {
		var me = this;
		var vm = me._view;
		var chart = me._chart;
		var canvas = rough.canvas(chart.canvas);

		if (vm.skip || chartArea !== undefined && !isPointInArea(vm, chartArea)) {
			return;
		}

		roughHelpers.drawPoint(chart.ctx, vm.pointStyle, vm.radius, vm.x, vm.y, vm.rotation, canvas, vm);
	}
});

var BubbleController = Chart.controllers.bubble;

var RoughBubbleController = BubbleController.extend({

	dataElementType: RoughPoint,

	updateElement: function(point) {
		var me = this;
		var model = {};

		Object.defineProperty(point, '_model', {
			configurable: true,
			get: function() {
				return model;
			},
			set: function(value) {
				Chart.helpers.extend(model, value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
			}
		});

		BubbleController.prototype.updateElement.apply(me, arguments);

		delete point._model;
		point._model = model;
	}
});

var Arc = Chart.elements.Arc;

var RoughArc = Arc.extend({

	// Ported from Chart.js 2.8.0. Modified for rough arc.
	draw: function() {
		var me = this;
		var vm = me._view;
		var x = vm.x;
		var y = vm.y;
		var outerRadius = vm.outerRadius;
		var innerRadius = vm.innerRadius;
		var sA = vm.startAngle;
		var eA = vm.endAngle;
		var sCos = Math.cos(sA);
		var sSin = Math.sin(sA);
		var eCos = Math.cos(eA);
		var eSin = Math.sin(eA);
		var isLargeArc = eA - sA > Math.PI ? 1 : 0;
		var canvas = rough.canvas(me._chart.canvas);

		var path =
			'M' + (x + outerRadius * sCos) + ' ' + (y + outerRadius * sSin) +
			'A' + outerRadius + ' ' + outerRadius + ' 0 ' + isLargeArc +
			' 1 ' + (x + outerRadius * eCos) + ' ' + (y + outerRadius * eSin) +
			'L' + (x + innerRadius * eCos) + ' ' + (y + innerRadius * eSin) +
			'A' + innerRadius + ' ' + innerRadius + ' 0 ' + isLargeArc +
			' 0 ' + (x + innerRadius * sCos) + ' ' + (y + innerRadius * sSin) + 'Z';

		canvas.path(path, roughHelpers.getFillOptions(vm));

		if (vm.borderWidth) {
			canvas.path(path, roughHelpers.getStrokeOptions(vm));
		}
	}
});

var defaults = Chart.defaults;
var helpers$1 = Chart.helpers;

var resolve = helpers$1.options.resolve;

// Ported from Chart.js 2.8.0. Modified for rough doughnut.
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

var RoughDoughnutController = DoughnutController.extend({

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
				helpers$1.extend(model, value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
			}
		});

		DoughnutController.prototype.updateElement.apply(me, arguments);

		delete arc._model;
		arc._model = model;
	}
});

var RoughHorizontalBarController = RoughBarController.extend({
	/**
	 * @private
	 */
	_getValueScaleId: function() {
		return this.getMeta().xAxisID;
	},

	/**
	 * @private
	 */
	_getIndexScaleId: function() {
		return this.getMeta().yAxisID;
	},

	/**
	 * For Chart.js 2.7.3 backward compatibility
	 * @private
	 */
	getValueScaleId: function() {
		return this.getMeta().xAxisID;
	},

	/**
	 * For Chart.js 2.7.3 backward compatibility
	 * @private
	 */
	getIndexScaleId: function() {
		return this.getMeta().yAxisID;
	}
});

var Line = Chart.elements.Line;

var RoughLine = Line.extend({

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

var extend = Chart.helpers.extend;

var LineController = Chart.controllers.line;

var RoughLineController = LineController.extend({

	datasetElementType: RoughLine,

	dataElementType: RoughPoint,

	update: function() {
		var me = this;
		var line = me.getMeta().dataset;
		var model = {};

		Object.defineProperty(line, '_model', {
			configurable: true,
			get: function() {
				return model;
			},
			set: function(value) {
				extend(model, value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
			}
		});

		LineController.prototype.update.apply(me, arguments);

		delete line._model;
		line._model = model;
	},

	updateElement: function(point) {
		var me = this;

		LineController.prototype.updateElement.apply(me, arguments);

		extend(point._model, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
	}
});

var helpers$2 = Chart.helpers;

var resolve$1 = helpers$2.options.resolve;

// Ported from Chart.js 2.8.0. Modified for rough polarArea.
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
			var fill = resolve$1([custom.backgroundColor, ds.backgroundColor, arcOpts.backgroundColor], undefined, i);
			var stroke = resolve$1([custom.borderColor, ds.borderColor, arcOpts.borderColor], undefined, i);
			var bw = resolve$1([custom.borderWidth, ds.borderWidth, arcOpts.borderWidth], undefined, i);

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

var RoughPolarAreaController = PolarAreaController.extend({

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
				helpers$2.extend(model, value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
			}
		});

		PolarAreaController.prototype.updateElement.apply(me, arguments);

		delete arc._model;
		arc._model = model;
	}
});

var extend$1 = Chart.helpers.extend;

var RadarController = Chart.controllers.radar;

var RoughRadarController = RadarController.extend({

	datasetElementType: RoughLine,

	dataElementType: RoughPoint,

	update: function() {
		var me = this;
		var line = me.getMeta().dataset;
		var model = {};

		Object.defineProperty(line, '_model', {
			configurable: true,
			get: function() {
				return model;
			},
			set: function(value) {
				extend$1(model, value, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
			}
		});

		RadarController.prototype.update.apply(me, arguments);

		delete line._model;
		line._model = model;
	},

	updateElement: function(point) {
		var me = this;

		RadarController.prototype.updateElement.apply(me, arguments);

		extend$1(point._model, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
	}
});

var helpers$3 = Chart.helpers;

var FillerPlugin = Chart.plugins.getAll().filter(function(plugin) {
	return plugin.id === 'filler';
})[0];

// Ported from Chart.js 2.8.0.
function isDrawable(point) {
	return point && !point.skip;
}

// Ported from Chart.js 2.8.0. Modified for rough filler.
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

// Ported from Chart.js 2.8.0. Modified for rough filler.
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

var RoughFillerPlugin = helpers$3.extend({}, FillerPlugin, {
	// Ported from Chart.js 2.8.0.
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
			helpers$3.canvas.clipArea(ctx, chart.chartArea);
			doFill(chart, points, mapper, view, color, el._loop);
			helpers$3.canvas.unclipArea(ctx);
		}
	}
});

var defaults$1 = Chart.defaults;
var helpers$4 = Chart.helpers;

// For Chart.js 2.7.1 backward compatibility
var layouts = Chart.layouts || Chart.layoutService;

var valueOrDefault = helpers$4.valueOrDefault;

// Ported from Chart.js 2.8.0. Modified for rough legend.
// Generates labels shown in the legend
defaults$1.global.legend.labels.generateLabels = function(chart) {
	var data = chart.data;
	return helpers$4.isArray(data.datasets) ? data.datasets.map(function(dataset, i) {
		return {
			text: dataset.label,
			fillStyle: helpers$4.valueAtIndexOrDefault(dataset.backgroundColor, 0),
			hidden: !chart.isDatasetVisible(i),
			lineCap: dataset.borderCapStyle,
			lineDash: dataset.borderDash,
			lineDashOffset: dataset.borderDashOffset,
			lineJoin: dataset.borderJoinStyle,
			lineWidth: dataset.borderWidth,
			strokeStyle: dataset.borderColor,
			pointStyle: dataset.pointStyle,
			rough: roughHelpers.resolve(dataset, chart.options.plugins.rough),

			// Below is extra data used for toggling the datasets
			datasetIndex: i
		};
	}, this) : [];
};

var RoughLegend = Chart.Legend.extend({

	draw: function() {
		var me = this;
		var globalDefaults = defaults$1.global;
		var each = helpers$4.each;
		var drawPoint = helpers$4.canvas.drawPoint;
		var canvas = rough.canvas(me.chart.canvas);
		var ctx = me.ctx;
		var roughOpts;

		helpers$4.each = function(loopable, fn) {
			each(loopable, function(legendItem) {
				roughOpts = helpers$4.extend({
					borderColor: valueOrDefault(legendItem.strokeStyle, globalDefaults.defaultColor),
					borderWidth: valueOrDefault(legendItem.lineWidth, globalDefaults.elements.line.borderWidth),
					backgroundColor: valueOrDefault(legendItem.fillStyle, globalDefaults.defaultColor)
				}, legendItem.rough);

				fn.apply(null, arguments);
			});
		};

		helpers$4.canvas.drawPoint = function(context, style, radius, x, y, rotation) {
			roughHelpers.drawPoint(context, style, radius, x, y, rotation, canvas, roughOpts);
		};

		ctx.strokeRect = function() {
			// noop
		};

		ctx.fillRect = function(x, y, width, height) {
			canvas.rectangle(x, y, width, height, roughHelpers.getFillOptions(roughOpts));
			if (roughOpts.borderWidth !== 0) {
				canvas.rectangle(x, y, width, height, roughHelpers.getStrokeOptions(roughOpts));
			}
		};

		Chart.Legend.prototype.draw.apply(me, arguments);

		helpers$4.each = each;
		helpers$4.canvas.drawPoint = drawPoint;
		delete ctx.fillRect;
		delete ctx.strokeRect;
	}
});

// Ported from Chart.js 2.8.0. Modified for rough legend.
function createNewLegendAndAttach(chart, legendOpts) {
	var legend = new RoughLegend({
		ctx: chart.ctx,
		options: legendOpts,
		chart: chart
	});

	layouts.configure(chart, legend, legendOpts);
	layouts.addBox(chart, legend);
	chart.legend = legend;
}

var RoughLegendPlugin = {
	id: 'legend',

	_element: RoughLegend,

	// Ported from Chart.js 2.8.0.
	beforeInit: function(chart) {
		var legendOpts = chart.options.legend;

		if (legendOpts) {
			createNewLegendAndAttach(chart, legendOpts);
		}
	},

	// Ported from Chart.js 2.8.0.
	beforeUpdate: function(chart) {
		var legendOpts = chart.options.legend;
		var legend = chart.legend;

		if (legendOpts) {
			helpers$4.mergeIf(legendOpts, defaults$1.global.legend);

			if (legend) {
				layouts.configure(chart, legend, legendOpts);
				legend.options = legendOpts;
			} else {
				createNewLegendAndAttach(chart, legendOpts);
			}
		} else if (legend) {
			layouts.removeBox(chart, legend);
			delete chart.legend;
		}
	},

	// Ported from Chart.js 2.8.0.
	afterEvent: function(chart, e) {
		var legend = chart.legend;
		if (legend) {
			legend.handleEvent(e);
		}
	}
};

// For Chart.js 2.7.1 backward compatibility
var layouts$1 = Chart.layouts || Chart.layoutService;

var plugins = Chart.plugins;

Chart.defaults.global.plugins.rough = {
	roughness: 1,
	bowing: 1,
	fillStyle: 'hachure',
	fillWeight: 0.5,
	hachureAngle: -41,
	hachureGap: 4,
	curveStepCount: 9,
	simplification: 0
};

var roughControllers = {
	bar: RoughBarController,
	bubble: RoughBubbleController,
	doughnut: RoughDoughnutController,
	horizontalBar: RoughHorizontalBarController,
	line: RoughLineController,
	polarArea: RoughPolarAreaController,
	pie: RoughDoughnutController,
	radar: RoughRadarController,
	scatter: RoughLineController
};

// Ported from Chart.js 2.8.0. Modified for style controllers.
function buildOrUpdateControllers() {
	var me = this;
	var newControllers = [];

	Chart.helpers.each(me.data.datasets, function(dataset, datasetIndex) {
		var meta = me.getDatasetMeta(datasetIndex);
		var type = dataset.type || me.config.type;

		if (meta.type && meta.type !== type) {
			me.destroyDatasetMeta(datasetIndex);
			meta = me.getDatasetMeta(datasetIndex);
		}
		meta.type = type;

		if (meta.controller) {
			meta.controller.updateIndex(datasetIndex);
			meta.controller.linkScales();
		} else {
			var ControllerClass = roughControllers[meta.type];
			if (ControllerClass === undefined) {
				throw new Error('"' + meta.type + '" is not a chart type.');
			}

			meta.controller = new ControllerClass(me, datasetIndex);
			newControllers.push(meta.controller);
		}
	}, me);

	return newControllers;
}

// Ported from Chart.js 2.8.0. Modified for style tooltip.
function initToolTip() {
	var me = this;
	me.tooltip = new RoughTooltip({
		_chart: me,
		_chartInstance: me, // deprecated, backward compatibility
		_data: me.data,
		_options: me.options.tooltips
	}, me);
}

var descriptors = plugins.descriptors;

plugins.descriptors = function(chart) {
	var rough = chart._rough;

	// Replace filler/legend plugins with rough filler/legend plugins
	if (rough) {
		// chart._plugins for Chart.js 2.7.1 backward compatibility
		var cache = chart.$plugins || chart._plugins || (chart.$plugins = chart._plugins = {});
		if (cache.id === this._cacheId) {
			return cache.descriptors;
		}

		var p = this._plugins;
		var result;

		this._plugins = p.map(function(plugin) {
			if (plugin.id === 'filler') {
				return RoughFillerPlugin;
			} else if (plugin.id === 'legend') {
				return RoughLegendPlugin;
			}
			return plugin;
		});
	}

	result = descriptors.apply(this, arguments);

	if (rough) {
		this._plugins = p;
	}

	return result;
};

var RoughPlugin = {
	id: 'rough',

	beforeInit: function(chart) {
		chart._rough = {};

		chart.buildOrUpdateControllers = buildOrUpdateControllers;
		chart.initToolTip = initToolTip;

		// Remove the existing legend if exists
		if (chart.legend) {
			layouts$1.removeBox(chart, chart.legend);
			delete chart.legend;
		}

		// Invalidate plugin cache and create new one
		delete chart.$plugins;
		// For Chart.js 2.7.1 backward compatibility
		delete chart._plugins;
		plugins.descriptors(chart);
	}
};

return RoughPlugin;

}));
