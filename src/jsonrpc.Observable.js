jsonrpc = window.jsonrpc || { };

jsonrpc.Observable = function () {
	this._events = {};
};

jsonrpc.Observable.prototype = {
	bind: function (event, fn, scope) {
		var token = { event: event, fn: fn, scope: scope || this };
		this._events[event] = this._events[event] || [];
		this._events[event].push(token);
		return token;
	},
	
	unbind: function (token) {
		var listeners = this._events[token.event] || [],
			idx = listeners.indexOf(token);
		if (idx !== -1) {
			listeners.splice(idx, 1);
		}
	},
	
	trigger: function (event /* ... */) {
		var i, args = Array.prototype.slice.call(arguments).slice(1);
		this._eachListener(event, function (listener) {
			listener.fn.apply(listener.scope, args);
		}, this);
	},
	
	_eachEvent: function (fn, scope) {
		var event;
		for (event in this._events) {
			if (items.hasOwnProperty(event)) {
				fn.call(scope, event, this._events[event]);
			}
		}
	},
	
	_eachListener: function (event, fn, scope) {
		var i, listeners = this._events[event] || [];
		for (i = 0; i < listeners.length; i += 1) {
			fn.call(scope, listeners[i], i, listeners);
		}
	}
};