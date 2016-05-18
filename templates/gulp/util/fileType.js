'use strict';

var path = require('path');

/**
 * Filters out files that don't match the extension. Prevents
 * accidental inclusion of possible hidden files.
 */
module.exports = function(extension) {
	var pattern = new RegExp("(\.(" + extension + ")$)", "i");
	return function(name) {
  		return pattern.test(path.extname(name));
  	}
};