'use strict';

import Chart from '../core/core.controller.js';

var PI = Math.PI;
var RAD_PER_DEG = PI / 180;
var QUARTER_PI = PI / 4;
var TWO_THIRDS_PI = PI * 2 / 3;

export default {

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
