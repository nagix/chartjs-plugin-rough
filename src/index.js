'use strict';

import Chart from './core/core.controller.js';

import RoughHelper from './helpers/helpers.rough';

import RoughArcElement from './elements/element.roughArc';
import RoughLineElement from './elements/element.roughLine';
import RoughPointElement from './elements/element.roughPoint';
import RoughRectangleElement from './elements/element.roughRectangle';

import RoughBarController from './controllers/controller.roughBar';
import RoughBubbleController from './controllers/controller.roughBubble';
import RoughDoughnutController from './controllers/controller.roughDoughnut';
import RoughHorizontalBarController from './controllers/controller.roughHorizontalBar';
import RoughLineController from './controllers/controller.roughLine';
import RoughPolarAreaController from './controllers/controller.roughPolarArea';
import RoughRadarController from './controllers/controller.roughRadar';

import RoughPlugin from './plugins/plugin.rough';

Chart.helpers.rough = RoughHelper;

Chart.elements.RoughArc = RoughArcElement;
Chart.elements.RoughLine = RoughLineElement;
Chart.elements.RoughPoint = RoughPointElement;
Chart.elements.RoughRectangle = RoughRectangleElement;

Chart.controllers.roughBar = RoughBarController;
Chart.controllers.roughBubble = RoughBubbleController;
Chart.controllers.roughDoughnut = Chart.controllers.roughPie = RoughDoughnutController;
Chart.controllers.roughHorizontalBar = RoughHorizontalBarController;
Chart.controllers.roughLine = Chart.controllers.roughScatter = RoughLineController;
Chart.controllers.roughPolarArea = RoughPolarAreaController;
Chart.controllers.roughRadar = RoughRadarController;

export default RoughPlugin;
