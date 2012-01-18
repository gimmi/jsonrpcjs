load('tools/jslint/jslint.js');
load('tools/jsmake.javascript.JavascriptUtils.js');

var uglifyjs = require('tools/uglifyjs/uglify-js');
var fs = jsmake.Fs;
var utils = jsmake.Utils;
var sys = jsmake.Sys;
var js = new jsmake.javascript.JavascriptUtils();

var version, buildName;

task('default', 'build');

task('version', function () {
	version = JSON.parse(fs.readFile('version.json'));
	buildName = 'jsonrpcjs-' + [ version.major, version.minor, version.patch ].join('.');
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

task('build', ['version', 'jslint'], function () {
	fs.deletePath(fs.combinePaths('build', buildName));
	
	var header = [];
	header.push('/*');
	header.push(buildName);
	header.push('');
	header.push('http://github.com/gimmi/jsonrpcjs/');
	header.push('');
	header.push(fs.readFile('LICENSE'));
	header.push('*/');
	header = header.join('\n');

	var files = fs.createScanner('src')
		.include('**/*.js')
		.scan();

	var content = utils.map(files, function (file) {
		return fs.readFile(file);
	}).join('\n');

	var fileName = fs.combinePaths('build', buildName, buildName + '.amd.js');
	var fileContent = [
		header,
		'define(function () {',
		'var jsonrpc = {};',
		content,
		'return jsonrpc.JsonRpc;',
		'});'
	].join('\n');
	fs.writeFile(fileName, fileContent);

	fileName = fs.combinePaths('build', buildName, buildName + '.js');
	fileContent = header + '\njsonrpc = {};\n' + content;
	fs.writeFile(fileName, fileContent);

	fileName = fs.combinePaths('build', buildName, buildName + '.min.js');
	fileContent = header + '\n' + uglifyjs('jsonrpc = {};' + content);
	fs.writeFile(fileName, fileContent);
	
	fs.zipPath(fs.combinePaths('build', buildName), fs.combinePaths('build', buildName + '.zip'));
});

task('test', 'build', function () {
	var runner = jsmake.Sys.createRunner('java');
	runner.args('-cp', 'tools/jsmake/js.jar');
	runner.args('org.mozilla.javascript.tools.shell.Main'); 
	// runner.args('org.mozilla.javascript.tools.debugger.Main');
	runner.args('-modules', '.');
	runner.args('specrunner.js');
	var files = fs.createScanner('.')
		.include(fs.combinePaths('build', buildName, buildName + '.js'))
		.include('/test/**/*.js')
		.scan();
	utils.each(files, function (file) {
		runner.args(file);
	});
	runner.run();
});

task('release', 'test', function () {
	version.patch += 1;
	fs.writeFile('version.json', JSON.stringify(version));
});


