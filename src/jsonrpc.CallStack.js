jsonrpc = window.jsonrpc || { };

jsonrpc.CallStack = function (enterFn, enterScope, exitFn, exitScope) {
	this._counter = 0;
	this._enterFn = enterFn;
	this._exitFn = exitFn;
	this._enterScope = enterScope;
	this._exitScope = exitScope;
};

jsonrpc.CallStack.prototype = {
	enter: function () {
		this._counter = (this._counter < 0 ? 1 : this._counter + 1);
		if(this._counter === 1) {
			this._enterFn.apply(this._enterScope, arguments);
		}
	},
	
	exit: function (fn) {
		this._counter -= 1;
		if (this._counter === 0) {
			this._exitFn.apply(this._exitScope, arguments);
		}
	}
};
