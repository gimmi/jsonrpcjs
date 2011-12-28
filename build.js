load('tools/jslint/jslint.js');
load('tools/jsmake.javascript.JavascriptUtils.js');

var fs = jsmake.Fs;
var utils = jsmake.Utils;
var sys = jsmake.Sys;
var js = new jsmake.javascript.JavascriptUtils();

var version, versionStr;

task('default', 'build');

task('version', function () {
	version = JSON.parse(fs.readFile('version.json'));
	versionStr = [ version.major, version.minor, version.patch ].join('.');
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

task('build', ['version', 'test'], function () {
	var files = fs.createScanner('src')
		.include('**/*.js')
		.scan();

	var content = utils.map(files, function (file) {
		return fs.readFile(file);
	});

	var header = [];
	header.push('/*');
	header.push('JsonRpcJs version ' + versionStr);
	header.push('');
	header.push('http://github.com/gimmi/jsonrpcjs/');
	header.push('');
	header.push(fs.readFile('LICENSE'));
	header.push('*/');
	content.unshift(header.join('\n'));

	content = content.join('\n');
	
	fs.writeFile('build/jsonrpc-' + versionStr + '.js', content);

	var uglifyjs = require('tools/uglifyjs/uglify-js');
	var content = uglifyjs(content);
	fs.writeFile('build/jsonrpc-' + versionStr + '.min.js', content);
});

task('test', 'jslint', function () {
	var runner = jsmake.Sys.createRunner('java');
	runner.args('-cp', 'tools/jsmake/js.jar');
	runner.args('org.mozilla.javascript.tools.shell.Main'); 
	// runner.args('org.mozilla.javascript.tools.debugger.Main');
	runner.args('-modules', '.');
	runner.args('specrunner.js');
	var files = fs.createScanner('.')
		.include('/src/**/*.js')
		.include('/test/**/*.js')
		.scan();
	utils.each(files, function (file) {
		runner.args(file);
	});
	runner.run();
});


