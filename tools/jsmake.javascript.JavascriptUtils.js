jsmake.javascript = {};

jsmake.javascript.JavascriptUtils = function () {
};
jsmake.javascript.JavascriptUtils.prototype = {
	jslint: function (files, options, globals) {
		if (!JSLINT) {
			throw 'JSLint library must be loaded. Download JSLint and include it in build script';
		}
		globals = '/*global ' + jsmake.Utils.map(globals, function (global, key) {
			return key + ': ' + !!global;
		}, this).join(', ') + ' */\n';
		var errors = [];
		jsmake.Utils.each(files, function (file) {
			var content = globals + fs.readFile(file);
			JSLINT(content, options);
			jsmake.Utils.each(JSLINT.errors, function (error) {
				if (error) {
					errors.push(file + ':' + (error.line - 1) + ',' + error.character + ': ' + error.reason);
				}
			});
		});

		if (errors.length) {
			sys.log('JSLint found ' + errors.length + ' errors');
			sys.log(errors.join('\n'));
			throw 'Fatal error, see previous messages.';
		}
	}
};