jsonrpc = window.jsonrpc || { };

jsonrpc.CallStack = function (enterFn, exitFn, scope) {
	this._counter = 0;
	this._enterFn = enterFn;
	this._exitFn = exitFn;
	this._scope = scope || this;
};

jsonrpc.CallStack.prototype = {
	enter: function () {
		this._counter = (this._counter < 0 ? 1 : this._counter + 1);
		if(this._counter === 1) {
			this._enterFn.apply(this._scope, arguments);
		}
	},
	exit: function (fn) {
		this._counter -= 1;
		if (this._counter === 0) {
			this._exitFn.apply(this._scope, arguments);
		}
	}
};
