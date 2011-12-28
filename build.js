load('tools/jslint/jslint.js');
load('tools/jsmake.javascript.JavascriptUtils.js');

var fs = jsmake.Fs;
var utils = jsmake.Utils;
var sys = jsmake.Sys;
var js = new jsmake.javascript.JavascriptUtils();

var version;

task('default', 'jslint');

task('version', function () {
	version = JSON.parse(fs.readFile('version.json'));
});

task('jslint', function () {
	var files = fs.createScanner('.')
		.include('/src/**/*.js')
		.include('/test/**/*.js')
		.scan();
	var options = { white: true, onevar: true, undef: true, regexp: true, plusplus: true, bitwise: true, newcap: true, sloppy: true, nomen: true };
	var globals = { };
	js.jslint(files, options, globals);
});

