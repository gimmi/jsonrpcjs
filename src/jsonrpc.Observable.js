jsonrpc.Observable = function () {
	this._listeners = [];
};

jsonrpc.Observable.prototype = {
	bind: function (fn, scope) {
		var token = { fn: fn, scope: scope || this };
		this._listeners.push(token);
		return token;
	},

	unbind: function (token) {
		var idx = this._listeners.indexOf(token);
		if (idx !== -1) {
			this._listeners.splice(idx, 1);
		}
	},

	trigger: function () {
		var i;
		for (i = 0; i < this._listeners.length; i += 1) {
			this._listeners[i].fn.apply(this._listeners[i].scope, arguments);
		}
	}
};