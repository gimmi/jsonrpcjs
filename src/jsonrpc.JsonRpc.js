jsonrpc = window.jsonrpc || { };

jsonrpc.JsonRpc = function(url) {
	this._url = url;
	this._id = 0;
	this.loading = new jsonrpc.Observable();
	this.loaded = new jsonrpc.Observable();
	this._loadingState = new jsonrpc.CallStack(this.loading.trigger, this.loading, this.loaded.trigger, this.loaded);
	this._requests = [];
};

jsonrpc.JsonRpc.prototype = {
	call: function(/* ... */) {
		var args = this._getParams.apply(this, arguments);

		this._loadingState.enter();
		this._requests.push(args);

		this._doRequest();
	},

	_doRequest: function () {
		var me = this,
			requests = this._requests,
			data = [],
			i;

		this._requests = [];

		for (i = 0; i < requests.length; i += 1) {
			requests[i].request.id = i;
			data.push(requests[i].request);
		}

		if(data.length === 1) {
			data = data[0];
		}

		me._doJsonPost(me._url, data, function(htmlSuccess, htmlResponse) {
			var responses,
				success,
				response;
			if (htmlSuccess) {
				responses = (me._isArray(htmlResponse) ? htmlResponse : [htmlResponse]);
			} else {
				responses = [];
				for (i = 0; i < requests.length; i += 1) {
					responses[i] = { id:i, error:{ message:htmlResponse } };
				}
			}
			for (i = 0; i < responses.length; i += 1) {
				me._loadingState.exit();
				success = htmlSuccess && !responses[i].error;
				response = (success ? responses[i].result : responses[i].error.message);
				if (success) {
					requests[responses[i].id].success.call(requests[responses[i].id].scope, response);
				} else {
					requests[responses[i].id].failure.call(requests[responses[i].id].scope, response);
				}
				requests[responses[i].id].callback.call(requests[responses[i].id].scope, success, response);
			}
		});
	},

	_getParams: function(/* ... */) {
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

	_isArray: function (v) {
		return Object.prototype.toString.apply(v) === '[object Array]';
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