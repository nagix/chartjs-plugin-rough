/*
 * @license
 * chartjs-plugin-rough
 * https://github.com/nagix/chartjs-plugin-rough/
 * Version: 0.1.0
 *
 * Copyright 2019 Akihiko Kusanagi
 * Released under the MIT license
 * https://github.com/nagix/chartjs-plugin-rough/blob/master/LICENSE.md
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js'), require('roughjs')) :
	typeof define === 'function' && define.amd ? define(['chart.js', 'roughjs'], factory) :
	(global.ChartRough = factory(global.Chart,global.rough));
}(this, (function (Chart,rough) { 'use strict';

Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;
rough = rough && rough.hasOwnProperty('default') ? rough['default'] : rough;

'use strict';

var helpers = Chart.helpers;

// For Chart.js 2.7.1 backward compatibility
Chart.layouts = Chart.layouts || Chart.layoutService;

// For Chart.js 2.7.3 backward compatibility
helpers.canvas = helpers.canvas || {};
helpers.canvas._isPointInArea = helpers.canvas._isPointInArea || function(point, area) {
	var epsilon = 1e-6; // 1e-6 is margin in pixels for accumulated error.

	return point.x > area.left - epsilon && point.x < area.right + epsilon &&
		point.y > area.top - epsilon && point.y < area.bottom + epsilon;
};

'use strict';

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

'use strict';

var Arc = Chart.elements.Arc;

var RoughArc = Arc.extend({

	// Ported from Chart.js 2.7.3. Modified for rough arc.
	draw: function() {
		var vm = this._view;
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
		var canvas = rough.canvas(this._chart.canvas);

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

'use strict';

var Line = Chart.elements.Line;

var RoughLine = Line.extend({

	// Ported from Chart.js 2.7.3. Modified for rough line.
	draw: function() {
		var me = this;
		var vm = me._view;
		var spanGaps = vm.spanGaps;
		var points = me._children.slice(); // clone array
		var lastDrawnIndex = -1;
		var index, current, previous, currentVM;
		var canvas = rough.canvas(this._chart.canvas);
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

'use strict';

var Arc$1 = Chart.elements.Point;

var RoughPoint = Arc$1.extend({

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

'use strict';

var Rectangle = Chart.elements.Rectangle;

var RoughRectangle = Rectangle.extend({

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

'use strict';

var helpers$1 = Chart.helpers;

var resolve = helpers$1.options.resolve;

var BarController = Chart.controllers.bar;

var RoughBarController = BarController.extend({

	dataElementType: RoughRectangle,

	// Ported from Chart.js 2.7.3. Modified for rough bar.
	updateElement: function(rectangle, index, reset) {
		var me = this;
		var chart = me.chart;
		var meta = me.getMeta();
		var dataset = me.getDataset();
		var custom = rectangle.custom || {};
		var options = chart.options;
		var rectangleOptions = options.elements.rectangle;

		rectangle._xScale = me.getScaleForId(meta.xAxisID);
		rectangle._yScale = me.getScaleForId(meta.yAxisID);
		rectangle._datasetIndex = me.index;
		rectangle._index = index;

		rectangle._model = helpers$1.merge({
			datasetLabel: dataset.label,
			label: chart.data.labels[index],
			borderSkipped: helpers$1.valueOrDefault(custom.borderSkipped, rectangleOptions.borderSkipped),
			backgroundColor: resolve([custom.backgroundColor, dataset.backgroundColor, rectangleOptions.backgroundColor], undefined, index),
			borderColor: resolve([custom.borderColor, dataset.borderColor, rectangleOptions.borderColor], undefined, index),
			borderWidth: resolve([custom.borderWidth, dataset.borderWidth, rectangleOptions.borderWidth], undefined, index)
		}, roughHelpers.resolve(dataset, options.plugins.rough));

		me.updateElementGeometry(rectangle, index, reset);

		rectangle.pivot();
	}
});

'use strict';

var BubbleController = Chart.controllers.bubble;

var RoughBubbleController = BubbleController.extend({

	dataElementType: RoughPoint,

	/**
	 * Ported from Chart.js 2.7.3. Modified for rough bubble.
	 * @protected
	 */
	updateElement: function(point, index, reset) {
		var me = this;
		var meta = me.getMeta();
		var custom = point.custom || {};
		var xScale = me.getScaleForId(meta.xAxisID);
		var yScale = me.getScaleForId(meta.yAxisID);
		var options = me._resolveElementOptions(point, index);
		var data = me.getDataset().data[index];
		var dsIndex = me.index;

		var x = reset ? xScale.getPixelForDecimal(0.5) : xScale.getPixelForValue(typeof data === 'object' ? data : NaN, index, dsIndex);
		var y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(data, index, dsIndex);

		point._xScale = xScale;
		point._yScale = yScale;
		point._options = options;
		point._datasetIndex = dsIndex;
		point._index = index;
		point._model = Chart.helpers.merge({
			backgroundColor: options.backgroundColor,
			borderColor: options.borderColor,
			borderWidth: options.borderWidth,
			hitRadius: options.hitRadius,
			pointStyle: options.pointStyle,
			rotation: options.rotation,
			radius: reset ? 0 : options.radius,
			skip: custom.skip || isNaN(x) || isNaN(y),
			x: x,
			y: y
		}, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));

		point.pivot();
	}
});

'use strict';

var defaults = Chart.defaults;
var helpers$2 = Chart.helpers;

var resolve$1 = helpers$2.options.resolve;

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

var DoughnutController = Chart.controllers.doughnut;

var RoughDoughnutController = DoughnutController.extend({

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

		helpers$2.extend(arc, {
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
				label: helpers$2.valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
			}
		});

		var model = arc._model;

		// Resets the visual styles
		var custom = arc.custom || {};
		var elementOpts = opts.elements.arc;
		model.backgroundColor = resolve$1([custom.backgroundColor, dataset.backgroundColor, elementOpts.backgroundColor], undefined, index);
		model.borderColor = resolve$1([custom.borderColor, dataset.borderColor, elementOpts.borderColor], undefined, index);
		model.borderWidth = resolve$1([custom.borderWidth, dataset.borderWidth, elementOpts.borderWidth], undefined, index);

		helpers$2.merge(model, roughHelpers.resolve(dataset, opts.plugins.rough));

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

'use strict';

var RoughHorizontalBarController = RoughBarController.extend({
	/**
	 * @private
	 */
	getValueScaleId: function() {
		return this.getMeta().xAxisID;
	},

	/**
	 * @private
	 */
	getIndexScaleId: function() {
		return this.getMeta().yAxisID;
	}
});

'use strict';

var helpers$3 = Chart.helpers;

var valueOrDefault = helpers$3.valueOrDefault;
var resolve$2 = helpers$3.options.resolve;

var LineController = Chart.controllers.line;

// Ported from Chart.js 2.7.3.
function lineEnabled(dataset, options) {
	return valueOrDefault(dataset.showLine, options.showLines);
}

var RoughLineController = LineController.extend({

	datasetElementType: RoughLine,

	dataElementType: RoughPoint,

	// Ported from Chart.js 2.7.3. Modified for rough line.
	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var line = meta.dataset;
		var points = meta.data || [];
		var options = me.chart.options;
		var lineElementOptions = options.elements.line;
		var scale = me.getScaleForId(meta.yAxisID);
		var i, ilen, custom;
		var dataset = me.getDataset();
		var showLine = lineEnabled(dataset, options);

		// Update Line
		if (showLine) {
			custom = line.custom || {};

			// Compatibility: If the properties are defined with only the old name, use those values
			if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
				dataset.lineTension = dataset.tension;
			}

			// Utility
			line._scale = scale;
			line._datasetIndex = me.index;
			// Data
			line._children = points;
			// Model
			line._model = helpers$3.merge({
				// Appearance
				// The default behavior of lines is to break at null values, according
				// to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
				// This option gives lines the ability to span gaps
				spanGaps: valueOrDefault(dataset.spanGaps, options.spanGaps),
				tension: resolve$2([custom.tension, dataset.lineTension, lineElementOptions.tension]),
				backgroundColor: resolve$2([custom.backgroundColor, dataset.backgroundColor, lineElementOptions.backgroundColor]),
				borderWidth: resolve$2([custom.borderWidth, dataset.borderWidth, lineElementOptions.borderWidth]),
				borderColor: resolve$2([custom.borderColor, dataset.borderColor, lineElementOptions.borderColor]),
				borderCapStyle: resolve$2([custom.borderCapStyle, dataset.borderCapStyle, lineElementOptions.borderCapStyle]),
				borderDash: resolve$2([custom.borderDash, dataset.borderDash, lineElementOptions.borderDash]),
				borderDashOffset: resolve$2([custom.borderDashOffset, dataset.borderDashOffset, lineElementOptions.borderDashOffset]),
				borderJoinStyle: resolve$2([custom.borderJoinStyle, dataset.borderJoinStyle, lineElementOptions.borderJoinStyle]),
				fill: resolve$2([custom.fill, dataset.fill, lineElementOptions.fill]),
				steppedLine: resolve$2([custom.steppedLine, dataset.steppedLine, lineElementOptions.stepped]),
				cubicInterpolationMode: resolve$2([custom.cubicInterpolationMode, dataset.cubicInterpolationMode, lineElementOptions.cubicInterpolationMode])
			}, roughHelpers.resolve(dataset, options.plugins.rough));

			line.pivot();
		}

		// Update Points
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			me.updateElement(points[i], i, reset);
		}

		if (showLine && line._model.tension !== 0) {
			me.updateBezierControlPoints();
		}

		// Now pivot the point for animation
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			points[i].pivot();
		}
	},

	updateElement: function(point) {
		var me = this;

		LineController.prototype.updateElement.apply(me, arguments);

		helpers$3.merge(point._model, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
	}
});

'use strict';

var helpers$4 = Chart.helpers;

var resolve$3 = helpers$4.options.resolve;

// Ported from Chart.js 2.7.3. Modified for rough polarArea.
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
			var fill = resolve$3([custom.backgroundColor, ds.backgroundColor, arcOpts.backgroundColor], undefined, i);
			var stroke = resolve$3([custom.borderColor, ds.borderColor, arcOpts.borderColor], undefined, i);
			var bw = resolve$3([custom.borderWidth, ds.borderWidth, arcOpts.borderWidth], undefined, i);

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

	// Ported from Chart.js 2.7.3. Modified for rough polarArea.
	updateElement: function(arc, index, reset) {
		var me = this;
		var chart = me.chart;
		var dataset = me.getDataset();
		var opts = chart.options;
		var animationOpts = opts.animation;
		var scale = chart.scale;
		var labels = chart.data.labels;

		var centerX = scale.xCenter;
		var centerY = scale.yCenter;

		// var negHalfPI = -0.5 * Math.PI;
		var datasetStartAngle = opts.startAngle;
		var distance = arc.hidden ? 0 : scale.getDistanceFromCenterForValue(dataset.data[index]);

		// For Chart.js 2.7.2 backward compatibility
		var startAngle, endAngle;
		if (me.calculateCircumference) {
			var circumference = me.calculateCircumference(dataset.data[index]);

			// If there is NaN data before us, we need to calculate the starting angle correctly.
			// We could be way more efficient here, but its unlikely that the polar area chart will have a lot of data
			var visibleCount = 0;
			var meta = me.getMeta();
			for (var i = 0; i < index; ++i) {
				if (!isNaN(dataset.data[i]) && !meta.data[i].hidden) {
					++visibleCount;
				}
			}

			startAngle = datasetStartAngle + (circumference * visibleCount);
			endAngle = startAngle + (arc.hidden ? 0 : circumference);
		} else {
			startAngle = me._starts[index];
			endAngle = startAngle + (arc.hidden ? 0 : me._angles[index]);
		}

		var resetRadius = animationOpts.animateScale ? 0 : scale.getDistanceFromCenterForValue(dataset.data[index]);

		helpers$4.extend(arc, {
			// Utility
			_datasetIndex: me.index,
			_index: index,
			_scale: scale,

			// Desired view properties
			_model: {
				x: centerX,
				y: centerY,
				innerRadius: 0,
				outerRadius: reset ? resetRadius : distance,
				startAngle: reset && animationOpts.animateRotate ? datasetStartAngle : startAngle,
				endAngle: reset && animationOpts.animateRotate ? datasetStartAngle : endAngle,
				label: helpers$4.valueAtIndexOrDefault(labels, index, labels[index])
			}
		});

		// Apply border and fill style
		var elementOpts = opts.elements.arc;
		var custom = arc.custom || {};
		var model = arc._model;

		model.backgroundColor = resolve$3([custom.backgroundColor, dataset.backgroundColor, elementOpts.backgroundColor], undefined, index);
		model.borderColor = resolve$3([custom.borderColor, dataset.borderColor, elementOpts.borderColor], undefined, index);
		model.borderWidth = resolve$3([custom.borderWidth, dataset.borderWidth, elementOpts.borderWidth], undefined, index);

		helpers$4.merge(model, roughHelpers.resolve(dataset, opts.plugins.rough));

		arc.pivot();
	}
});

'use strict';

var helpers$5 = Chart.helpers;

var resolve$4 = helpers$5.options.resolve;

var RadarController = Chart.controllers.radar;

var RoughRadarController = RadarController.extend({

	datasetElementType: RoughLine,

	dataElementType: RoughPoint,

	// Ported from Chart.js 2.7.3. Modified for rough radar.
	update: function(reset) {
		var me = this;
		var meta = me.getMeta();
		var line = meta.dataset;
		var points = meta.data;
		var custom = line.custom || {};
		var dataset = me.getDataset();
		var options = me.chart.options;
		var lineElementOptions = options.elements.line;
		var scale = me.chart.scale;

		// Compatibility: If the properties are defined with only the old name, use those values
		if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
			dataset.lineTension = dataset.tension;
		}

		helpers$5.extend(meta.dataset, {
			// Utility
			_datasetIndex: me.index,
			_scale: scale,
			// Data
			_children: points,
			_loop: true,
			// Model
			_model: helpers$5.merge({
				// Appearance
				tension: resolve$4([custom.tension, dataset.lineTension, lineElementOptions.tension]),
				backgroundColor: resolve$4([custom.backgroundColor, dataset.backgroundColor, lineElementOptions.backgroundColor]),
				borderWidth: resolve$4([custom.borderWidth, dataset.borderWidth, lineElementOptions.borderWidth]),
				borderColor: resolve$4([custom.borderColor, dataset.borderColor, lineElementOptions.borderColor]),
				fill: resolve$4([custom.fill, dataset.fill, lineElementOptions.fill]),
				borderCapStyle: resolve$4([custom.borderCapStyle, dataset.borderCapStyle, lineElementOptions.borderCapStyle]),
				borderDash: resolve$4([custom.borderDash, dataset.borderDash, lineElementOptions.borderDash]),
				borderDashOffset: resolve$4([custom.borderDashOffset, dataset.borderDashOffset, lineElementOptions.borderDashOffset]),
				borderJoinStyle: resolve$4([custom.borderJoinStyle, dataset.borderJoinStyle, lineElementOptions.borderJoinStyle])
			}, roughHelpers.resolve(dataset, options.plugins.rough))
		});

		meta.dataset.pivot();

		// Update Points
		helpers$5.each(points, function(point, index) {
			me.updateElement(point, index, reset);
		}, me);

		// Update bezier control points
		me.updateBezierControlPoints();
	},

	updateElement: function(point) {
		var me = this;

		RadarController.prototype.updateElement.apply(me, arguments);

		helpers$5.merge(point._model, roughHelpers.resolve(me.getDataset(), me.chart.options.plugins.rough));
	}
});

'use strict';

var helpers$6 = Chart.helpers;

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

var RoughFillerPlugin = helpers$6.merge({}, [FillerPlugin, {
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
			helpers$6.canvas.clipArea(ctx, chart.chartArea);
			doFill(chart, points, mapper, view, color, el._loop);
			helpers$6.canvas.unclipArea(ctx);
		}
	}
}]);

'use strict';

var defaults$1 = Chart.defaults;
var helpers$7 = Chart.helpers;
var layouts = Chart.layouts;

var isArray = helpers$7.isArray;
var valueOrDefault$1 = helpers$7.valueOrDefault;

// Ported from Chart.js 2.7.3. Modified for rough legend.
// Generates labels shown in the legend
defaults$1.global.legend.labels.generateLabels = function(chart) {
	var data = chart.data;
	return isArray(data.datasets) ? data.datasets.map(function(dataset, i) {
		return {
			text: dataset.label,
			fillStyle: helpers$7.valueAtIndexOrDefault(dataset.backgroundColor, 0),
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

/**
 * Ported from Chart.js 2.7.3.
 *
 * Helper function to get the box width based on the usePointStyle option
 * @param labelopts {Object} the label options on the legend
 * @param fontSize {Number} the label font size
 * @return {Number} width of the color box area
 */
function getBoxWidth(labelOpts, fontSize) {
	return labelOpts.usePointStyle ?
		fontSize * Math.SQRT2 :
		labelOpts.boxWidth;
}

var RoughLegend = Chart.Legend.extend({

	// Ported from Chart.js 2.7.3. Modified for rough legend.
	// Actually draw the legend on the canvas
	draw: function() {
		var me = this;
		var opts = me.options;
		var labelOpts = opts.labels;
		var globalDefault = defaults$1.global;
		var lineDefault = globalDefault.elements.line;
		var legendWidth = me.width;
		var lineWidths = me.lineWidths;
		var canvas = rough.canvas(this.chart.canvas);

		if (opts.display) {
			var ctx = me.ctx;
			var fontColor = valueOrDefault$1(labelOpts.fontColor, globalDefault.defaultFontColor);
			var fontSize = valueOrDefault$1(labelOpts.fontSize, globalDefault.defaultFontSize);
			var fontStyle = valueOrDefault$1(labelOpts.fontStyle, globalDefault.defaultFontStyle);
			var fontFamily = valueOrDefault$1(labelOpts.fontFamily, globalDefault.defaultFontFamily);
			var labelFont = helpers$7.fontString(fontSize, fontStyle, fontFamily);
			var cursor;

			// Canvas setup
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = fontColor; // for strikethrough effect
			ctx.fillStyle = fontColor; // render in correct colour
			ctx.font = labelFont;

			var boxWidth = getBoxWidth(labelOpts, fontSize);
			var hitboxes = me.legendHitBoxes;

			// current position
			var drawLegendBox = function(x, y, legendItem) {
				if (isNaN(boxWidth) || boxWidth <= 0) {
					return;
				}

				var isLineWidthZero = (valueOrDefault$1(legendItem.lineWidth, lineDefault.borderWidth) === 0);

				var roughOpts = helpers$7.merge({
					borderColor: valueOrDefault$1(legendItem.strokeStyle, globalDefault.defaultColor),
					borderWidth: valueOrDefault$1(legendItem.lineWidth, lineDefault.borderWidth),
					backgroundColor: valueOrDefault$1(legendItem.fillStyle, globalDefault.defaultColor)
				}, legendItem.rough);

				if (opts.labels && opts.labels.usePointStyle) {
					// Recalculate x and y for drawPoint() because its expecting
					// x and y to be center of figure (instead of top left)
					var radius = fontSize * Math.SQRT2 / 2;
					var offSet = radius / Math.SQRT2;
					var centerX = x + offSet;
					var centerY = y + offSet;

					// Draw pointStyle as legend symbol
					roughHelpers.drawPoint(ctx, legendItem.pointStyle, radius, centerX, centerY, 0, canvas, roughOpts);
				} else {
					// Draw box as legend symbol
					canvas.rectangle(x, y, boxWidth, fontSize, roughHelpers.getFillOptions(roughOpts));
					if (!isLineWidthZero) {
						canvas.rectangle(x, y, boxWidth, fontSize, roughHelpers.getStrokeOptions(roughOpts));
					}
				}

				// ctx.restore();
			};
			var fillText = function(x, y, legendItem, textWidth) {
				var halfFontSize = fontSize / 2;
				var xLeft = boxWidth + halfFontSize + x;
				var yMiddle = y + halfFontSize;

				ctx.fillText(legendItem.text, xLeft, yMiddle);

				if (legendItem.hidden) {
					// Strikethrough the text if hidden
					ctx.beginPath();
					ctx.lineWidth = 2;
					ctx.moveTo(xLeft, yMiddle);
					ctx.lineTo(xLeft + textWidth, yMiddle);
					ctx.stroke();
				}
			};

			// Horizontal
			var isHorizontal = me.isHorizontal();
			if (isHorizontal) {
				cursor = {
					x: me.left + ((legendWidth - lineWidths[0]) / 2),
					y: me.top + labelOpts.padding,
					line: 0
				};
			} else {
				cursor = {
					x: me.left + labelOpts.padding,
					y: me.top + labelOpts.padding,
					line: 0
				};
			}

			var itemHeight = fontSize + labelOpts.padding;
			helpers$7.each(me.legendItems, function(legendItem, i) {
				var textWidth = ctx.measureText(legendItem.text).width;
				var width = boxWidth + (fontSize / 2) + textWidth;
				var x = cursor.x;
				var y = cursor.y;

				if (isHorizontal) {
					if (x + width >= legendWidth) {
						y = cursor.y += itemHeight;
						cursor.line++;
						x = cursor.x = me.left + ((legendWidth - lineWidths[cursor.line]) / 2);
					}
				} else if (y + itemHeight > me.bottom) {
					x = cursor.x = x + me.columnWidths[cursor.line] + labelOpts.padding;
					y = cursor.y = me.top + labelOpts.padding;
					cursor.line++;
				}

				drawLegendBox(x, y, legendItem);

				hitboxes[i].left = x;
				hitboxes[i].top = y;

				// Fill the actual label
				fillText(x, y, legendItem, textWidth);

				if (isHorizontal) {
					cursor.x += width + (labelOpts.padding);
				} else {
					cursor.y += itemHeight;
				}

			});
		}
	}
});

// Ported from Chart.js 2.7.3. Modified for rough legend.
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

	// Ported from Chart.js 2.7.3.
	beforeInit: function(chart) {
		var legendOpts = chart.options.legend;

		if (legendOpts) {
			createNewLegendAndAttach(chart, legendOpts);
		}
	},

	// Ported from Chart.js 2.7.3.
	beforeUpdate: function(chart) {
		var legendOpts = chart.options.legend;
		var legend = chart.legend;

		if (legendOpts) {
			helpers$7.mergeIf(legendOpts, defaults$1.global.legend);

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

	// Ported from Chart.js 2.7.3.
	afterEvent: function(chart, e) {
		var legend = chart.legend;
		if (legend) {
			legend.handleEvent(e);
		}
	}
};

'use strict';

var controllers = Chart.controllers;
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

var descriptors = plugins.descriptors;

plugins.descriptors = function(chart) {
	var rough$$1 = chart._rough;

	// Replace filler/legend plugins with rough filler/legend plugins
	if (rough$$1) {
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

	if (rough$$1) {
		this._plugins = p;
	}

	return result;
};

var RoughPlugin$1 = {
	id: 'rough',

	beforeInit: function(chart) {
		chart._rough = {};

		chart.buildOrUpdateControllers = function() {
			var result;

			// Replace controllers with rough controllers on creation
			Chart.controllers = roughControllers;
			result = Chart.prototype.buildOrUpdateControllers.apply(this, arguments);
			Chart.controllers = controllers;

			return result;
		};

		// Remove the existing legend if exists
		if (chart.legend) {
			Chart.layouts.removeBox(chart, chart.legend);
			delete chart.legend;
		}

		// Invalidate plugin cache and create new one
		delete chart.$plugins;
		// For Chart.js 2.7.1 backward compatibility
		delete chart._plugins;
		plugins.descriptors(chart);
	}
};

'use strict';

Chart.helpers.rough = roughHelpers;

Chart.elements.RoughArc = RoughArc;
Chart.elements.RoughLine = RoughLine;
Chart.elements.RoughPoint = RoughPoint;
Chart.elements.RoughRectangle = RoughRectangle;

Chart.controllers.roughBar = RoughBarController;
Chart.controllers.roughBubble = RoughBubbleController;
Chart.controllers.roughDoughnut = Chart.controllers.roughPie = RoughDoughnutController;
Chart.controllers.roughHorizontalBar = RoughHorizontalBarController;
Chart.controllers.roughLine = Chart.controllers.roughScatter = RoughLineController;
Chart.controllers.roughPolarArea = RoughPolarAreaController;
Chart.controllers.roughRadar = RoughRadarController;

return RoughPlugin$1;

})));
