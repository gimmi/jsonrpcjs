describe('jsonrpc.CallStack', function () {
	var target, enterFn, exitFn, scope;

	beforeEach(function () {
		enterFn = jasmine.createSpy();
		exitFn = jasmine.createSpy();
		scope = {};
		target = new jsonrpc.CallStack(enterFn, exitFn, scope);
	});

	it('should keep scope and parameters', function () {
		var enterScope = {},		
			exitScope = {},
			enterFn = jasmine.createSpy(),
			exitFn = jasmine.createSpy(),
			target = new jsonrpc.CallStack(enterFn, enterScope, exitFn, exitScope);
			
		target.enter(1, 2, 3);
		target.exit(4, 5, 6);
		
		expect(enterFn).toHaveBeenCalledWith(1, 2, 3);
		expect(enterFn.mostRecentCall.object).toBe(enterScope);

		expect(exitFn).toHaveBeenCalledWith(4, 5, 6);
		expect(exitFn.mostRecentCall.object).toBe(exitScope);
	});
	
	it('should simmetrically invoke enter and exit fn', function () {
		var count = 0,
			enter = [],
			exit = [];
		var target, scope;
		target = new jsonrpc.CallStack(function () { enter.push(++count); }, null, function () { exit.push(++count); }, null);
		
		target.exit();
		target.enter();
		target.enter();
		target.exit();
		target.exit();
		target.exit();
		target.enter();
		
		expect(enter).toEqual([1,3]);
		expect(exit).toEqual([2]);
		expect(count).toEqual(3);
	});
});