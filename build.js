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
	var options = { browser: true, nomen: true, sloppy: true }; //{ white: true, onevar: true, undef: true, regexp: true, plusplus: true, bitwise: true, newcap: true, sloppy: true, nomen: true };
	var globals = { jsonrpc: true, jasmine: false, describe: false, expect: false, spyOn: false, waits: false, waitsFor: false, runs: false, beforeEach: false, it: false };
	js.jslint(files, options, globals);
});

task('build', ['version', 'test'], function () {
	var buildName = 'jsonrpc-' + versionStr;
	fs.deletePath(fs.combinePaths('build', buildName));
	
	var header = [];
	header.push('/*');
	header.push('JsonRpcJs version ' + versionStr);
	header.push('');
	header.push('http://github.com/gimmi/jsonrpcjs/');
	header.push('');
	header.push(fs.readFile('LICENSE'));
	header.push('*/');
	
	var files = fs.createScanner('src')
		.include('**/*.js')
		.scan();

	var content = utils.map(files, function (file) {
		return fs.readFile(file);
	});

	fs.writeFile(fs.combinePaths('build', buildName, buildName + '.js'), header.concat(content).join('\n'));

	var uglifyjs = require('tools/uglifyjs/uglify-js');
	content = uglifyjs(content.join('\n'));
	fs.writeFile(fs.combinePaths('build', buildName, buildName + '.min.js'), header.concat(content).join('\n'));
	
	fs.zipPath(fs.combinePaths('build', buildName), fs.combinePaths('build', buildName + '.zip'));
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

task('release', [ 'build' ], function () {
	version.patch += 1;
	fs.writeFile('version.json', JSON.stringify(version));
});


