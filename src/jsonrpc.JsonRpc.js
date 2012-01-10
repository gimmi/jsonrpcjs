jsonrpc = window.jsonrpc || { };

jsonrpc.JsonRpc = function(url) {
	this._url = url;
	this._id = 0;
};

jsonrpc.JsonRpc.prototype = {
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