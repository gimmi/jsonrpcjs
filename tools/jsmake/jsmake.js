/*
JSMake version 0.8.37

http://gimmi.github.com/jsmake/

Copyright 2011 Gian Marco Gherardi

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/** @namespace Top level namespace for JSMake  */
jsmake = this.jsmake || {};

jsmake.Rhino = {
	translateJavaString: function (javaString) {
		if (javaString === null) {
			return null;
		}
		if (javaString === undefined) {
			return undefined;
		}
		return String(javaString);
	}
};
/** @class Various helper methods to make working with Javascript easier */
jsmake.Utils = {
	/**
	 * Return the same string with escaped regex chars, in order to be safely included as part of regex
	 * @param {String} str string to escape
	 * @returns {String} escaped string
	 */
	escapeForRegex: function (str) {
		return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	},
	/**
	 * @param v
	 * @returns {Boolean} true if passed value is an array
	 */
	isArray: function (v) {
		// Check ignored test 'isArray should show strange behavior on Firefox'
		return Object.prototype.toString.apply(v) === '[object Array]';
	},
	/**
	 * @param v
	 * @returns {Boolean} true if passed value is an argument object
	 */
	isArguments: function (v) {
		return !!(v && Object.prototype.hasOwnProperty.call(v, 'callee'));
	},
	/**
	 * @param v
	 * @returns {Array} passed value, converted to array
	 */
	toArray: function (v) {
		if (this.isEmpty(v)) {
			return [];
		} else if (this.isArray(v)) {
			return v;
		} else if (this.isArguments(v)) {
			return Array.prototype.slice.call(v);
		} else {
			return [ v ];
		}
	},
	/**
	 * @param v
	 * @returns {Boolean} true if passed value is an object
	 */
	isObject : function (v) {
		return !!v && Object.prototype.toString.call(v) === '[object Object]';
	},
	/**
	 * @param v
	 * @returns {Boolean} true if passed value is a number
	 */
	isNumber: function (v) {
		return typeof v === 'number' && isFinite(v);
	},
	/**
	 * @param v
	 * @returns {Boolean} true if passed value is null, undefined or empty array
	 */
	isEmpty : function (v) {
		return v === null || v === undefined || ((this.isArray(v) && !v.length));
	},
	/**
	 * @param v
	 * @returns {Boolean} true if passed value is a function
	 */
	isFunction : function (v) {
		return Object.prototype.toString.apply(v) === '[object Function]';
	},
	/**
	 * @param v
	 * @returns {Boolean} true if passed value is a string
	 */
	isString: function (value) {
		return typeof value === 'string';
	},
	/**
	 * @param {String} str string to trim
	 * @returns {String} passed value with head and tail spaces removed
	 */
	trim: function (str) {
		return str.replace(/(?:^\s+)|(?:\s+$)/g, '');
	},
	/**
	 * A function that does nothing, useful to pass around as null value
	 */
	EMPTY_FN: function () {
	},
	/**
	 * Iterate over each element of items.
	 * @param items the collection on which iterate, can be anything
	 * @param {Function} fn the funcion to call for each element in items.
	 * Will be called with the following parameters: currentItem, itemIndex, items.
	 * If function returns truthy value then iteration will stop
	 * @param {Object} [scope] 'this' binding for function
	 * @example
	 * // Array iteration: the following code logs
	 * // item=a, index=0, items=[a,b]
	 * // item=b, index=1, items=[a,b]
	 * jsmake.Utils.each([ 'a', 'b'], function (item, index, items) {
	 *     jsmake.Sys.log('item=' + item + ', index=' + index + ', items=' + items);
	 * }, this);
	 * // Object iteration: the following code logs
	 * // item=1, index=a, items=[object]
	 * // item=2, index=b, items=[object]
	 * jsmake.Utils.each({ a: 1, b: 2 }, function (item, index, items) {
	 *     jsmake.Sys.log('item=' + item + ', index=' + index + ', items=' + items);
	 * }, this);
	 */
	each: function (items, fn, scope) {
		var key;
		if (this.isObject(items)) {
			for (key in items) {
				if (items.hasOwnProperty(key)) {
					if (fn.call(scope, items[key], key, items)) {
						return;
					}
				}
			}
		} else {
			items = this.toArray(items);
			for (key = 0; key < items.length; key += 1) {
				if (fn.call(scope, items[key], key, items)) {
					return;
				}
			}
		}
	},
	/**
	 * Filter collection, returning elements that satisfy passed criteria
	 * @param items can be anything, see {@link jsmake.Utils.each}
	 * @param {Function} fn filter criteria, will be called for each element in items, passing current element as parameter.
	 * Must return falsy value to indicate that the element should be filtered out
	 * @param {Object} [scope] 'this' binding for function
	 * @returns {Array} filtered values
	 * @example
	 * // returns [ 1, 2 ]
	 * jsmake.Utils.filter([ 1, 2, 3 ], function (item) {
	 *     return item < 3;
	 * });
	 */
	filter: function (items, fn, scope) {
		var ret = [];
		this.each(items, function (item) {
			if (fn.call(scope, item)) {
				ret.push(item);
			}
		}, this);
		return ret;
	},
	/**
	 * Transform each item in passed collection, returning a new array with transformed items
	 * @param items can be anything, see {@link jsmake.Utils.each}
	 * @param {Function} fn transformation function, will be called for each element in items.
	 * Will be called with the following parameters: currentItem, itemIndex, items.
	 * If function returns truthy value then iteration will stop
	 * Must return the transformed item
	 * @param {Object} [scope] 'this' binding for function
	 * @returns {Array} new array with transformed items
	 * @example
	 * // returns [ 4, 9 ]
	 * jsmake.Utils.map([ 2, 3 ], function (item, index, items) {
	 *     return item * item;
	 * });
	 */
	map: function (items, fn, scope) {
		var ret = [];
		this.each(items, function (item, index, items) {
			ret.push(fn.call(scope, item, index, items));
		}, this);
		return ret;
	},
	/**
	 * @example
	 * // returns 'items are: 2 3 '
	 * jsmake.Utils.reduce([ 2, 3 ], function (memo, item, index, items) {
	 *     return memo + item + ' ';
	 * }, 'items are: ');
	 */
	reduce: function (items, fn, memo, scope) {
		this.each(items, function (item, index, items) {
			memo = fn.call(scope, memo, item, index, items);
		}, this);
		return memo;
	},
	/**
	 * @example
	 * jsmake.Utils.contains([ 2, 3 ], 3); // returns true
	 * jsmake.Utils.contains([ 2, 3 ], 4); // returns false
	 */
	contains: function (items, item) {
		var ret = false;
		this.each(items, function (it) {
			ret = (it === item);
			return ret;
		}, this);
		return ret;
	},
	/**
	 * @example
	 * jsmake.Utils.distinct([ 2, 3, 2, 3 ]); // returns [ 2, 3 ]
	 */
	distinct: function (items) {
		var ret = [];
		this.each(items, function (item) {
			if (!this.contains(ret, item)) {
				ret.push(item);
			}
		}, this);
		return ret;
	},
	/**
	 * @example
	 * jsmake.Utils.flatten([ 1, [ 2, 3 ], [ 4, [ 5, 6 ] ] ]); // returns [ 1, 2, 3, 4, 5, 6 ]
	 */
	flatten: function (items) {
		return this.reduce(items, function (memo, item) {
			if (this.isArray(item)) {
				memo = memo.concat(this.flatten(item));
			} else {
				memo.push(item);
			}
			return memo;
		}, [], this);
	}
};

jsmake.Project = function (logger) {
	this._tasks = {};
	this._logger = logger;
};
jsmake.Project.prototype = {
	addTask: function (task) {
		this._tasks[task.getName()] = task;
	},
	getTask: function (name) {
		var task = this._tasks[name];
		if (!task) {
			throw "Task '" + name + "' not defined";
		}
		return task;
	},
	getTasks: function (name) {
		var tasks = [];
		this._fillDependencies(this.getTask(name), tasks, new jsmake.RecursionChecker('Task recursion found'));
		return jsmake.Utils.distinct(tasks);
	},
	runTask: function (name, args) {
		var tasks, taskNames;
		tasks = this.getTasks(name);
		taskNames = jsmake.Utils.map(tasks, function (task) {
			return task.getName();
		}, this);
		this._logger.log('Task execution order: ' + taskNames.join(', '));
		jsmake.Utils.each(tasks, function (task) {
			task.run(task.getName() === name ? args : []);
		}, this);
	},
	_fillDependencies: function (task, tasks, recursionChecker) {
		recursionChecker.wrap(task.getName(), function () {
			jsmake.Utils.each(task.getTaskNames(), function (taskName) {
				var task = this.getTask(taskName);
				this._fillDependencies(task, tasks, recursionChecker);
			}, this);
			tasks.push(task);
		}, this);
	}
};

jsmake.Task = function (name, taskNames, body, logger) {
	this._name = name;
	this._taskNames = taskNames;
	this._body = body;
	this._logger = logger;
};
jsmake.Task.prototype = {
	getName: function () {
		return this._name;
	},
	getTaskNames: function () {
		return this._taskNames;
	},
	run: function (args) {
		this._logger.log('Executing task ' + this._name);
		this._body.apply({}, args);
	}
};

jsmake.RecursionChecker = function (message) {
	this._message = message;
	this._stack = [];
};
jsmake.RecursionChecker.prototype = {
	enter: function (id) {
		this._check(id);
		this._stack.push(id);
	},
	exit: function () {
		this._stack.pop();
	},
	wrap: function (id, fn, scope) {
		this.enter(id);
		try {
			fn.call(scope);
		} finally {
			this.exit();
		}
	},
	_check: function (id) {
		if (jsmake.Utils.contains(this._stack, id)) {
			this._stack.push(id);
			throw this._message + ': ' + this._stack.join(' => ');
		}
	}
};

jsmake.AntPathMatcher = function (pattern, caseSensitive) {
	this._pattern = pattern;
	this._caseSensitive = caseSensitive;
};
jsmake.AntPathMatcher.prototype = {
	match: function (path) {
		var patternTokens, pathTokens;
		patternTokens = this._tokenize(this._pattern);
		pathTokens = this._tokenize(path);
		return this._matchTokens(patternTokens, pathTokens);
	},
	_matchTokens: function (patternTokens, pathTokens) {
		var patternToken, pathToken;
		while (true) {
			patternToken = patternTokens.shift();
			if (patternToken === '**') {
				pathTokens = pathTokens.slice(-patternTokens.length).reverse();
				patternTokens = patternTokens.reverse();
				return this._matchTokens(patternTokens, pathTokens);
			}
			pathToken = pathTokens.shift();
			if (patternToken && pathToken) {
				if (!this._matchToken(patternToken, pathToken)) {
					return false;
				}
			} else if (patternToken && !pathToken) {
				return false;
			} else if (!patternToken && pathToken) {
				return false;
			} else {
				return true;
			}
		}
	},
	_matchToken: function (patternToken, pathToken) {
		var regex = '', i, ch;
		for (i = 0; i < patternToken.length; i += 1) {
			ch = patternToken.charAt(i);
			if (ch === '*') {
				regex += '.*';
			} else if (ch === '?') {
				regex += '.{1}';
			} else {
				regex += jsmake.Utils.escapeForRegex(ch);
			}
		}
		return new RegExp('^' + regex + '$', (this._caseSensitive ? '' : 'i')).test(pathToken);
	},
	_tokenize: function (pattern) {
		var tokens = pattern.split(/\\+|\/+/);
		tokens = jsmake.Utils.map(tokens, function (token) {
			return jsmake.Utils.trim(token);
		}, this);
		tokens = jsmake.Utils.filter(tokens, function (token) {
			return !/^[\s\.]*$/.test(token);
		}, this);
		if (tokens[tokens.length - 1] === '**') {
			throw 'Invalid ** wildcard at end pattern, use **/* instead'; // TODO maybe useless
		}
		// TODO invalid more then one **
		return tokens;
	}
};

/**
 * @class Contains methods for system interaciont and informations
 */
jsmake.Sys = {
	/**
	 * Returns if OS is Windows
	 * @returns true if running on Windows
	 */
	isWindowsOs: function () {
		return jsmake.Fs.getPathSeparator() === '\\';
	},
	runCommand: function (command, opts) {
		return runCommand(command, opts);
	},
	/**
	 * Create a runner object, used to define and invoke an external program
	 * @param {String} command the path of the command executable
	 * @return {jsmake.CommandRunner} CommandRunner instance to fluently configure and run command
	 * @see jsmake.CommandRunner
	 * @example
	 * // runs '/path/to/cmd.exe par1 par2 par3 par4'
	 * jsmake.Sys.createRunner('/path/to/cmd.exe')
	 *     .args('par1', 'par2')
	 *     .args([ 'par3', 'par4' ])
	 *     .run();
	 */
	createRunner: function (command) {
		return new jsmake.CommandRunner(command);
	},
	/**
	 * Returns environment variable value
	 * @param {String} name name of the environment variable
	 * @param {String} [def] default value to return if environment variable not defined.
	 * @returns {String} environment variable value if found, or default value.
	 * @throws {Error} if environment variable is not found and no default value passed.
	 */
	getEnvVar: function (name, def) {
		var val = jsmake.Rhino.translateJavaString(java.lang.System.getenv(name));
		return this._getEnvVar(name, val, def);
	},
	/**
	 * Log message to the console
	 * @param {String} msg the message to log
	 */
	log: function (msg) {
		print(msg);
	},
	_getEnvVar: function (name, val, def) {
		if (val !== null) {
			return val;
		}
		if (def !== undefined) {
			return def;
		}
		throw 'Environment variable "' + name + '" not defined.';
	}
};

/** @class Contains methods for working with filesystem */
jsmake.Fs = {
	/**
	 * Create a zip file containing specified file/directory
	 * @param {String} srcPath file/directory to zip
	 * @param {String} destFile zip file name
	 */
	zipPath: function (srcPath, destFile) {
		jsmake.PathZipper.zip(srcPath, destFile);
	},
	/**
	 * Create a filesystem scanner
	 * @param {String} basePath the path to scan for children tha match criteria
	 * @returns {jsmake.FsScanner} FsScanner instance to fluently configure and run scanner
	 * @see jsmake.FsScanner
	 * @example
	 * // returns all js and java files in \home folder, including subfolders, excluding .git folders
	 * jsmake.Fs.createScanner('\home')
	 *     .include('**\*.js')
	 *     .include('**\*.java')
	 *     .exclude('**\.git')
	 *     .scan();
	 */
	createScanner: function (basePath) {
		return new jsmake.FsScanner(basePath, this.isCaseSensitive());
	},
	/**
	 * Return default OS character encoding
	 * @returns {String} Character encoding, e.g. 'UTF-8' or 'Cp1252'
	 */
	getCharacterEncoding: function () {
		return java.lang.System.getProperty("file.encoding", "UTF-8"); // Windows default is "Cp1252"
	},
	/**
	 * Return OS path separator
	 * @returns {String} path separator, e.g. '/' or '\'
	 */
	getPathSeparator: function () {
		return jsmake.Rhino.translateJavaString(java.io.File.separator);
	},
	/**
	 * Returns true if OS has case sensitive filesystem
	 * @returns {Boolean} true if OS has case sensitive filesystem
	 */
	isCaseSensitive: function () {
		return !jsmake.Sys.isWindowsOs();
	},
	/**
	 * Read text file content
	 * @param {String} path path of the file to read
	 * @param {String} [characterEncoding=OS default]
	 * @returns {String} text content
	 */
	readFile: function (path, characterEncoding) {
		characterEncoding = characterEncoding || this.getCharacterEncoding();
		if (!this.fileExists(path)) {
			throw "File '" + path + "' not found";
		}
		return readFile(path, characterEncoding);
	},
	/**
	 * Write String to file, creating all necessary parent directories and overwriting if file already exists
	 * @param {String} path path of the file to write
	 * @param {String} content file content
	 * @param {String} [characterEncoding=OS default]
	 */
	writeFile: function (path, content, characterEncoding) {
		characterEncoding = characterEncoding || this.getCharacterEncoding();
		this.createDirectory(this.getParentDirectory(path));
		var out = new java.io.FileOutputStream(new java.io.File(path));
		content = new java.lang.String(content || '');
		try {
			out.write(content.getBytes(characterEncoding));
		} finally {
			out.close();
		}
	},
	/**
	 * Extract last element from a path
	 * @param {String} path the source path
	 * @returns {String} the name of the last element in the path
	 * @example
	 * jsmake.Fs.getName('/users/gimmi/file.txt'); // returns 'file.txt'
	 */
	getName: function (path) {
		return jsmake.Rhino.translateJavaString(new java.io.File(path).getName());
	},
	/**
	 * Copy file or directory to another directory
	 * @param {String} srcPath source file/directory. Must exists
	 * @param {String} destDirectory destination directory
	 */
	copyPath: function (srcPath, destDirectory) {
		if (this.fileExists(srcPath)) {
			this._copyFile(srcPath, destDirectory);
		} else if (this.directoryExists(srcPath)) {
			this._copyDirectory(srcPath, destDirectory);
		} else {
			throw "Cannot copy source path '" + srcPath + "', it does not exists";
		}
	},
	/**
	 * @param {String} path file or directory path
	 * @returns {Boolean} true if file or directory exists
	 */
	pathExists: function (path) {
		return new java.io.File(path).exists();
	},
	/**
	 * @param {String} path directory path
	 * @returns {Boolean} true if path exists and is a directory
	 */
	directoryExists: function (path) {
		var file = new java.io.File(path);
		return file.exists() && file.isDirectory();
	},
	/**
	 * @param {String} path file path
	 * @returns {Boolean} true if path exists and is a file
	 */
	fileExists: function (path) {
		var file = new java.io.File(path);
		return file.exists() && file.isFile();
	},
	/**
	 * Create directory and all necessary parents
	 * @param {String} path directory to create
	 */
	createDirectory: function (path) {
		var file = new java.io.File(path);
		if (file.exists() && file.isDirectory()) {
			return;
		}
		if (!file.mkdirs()) {
			throw "Failed to create directories for path '" + path + "'";
		}
	},
	/**
	 * Delete file or directory, with all cild elements
	 * @param {String} path to delete
	 */
	deletePath: function (path) {
		if (!this.pathExists(path)) {
			return;
		}
		jsmake.Utils.each(jsmake.Fs.getChildPathNames(path), function (name) {
			this.deletePath(this.combinePaths(path, name));
		}, this);
		if (!new java.io.File(path)['delete']()) {
			throw "'Unable to delete path '" + path + "'";
		}
	},
	/**
	 * Transform a path to absolute, removing '.' and '..' references
	 * @param {String} path path to translate
	 * @returns {String} path in canonical form
	 * @example
	 * jsmake.Fs.getCanonicalPath('../file.txt'); // returns '/users/file.txt'
	 */
	getCanonicalPath: function (path) {
		return jsmake.Rhino.translateJavaString(new java.io.File(path).getCanonicalPath());
	},
	/**
	 * Returns parent path
	 * @param {String} path
	 * @returns {String} parent path
	 */
	getParentDirectory: function (path) {
		return jsmake.Rhino.translateJavaString(new java.io.File(path).getCanonicalFile().getParent());
	},
	/**
	 * Combine all passed path fragments into one, using OS path separator. Supports any number of parameters.
	 * @example
	 * jsmake.Fs.combinePaths('home', 'gimmi', [ 'dir/subdir', 'file.txt' ]);
	 * // returns 'home/gimmi/dir/subdir/file.txt'
	 */
	combinePaths: function () {
		var paths = jsmake.Utils.flatten(arguments);
		return jsmake.Utils.reduce(paths, function (memo, path) {
			return (memo ? this._javaCombine(memo, path) : path);
		}, null, this);
	},
	getChildPathNames: function (basePath) {
		return this._listFilesWithFilter(basePath, function () {
			return true;
		});
	},
	getChildFileNames: function (basePath) {
		return this._listFilesWithFilter(basePath, function (fileName) {
			return new java.io.File(fileName).isFile();
		});
	},
	getChildDirectoryNames: function (basePath) {
		return this._listFilesWithFilter(basePath, function (fileName) {
			return new java.io.File(fileName).isDirectory();
		});
	},
	_javaCombine: function (path1, path2) {
		return jsmake.Rhino.translateJavaString(new java.io.File(path1, path2).getPath());
	},
	_copyDirectory: function (srcDirectory, destDirectory) {
		this.deletePath(destDirectory);
		this.createDirectory(destDirectory);
		jsmake.Utils.each(this.getChildFileNames(srcDirectory), function (path) {
			this.copyPath(this.combinePaths(srcDirectory, path), destDirectory);
		}, this);
		jsmake.Utils.each(this.getChildDirectoryNames(srcDirectory), function (path) {
			this.copyPath(this.combinePaths(srcDirectory, path), this.combinePaths(destDirectory, path));
		}, this);
	},
	_copyFile: function (srcFile, destDirectory) {
		var destFile = this.combinePaths(destDirectory, this.getName(srcFile));
		this.deletePath(destFile);
		this.createDirectory(destDirectory);
		this._copyFileToFile(srcFile, destFile);
	},
	_copyFileToFile: function (srcFile, destFile) {
		var input, output, buffer, n;
		input = new java.io.FileInputStream(srcFile);
		try {
			output = new java.io.FileOutputStream(destFile);
			try {
				buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024 * 4);
				while (-1 !== (n = input.read(buffer))) {
					output.write(buffer, 0, n);
				}
			} finally {
				output.close();
			}
		} finally {
			input.close();
		}
	},
	_listFilesWithFilter: function (basePath, filter) {
		var fileFilter, files;
		fileFilter = new java.io.FileFilter({ accept: filter });
		files = this._translateJavaArray(new java.io.File(basePath).listFiles(fileFilter));
		return jsmake.Utils.map(files, function (file) {
			return jsmake.Rhino.translateJavaString(file.getName());
		}, this);
	},
	_translateJavaArray: function (javaArray) {
		var ary = [], i;
		if (javaArray === null) {
			return null;
		}
		for (i = 0; i < javaArray.length; i += 1) {
			ary.push(javaArray[i]);
		}
		return ary;
	}
};
/**
 * Don't instantiate it directly, use {@link jsmake.Fs.createScanner}
 * @constructor
 */
jsmake.FsScanner = function (basePath, caseSensitive) {
	this._basePath = basePath;
	this._includeMatchers = [];
	this._excludeMatchers = [];
	this._caseSensitive = caseSensitive;
};
jsmake.FsScanner.prototype = {
	/**
	 * Add a criteria for path inclusion. If no inclusion path are specified, '**\*' is assumed
	 * @param {String} pattern
	 * @returns {jsmake.FsScanner} this instance, for chaining calls
	 * @example
	 * jsmake.Fs.createScanner('\home').include('**\*.js').scan();
	 */
	include: function (pattern) {
		this._includeMatchers.push(new jsmake.AntPathMatcher(pattern, this._caseSensitive));
		return this;
	},
	/**
	 * Add a criteria for path exclusion
	 * @param {String} pattern
	 * @returns {jsmake.FsScanner} this instance, for chaining calls
	 * @example
	 * jsmake.Fs.createScanner('\home').exclude('**\.git').scan();
	 */
	exclude: function (pattern) {
		this._excludeMatchers.push(new jsmake.AntPathMatcher(pattern, this._caseSensitive));
		return this;
	},
	/**
	 * Execute filesystem scanning with defined criterias
	 * @returns {String[]} all mathing paths
	 * @example
	 * // returns the path of all files in /home directory
	 * jsmake.Fs.createScanner('/home').scan();
	 */
	scan: function () {
		var fileNames = [];
		if (this._includeMatchers.length === 0) {
			this.include('**/*');
		}
		this._scan('.', fileNames);
		return fileNames;
	},
	_scan: function (relativePath, fileNames) {
		var fullPath = jsmake.Fs.combinePaths(this._basePath, relativePath);
		jsmake.Utils.each(jsmake.Fs.getChildFileNames(fullPath), function (fileName) {
			fileName = jsmake.Fs.combinePaths(relativePath, fileName);
			if (this._evaluatePath(fileName, false)) {
				fileNames.push(jsmake.Fs.combinePaths(this._basePath, fileName));
			}
		}, this);
		jsmake.Utils.each(jsmake.Fs.getChildDirectoryNames(fullPath), function (dir) {
			dir = jsmake.Fs.combinePaths(relativePath, dir);
			if (this._evaluatePath(dir, true)) {
				this._scan(dir, fileNames);
			}
		}, this);
	},
	_evaluatePath: function (path, def) {
		if (this._runMatchers(this._excludeMatchers, path)) {
			return false;
		}
		if (this._runMatchers(this._includeMatchers, path)) {
			return true;
		}
		return def;
	},
	_runMatchers: function (matchers, value) {
		var match = false;
		jsmake.Utils.each(matchers, function (matcher) {
			match = match || matcher.match(value);
		}, this);
		return match;
	}
};

/**
 * Don't instantiate it directly, use {@link jsmake.Sys.createRunner}
 * @constructor
 */
jsmake.CommandRunner = function (command) {
	this._command = command;
	this._arguments = [];
	this._logger = jsmake.Sys;
};
jsmake.CommandRunner.prototype = {
	/**
	 * Add all passed arguments. Supports any number of parameters.
	 * @returns {jsmake.CommandRunner} this instance, for chaining calls
	 * @example
	 * jsmake.Sys.createRunner('cmd.exe').args('par1', 'par2', [ 'par3', 'par4' ]).run();
	 */
	args: function () {
		this._arguments = this._arguments.concat(jsmake.Utils.flatten(arguments));
		return this;
	},
	/**
	 * Run configured command. if exitstatus of the command is 0 then execution is considered succesful, otherwise an exception is thrown
	 */
	run: function () {
		this._logger.log(this._command + ' ' + this._arguments.join(' '));
		var exitStatus = jsmake.Sys.runCommand(this._command, { args: this._arguments });
		if (exitStatus !== 0) {
			throw 'Command failed with exit status ' + exitStatus;
		}
	}
};
jsmake.PathZipper = {
	zip: function (srcPath, destFile) {
		var zipOutputStream = new java.util.zip.ZipOutputStream(new java.io.FileOutputStream(destFile));
		try {
			this._zip(jsmake.Fs.getParentDirectory(srcPath), jsmake.Fs.getName(srcPath), zipOutputStream);
		} finally {
			zipOutputStream.close(); // This raise exception "java.util.zip.ZipException: ZIP file must have at least one entry"
		}
	},
	_zip: function (basePath, relativePath, zipOutputStream) {
		var names, path;
		path = jsmake.Fs.combinePaths(basePath, relativePath);
		if (jsmake.Fs.fileExists(path)) {
			this._addFile(basePath, relativePath, zipOutputStream);
		} else if (jsmake.Fs.directoryExists(path)) {
			jsmake.Utils.each(jsmake.Fs.getChildPathNames(path), function (name) {
				this._zip(basePath, jsmake.Fs.combinePaths(relativePath, name), zipOutputStream);
			}, this);
		} else {
			throw "Cannot zip source path '" + path + "', it does not exists";
		}
	},
	_addFile: function (basePath, relativePath, zipOutputStream) {
		var fileInputStream, buffer, n;
		zipOutputStream.putNextEntry(new java.util.zip.ZipEntry(relativePath));
		buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024 * 4);
		fileInputStream = new java.io.FileInputStream(jsmake.Fs.combinePaths(basePath, relativePath));
		try {
			while (-1 !== (n = fileInputStream.read(buffer))) {
				zipOutputStream.write(buffer, 0, n);
			}
		} finally {
			fileInputStream.close();
		}
		zipOutputStream.closeEntry();
	}
};
/** @class Various helper methods for manipulating XML files */
jsmake.Xml = {
	/**
	 * Search nodes that match XPath in XML file.
	 * @param {String} file XML file path
	 * @param {String} xpath XPath query to search for
	 * @returns {String[]} an array of values of matching nodes
	 * @example
	 * var values = jsmake.Xml.getValues('temp/file.xml', '//series/season/episode/text()');
	 */
	getValues: function (file, xpath) {
		var i, ret = [], nodeList;
		nodeList = this._getNodeList(this._loadDocument(file), xpath);
		for (i = 0; i < nodeList.getLength(); i += 1) {
			ret.push(jsmake.Rhino.translateJavaString(nodeList.item(i).getNodeValue()));
		}
		return ret;
	},
	/**
	 * Like {@link jsmake.Xml.getValues}, but expect a single match, throwing exception otherwise.
	 * @param {String} file XML file path
	 * @param {String} xpath XPath query to search for
	 * @returns {String} value of matching node
	 * @example
	 * var episode = jsmake.Xml.getValue('temp/file.xml', '//series/season[@id="1"]/episode/text()');
	 */
	getValue: function (file, xpath) {
		var values = this.getValues(file, xpath);
		if (values.length !== 1) {
			throw "Unable to find a single element for xpath '" + xpath + "' in file '" + file + "'";
		}
		return values[0];
	},
	/**
	 * Set value of matching node in XML file. throw exception if multiple nodes match XPath.
	 * @param {String} file XML file path
	 * @param {String} xpath XPath query to search for
	 * @param {String} value value to set
	 * @example
	 * jsmake.Xml.setValue('temp/file.xml', '//series/season[@id="1"]/episode', 'new episode value');
	 */
	setValue: function (file, xpath, value) {
		var nodeList, document;
		document = this._loadDocument(file);
		nodeList = this._getNodeList(document, xpath);
		if (nodeList.getLength() !== 1) {
			throw "Unable to find a single element for xpath '" + xpath + "' in file '" + file + "'";
		}
		nodeList.item(0).setTextContent(value);
		this._saveDocument(document, file);
	},
	_getNodeList: function (document, xpath) {
		return javax.xml.xpath.XPathFactory.newInstance().newXPath().evaluate(xpath, document, javax.xml.xpath.XPathConstants.NODESET);
	},
	_loadDocument: function (file) {
		var documentBuilderFactory, document;
		documentBuilderFactory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
		documentBuilderFactory.setNamespaceAware(true);
		document = documentBuilderFactory.newDocumentBuilder().parse(file);
		return document;
	},
	_saveDocument: function (document, file) {
		var transformer;
		transformer = javax.xml.transform.TransformerFactory.newInstance().newTransformer();
		transformer.transform(new javax.xml.transform.dom.DOMSource(document), new javax.xml.transform.stream.StreamResult(new java.io.File(file)));
	}
};

jsmake.Main = function () {
	this._project = null;
	this._logger = jsmake.Sys;
};
jsmake.Main.prototype = {
	init: function (global) {
		this._project = new jsmake.Project(this._logger);
		global.task = this._bind(this._task, this);
	},
	runTask: function (name, args) {
		this._project.runTask(name, args);
	},
	// TODO document it with JSDoc
	_task: function () {
		var args = this._getTaskParameters(jsmake.Utils.toArray(arguments));
		this._project.addTask(new jsmake.Task(args[0], args[1], args[2], this._logger));
	},
	_getTaskParameters: function (args) {
		return [
			args.shift(),
			jsmake.Utils.isFunction(args[0]) ? [] : jsmake.Utils.toArray(args.shift()),
			args.shift() || jsmake.Utils.EMPTY_FN
		];
	},
	_bind: function (fn, scope) {
		return function () {
			fn.apply(scope, arguments);
		};
	}
};
