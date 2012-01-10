describe('jsonrpc.DelayedTask', function () {
	it('should invoke after delay', function () {
		var fn = jasmine.createSpy(),
			scope = {},
			target = new jsonrpc.DelayedTask(fn, scope, [ 1, 2, 3 ]);

		runs(function () {
			target.delay(100);
			expect(fn).not.toHaveBeenCalled();
		});
		
		waits(110);
		
		runs(function () {
			expect(fn).toHaveBeenCalledWith(1, 2, 3);
			expect(fn.mostRecentCall.object).toBe(scope);
		});
	});

	it('should cancel call', function () {
		var fn = jasmine.createSpy(),
			target = new jsonrpc.DelayedTask(fn);

		runs(function () {
			target.delay(100);
		});
		
		waits(50);
		
		runs(function () {
			target.cancel();
		});

		waits(60);
		
		runs(function () {
			expect(fn).not.toHaveBeenCalled();
		});
	});

	it('should call the last specified function', function () {
		var fn = jasmine.createSpy(),
			target = new jsonrpc.DelayedTask(fn),
			newFn = jasmine.createSpy(),
			newScope = {};

		runs(function () {
			target.delay(30, newFn, newScope, [1, 2, 3]);
		});
		
		waits(50);
		
		runs(function () {
			expect(fn).not.toHaveBeenCalled();
			expect(newFn).toHaveBeenCalledWith(1, 2, 3);
			expect(newFn.mostRecentCall.object).toBe(newScope);
		});
	});

	it('should restart timer on each delay call', function () {
		var stop = null,
			fn = function () { stop = new Date().getTime(); },
			target = new jsonrpc.DelayedTask(fn),
			start;

		runs(function () {
			start = new Date().getTime();
			target.delay(50);
		});
		
		waits(30);

		runs(function () {
			target.delay(50);
		});
		
		waits(30);

		runs(function () {
			target.delay(50);
		});
		
		waitsFor(function () {
			return !!stop;
		});
		
		runs(function () {
			expect(stop - start).toBeGreaterThan(100);
			expect(stop - start).toBeLessThan(120);
		});
	});
});
