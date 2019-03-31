# chartjs-plugin-rough

[![npm](https://img.shields.io/npm/v/chartjs-plugin-rough.svg?style=flat-square)](https://npmjs.com/package/chartjs-plugin-rough) [![Bower](https://img.shields.io/bower/v/chartjs-plugin-rough.svg?style=flat-square)](https://libraries.io/bower/chartjs-plugin-rough) [![Travis](https://img.shields.io/travis/com/nagix/chartjs-plugin-rough/master.svg?style=flat-square)](https://travis-ci.com/nagix/chartjs-plugin-rough) [![Code Climate](https://img.shields.io/codeclimate/maintainability/nagix/chartjs-plugin-rough.svg?style=flat-square)](https://codeclimate.com/github/nagix/chartjs-plugin-rough) [![Awesome](https://awesome.re/badge-flat2.svg)](https://github.com/chartjs/awesome)

*[Chart.js](https://www.chartjs.org) plugin to create charts with a hand-drawn, sketchy, appearance*

Version 0.2 requires Chart.js 2.7.0 or later, and [Rough.js](https://roughjs.com) 2.0.1 or later.

## Installation

You can download the latest version of chartjs-plugin-rough from the [GitHub releases](https://github.com/nagix/chartjs-plugin-rough/releases/latest).

To install via npm:

```bash
npm install chartjs-plugin-rough --save
```

To install via bower:

```bash
bower install chartjs-plugin-rough --save
```

To use CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-rough@latest/dist/chartjs-plugin-rough.min.js"></script>
```
```html
<script src="https://unpkg.com/chartjs-plugin-rough@latest/dist/chartjs-plugin-rough.min.js"></script>
```

## Usage

chartjs-plugin-rough can be used with ES6 modules, plain JavaScript and module loaders.

chartjs-plugin-rough requires [Chart.js](https://www.chartjs.org) and [Rough.js](https://roughjs.com). Include Chart.js, Rough.js and chartjs-plugin-rough.js to your page to render sketchy charts. Note that chartjs-plugin-rough must be loaded after the Chart.js and Rough.js libraries. Once imported, the plugin is available under the global property `ChartRough`.

Then, you need to register the plugin to enable it for all charts in the page.

```js
Chart.plugins.register(ChartRough);
```

Or, you can enable the plugin only for specific charts.

```js
var chart = new Chart(ctx, {
    plugins: [ChartRough],
    options: {
        // ...
    }
});
```

### Usage in ES6 as module

Import the module as `ChartRough`, and register it in the same way as described above.

```js
import ChartRough from 'chartjs-plugin-rough';
```

## Tutorial and Samples

You can find a tutorial and samples at [nagix.github.io/chartjs-plugin-rough](https://nagix.github.io/chartjs-plugin-rough).

## Configuration

The plugin options can be changed at 3 different levels and are evaluated with the following priority:

- per dataset: `dataset.rough.*`
- per chart: `options.plugins.rough.*`
- globally: `Chart.defaults.global.plugins.rough.*`

All available options are listed below. [This example](https://nagix.github.io/chartjs-plugin-rough/samples/interactions.html) shows how each option affects the appearance of a chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `roughness` | `number` | `1` | Numerical value indicating how rough the drawing is. See [Rough.js](https://github.com/pshihn/rough/wiki#roughness).
| `bowing` | `number` | `1` | Numerical value indicating how curvy the lines are when drawing a sketch. See [Rough.js](https://github.com/pshihn/rough/wiki#bowing).
| `fillStyle` | `string` | `'hachure'` | String value representing the fill style. See [Rough.js](https://github.com/pshihn/rough/wiki#fillstyle).
| `fillWeight` | `number` | `0.5` | Numeric value representing the width of the hachure lines. See [Rough.js](https://github.com/pshihn/rough/wiki#fillweight).
| `hachureAngle` | `number` | `-41` | Numerical value (in degrees) that defines the angle of the hachure lines. See [Rough.js](https://github.com/pshihn/rough/wiki#hachureangle).
| `hachureGap` | `number` | `4` | Numerical value that defines the average gap, in pixels, between two hachure lines. See [Rough.js](https://github.com/pshihn/rough/wiki#hachuregap).
| `curveStepCount` | `number` | `9` | When drawing circles and arcs, the plugin approximates `curveStepCount` number of points to estimate the shape. See [Rough.js](https://github.com/pshihn/rough/wiki#curvestepcount).
| `simplification` | `number` | `0` | When drawing lines, simplification can be set to simplify the shape by the specified factor. The value can be between 0 and 1. See [Rough.js](https://github.com/pshihn/rough/wiki#simplification).

For example:

```js
{
    type: 'bar',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            data: [45, 20, 64, 32, 76, 51],
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 3,
            rough: {
                roughness: 1,
                bowing: 1,
                fillStyle: 'hachure',
                fillWeight: 0.5,
                hachureAngle: -41,
                hachureGap: 4,
                curveStepCount: 9,
                simplification: 0
            }
        }]
    }
}
```

Note that the following line style options are ignored.

- `borderCapStyle`
- `borderDash`
- `borderDashOffset`
- `borderJoinStyle`
- `borderAlign`

## Building

You first need to install node dependencies (requires [Node.js](https://nodejs.org/)):

```bash
npm install
```

The following commands will then be available from the repository root:

```bash
gulp build            # build dist files
gulp build --watch    # build and watch for changes
gulp lint             # perform code linting
gulp package          # create an archive with dist files and samples
```

## License

chartjs-plugin-rough is available under the [MIT license](https://opensource.org/licenses/MIT).
