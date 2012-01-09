describe('jsonrpc.CallStack', function () {
	var target;

	beforeEach(function () {
		target = new jsonrpc.CallStack();
	});

	it('should keep scope and parameters', function () {
		var scope = {},		
			enterFn = jasmine.createSpy(),
			wrappedEnterFn = target.wrapEnterFn(enterFn),
			exitFn = jasmine.createSpy(),
			wrappedExitFn = target.wrapExitFn(exitFn);
		
		wrappedEnterFn.apply(scope, [ 'args' ]);
		
		wrappedExitFn.apply(scope, [ 'args' ]);
		
		expect(enterFn).toHaveBeenCalledWith('args');
		expect(enterFn.mostRecentCall.object).toBe(scope);

		expect(exitFn).toHaveBeenCalledWith('args');
		expect(exitFn.mostRecentCall.object).toBe(scope);
	});
	
	it('should simmetrically invoke enter and exit fn', function () {
		var count = 0,
			enter = [],
			exit = [],
			enterFn = target.wrapEnterFn(function () { enter.push(++count); }),
			exitFn = target.wrapExitFn(function () { exit.push(++count); });
		
		exitFn();
		enterFn();
		enterFn();
		exitFn();
		exitFn();
		exitFn();
		enterFn();
		
		expect(enter).toEqual([1,3]);
		expect(exit).toEqual([2]);
		expect(count).toEqual(3);
	});
});