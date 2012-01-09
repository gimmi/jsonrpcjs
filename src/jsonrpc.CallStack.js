jsonrpc = window.jsonrpc || { };

jsonrpc.CallStack = function () {
	this._counter = 0;
};

jsonrpc.CallStack.prototype = {
	wrapEnterFn: function (fn, scope) {
		var me = this;
		return function () {
			me._counter = (me._counter < 0 ? 1 : me._counter + 1);
			if(me._counter === 1) {
				fn.apply(this, arguments);
			}
		};
	},
	wrapExitFn: function (fn) {
		var me = this;
		return function () {
			me._counter -= 1;
			if (me._counter === 0) {
				fn.apply(this, arguments);
			}
		};
	}
};
