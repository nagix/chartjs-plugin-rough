'use strict';

import RoughBarController from './controller.roughBar';

export default RoughBarController.extend({
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
