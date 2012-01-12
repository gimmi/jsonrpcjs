describe("jsonrpc.JsonRpc", function () {
	var target, fakeSuccess, fakeResponse;

	beforeEach(function () {
		target = new jsonrpc.JsonRpc('rpc');
		target._batchingMilliseconds = 0;
		spyOn(target, '_doJsonPost').andCallFake(function (url, data, callback) {
			callback(fakeSuccess, fakeResponse);
		});
	});

	it("isFunction", function () {
		expect(target._isFunction(1)).toBe(false);
		expect(target._isFunction('a')).toBe(false);
		expect(target._isFunction(undefined)).toBe(false);
		expect(target._isFunction(null)).toBe(false);
		expect(target._isFunction(function () {
		})).toBe(true);
	});

	it("isArray", function () {
		expect(target._isArray()).toBe(false);
		expect(target._isArray([])).toBe(true);
		expect(target._isArray({})).toBe(false);
		expect(target._isArray(123)).toBe(false);
		expect(target._isArray('')).toBe(false);
		expect(target._isArray('a string')).toBe(false);
		expect(target._isArray(null)).toBe(false);
		expect(target._isArray(arguments)).toBe(false);
	});

	it('should interpret call with succes function and scope', function () {
		var scope = {},
			successFn = jasmine.createSpy(),
			actual;

		actual = target._getParams('method', 1, 2, 3, successFn, scope);

		expect(actual.request.method).toEqual('method');
		expect(actual.request.params).toEqual([1, 2, 3]);
		expect(actual.success).toBe(successFn);
		expect(actual.scope).toBe(scope);
	});

	it('should batch calls within timeout', function () {
		target._batchingMilliseconds = 10;

		runs(function () {
			target.call('method1', 'par1', jasmine.createSpy(), {});
			target.call('method2', 'par2', jasmine.createSpy(), {});
			expect(target._doJsonPost).not.toHaveBeenCalled();
		});

		waits(15);

		runs(function () {
			target.call('method3', 'par3', jasmine.createSpy(), {});
		});

		waits(15);

		runs(function () {
			expect(target._doJsonPost).toHaveBeenCalledWith('rpc', [{
				jsonrpc: '2.0',
				id: 0,
				method: 'method1',
				params: ['par1']
			}, {
				jsonrpc: '2.0',
				id: 1,
				method: 'method2',
				params: ['par2']
			}], jasmine.any(Function));
			expect(target._doJsonPost).toHaveBeenCalledWith('rpc', {
				jsonrpc: '2.0',
				id: 0,
				method: 'method3',
				params: ['par3']
			}, jasmine.any(Function));
		});
	});

	it('should wrap batched call in single loading/loaded events', function () {
		var loadingFn = jasmine.createSpy(),
			loadedFn = jasmine.createSpy();
		target._batchingMilliseconds = 10;
		target.loading.bind(loadingFn);
		target.loaded.bind(loadedFn);

		runs(function () {
			expect(loadingFn.callCount).toEqual(0);
			expect(loadedFn.callCount).toEqual(0);
			target.call('method1', 'par1', jasmine.createSpy(), {});
			target.call('method2', 'par2', jasmine.createSpy(), {});
			expect(loadingFn.callCount).toEqual(1);
			expect(loadedFn.callCount).toEqual(0);
		});

		waits(15);

		runs(function () {
			expect(loadingFn.callCount).toEqual(1);
			expect(loadedFn.callCount).toEqual(1);
		});
	});

	it('should assign progressive ids', function () {
		target._batchingMilliseconds = 10;

		runs(function () {
			target.call('method1', {});
			target.call('method2', {});
			target.call('method3', {});
			target.call('method4', {});
		});

		waits(15);

		runs(function () {
			expect(target._doJsonPost).toHaveBeenCalledWith('rpc', [{
				jsonrpc: '2.0',
				id: 0,
				method: 'method1',
				params: []
			}, {
				jsonrpc: '2.0',
				id: 1,
				method: 'method2',
				params: []
			}, {
				jsonrpc: '2.0',
				id: 2,
				method: 'method3',
				params: []
			}, {
				jsonrpc: '2.0',
				id: 3,
				method: 'method4',
				params: []
			}], jasmine.any(Function));
		});
	});

	it('should interpret call with options', function () {
		var scope = {},
		    successFn = jasmine.createSpy(),
		    failureFn = jasmine.createSpy(),
		    callbackFn = jasmine.createSpy(),
			actual;

		actual = target._getParams('method', 1, 2, 3, {
			success: successFn,
			failure: failureFn,
			callback: callbackFn,
			scope: scope
		});

		expect(actual.request.method).toEqual('method');
		expect(actual.request.params).toEqual([1, 2, 3]);
		expect(actual.success).toBe(successFn);
		expect(actual.failure).toBe(failureFn);
		expect(actual.callback).toBe(callbackFn);
		expect(actual.scope).toBe(scope);
	});

	it('should do json post with expected parameters', function () {
		var scope = {},
			successFn = jasmine.createSpy();

		target.call('method', 1, 2, 3, successFn, scope);

		expect(target._doJsonPost).toHaveBeenCalledWith('rpc', {
			jsonrpc: '2.0',
			id: 0,
			method: 'method',
			params: [1, 2, 3]
		}, jasmine.any(Function));
	});

	it('should invoke expected callbacks on succesful call', function () {
		var scope = {},
		    successFn = jasmine.createSpy(),
		    failureFn = jasmine.createSpy(),
		    callbackFn = jasmine.createSpy();

		fakeSuccess = true;
		fakeResponse = { id: 0, result: 'return val' };

		target.call('method', 1, 2, 3, {
			success: successFn,
			failure: failureFn,
			callback: callbackFn,
			scope: scope
		});

		expect(failureFn).not.toHaveBeenCalled();
		expect(successFn).toHaveBeenCalledWith('return val');
		expect(successFn.callCount).toBe(1);
		expect(successFn.mostRecentCall.object).toBe(scope);
		expect(callbackFn).toHaveBeenCalledWith(true, 'return val');
		expect(callbackFn.callCount).toBe(1);
		expect(callbackFn.mostRecentCall.object).toBe(scope);
	});

	it('should invoke expected callbacks on transport error', function () {
		var scope = {},
		    successFn = jasmine.createSpy(),
		    failureFn = jasmine.createSpy(),
		    callbackFn = jasmine.createSpy();

		fakeSuccess = false;
		fakeResponse = 'error msg';

		target.call('method', 1, 2, 3, {
			success: successFn,
			failure: failureFn,
			callback: callbackFn,
			scope: scope
		});

		expect(failureFn).toHaveBeenCalledWith('error msg');
		expect(failureFn.callCount).toBe(1);
		expect(successFn).not.toHaveBeenCalled();
		expect(callbackFn).toHaveBeenCalledWith(false, 'error msg');
		expect(callbackFn.callCount).toBe(1);
	});

	it('should invoke expected callbacks on rpc error', function () {
		var scope = {},
		    successFn = jasmine.createSpy(),
		    failureFn = jasmine.createSpy(),
		    callbackFn = jasmine.createSpy();

		fakeSuccess = true;
		fakeResponse = { id: 0, error: { message: 'rpc error' } };

		target.call('method', 1, 2, 3, {
			success: successFn,
			failure: failureFn,
			callback: callbackFn,
			scope: scope
		});

		expect(failureFn).toHaveBeenCalledWith('rpc error');
		expect(failureFn.callCount).toBe(1);
		expect(successFn).not.toHaveBeenCalled();
		expect(callbackFn).toHaveBeenCalledWith(false, 'rpc error');
		expect(callbackFn.callCount).toBe(1);
	});

	it('should trigger loading and loaded events', function () {
		var loadingFn = jasmine.createSpy(),
		    loadedFn = jasmine.createSpy();

		target.loading.bind(loadingFn);
		target.loaded.bind(loadedFn);
		fakeSuccess = true;
		fakeResponse = { id: 0, result: 'return val' };

		target.call('method', 1, 2, 3, function () {});

		expect(loadingFn.callCount).toBe(1);
		expect(loadedFn.callCount).toBe(1);
	});

	it('should support responses in different order than requests', function () {
		// TODO
	});
});
