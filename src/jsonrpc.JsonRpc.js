jsonrpc.JsonRpc = function (url) {
	this._url = url;
	this.loading = new jsonrpc.Observable();
	this.loaded = new jsonrpc.Observable();
	this.unhandledFailure = new jsonrpc.Observable();
	this._loadingState = new jsonrpc.CallStack(this.loading.trigger, this.loading, this.loaded.trigger, this.loaded);
	this._requests = [];
	this._batchingMilliseconds = 10;
	this._delayedTask = new jsonrpc.DelayedTask();
};

jsonrpc.JsonRpc.prototype = {
	setBatchingMilliseconds: function (value) {
		this._batchingMilliseconds = value;
	},

	call: function () {
		var args = this._getParams.apply(this, arguments);

		this._loadingState.enter();
		this._requests.push(args);

		if (this._batchingMilliseconds) {
			this._delayedTask.delay(this._batchingMilliseconds, this._sendRequests, this);
		} else {
			this._sendRequests();
		}
	},

	_sendRequests: function () {
		var me = this,
			requests = this._requests,
			data = [],
			i;

		this._requests = [];

		for (i = 0; i < requests.length; i += 1) {
			requests[i].request.id = i;
			data.push(requests[i].request);
		}

		if (data.length === 1) {
			data = data[0];
		}

		me._doJsonPost(me._url, data, function (htmlSuccess, htmlResponse) {
			var responses;
			if (htmlSuccess) {
				responses = (me._isArray(htmlResponse) ? htmlResponse : [htmlResponse]);
			} else {
				responses = [];
				for (i = 0; i < requests.length; i += 1) {
					responses[i] = { id: i, error: { message: htmlResponse } };
				}
			}
			me._handleResponses(requests, responses);
		});
	},

	_handleResponses: function (requests, responses) {
		var i, response, request;
		for (i = 0; i < responses.length; i += 1) {
			response = responses[i];
			request = requests[response.id];
			this._handleResponse(request, response);
		}
	},

	_handleResponse: function (request, response) {
		var success = !response.error,
			ret = (success ? response.result : response.error.message);

		this._loadingState.exit();

		if (success) {
			request.success.call(request.scope, ret);
		} else {
			request.failure.call(request.scope, ret);
		}
		request.callback.call(request.scope, success, ret);
	},

	_getParams: function () {
		var me = this,
			args = Array.prototype.slice.call(arguments),
			ret = {
				request: {
					jsonrpc: '2.0',
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
		ret.success = ret.success || function () { return; };
		ret.failure = ret.failure || function () { me.unhandledFailure.trigger.apply(me.unhandledFailure, arguments); };
		ret.callback = ret.callback || function () { return; };

		return ret;
	},

	_isArray: function (v) {
		return Object.prototype.toString.apply(v) === '[object Array]';
	},

	_isFunction: function (v) {
		return Object.prototype.toString.apply(v) === '[object Function]';
	},

	_doJsonPost: function (url, data, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onreadystatechange = function () {
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