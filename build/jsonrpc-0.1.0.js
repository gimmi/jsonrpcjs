/*
JsonRpcJs version 0.1.0

http://github.com/gimmi/jsonrpcjs/

Copyright 2012 Gian Marco Gherardi

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
JsonRpc = function(url) {
	this._url = url;
	this._id = 0;
};

JsonRpc.prototype = {
	call: function(/* ... */) {
		var args = this._getParams.apply(this, arguments);

		this._doJsonPost(this._url, args.request, function(success, data) {
			if (!success) {
				data = { error: { message: data } };
			}
			success = success && !data.error;
			data = (success ? data.result : data.error.message);
			if (success) {
				args.success.call(args.scope, data);
			} else {
				args.failure.call(args.scope, data);
			}
			args.callback.call(args.scope, success, data);
		});
	},

	_getParams: function() {
		var args = Array.prototype.slice.call(arguments),
			ret = {
				request: {
					jsonrpc: '2.0',
					id: ++this._id,
					method: args.shift()
				}
			};

		ret.request.params = [];
		while (args.length > 1 && !this._isFunction(args[0])) {
			ret.request.params.push(args.shift());
		}

		if (this._isFunction(args[0])) {
			ret.success = args[0];
			ret.scope = args[1];
		} else {
			ret.success = args[0].success;
			ret.failure = args[0].failure;
			ret.callback = args[0].callback;
			ret.scope = args[0].scope;
		}
		ret.success = ret.success || function() { return; };
		ret.failure = ret.failure || function() { return; };
		ret.callback = ret.callback || function() { return; };

		return ret;
	},

	_isFunction: function(v) {
		return Object.prototype.toString.apply(v) === '[object Function]';
	},

	_doJsonPost: function(url, data, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onreadystatechange = function() {
			if (xhr.readyState !== 4) {
				return;
			}

			var contentType = xhr.getResponseHeader('Content-Type');

			if (xhr.status !== 200) {
				callback(false, 'Expected HTTP response "200 OK", found "' + xhr.status + ' ' + xhr.statusText + '"');
			} else if (contentType.indexOf('application/json') !== 0) {
				callback(false, 'Expected JSON encoded response, found "' + contentType + '"');
			} else {
				callback(true, JSON.parse(this.responseText));
			}
		};
		xhr.send(JSON.stringify(data));
	}
};