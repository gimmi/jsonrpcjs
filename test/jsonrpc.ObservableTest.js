describe('jsonrpc.Observable', function () {
	var target;

	beforeEach(function () {
		target = new jsonrpc.Observable();
	});

	it('should trigger events', function () {
		var scope = {},
			ev1h1 = jasmine.createSpy(),
			ev1s1 = {},
			ev1h2 = jasmine.createSpy();
		
		target.bind(ev1h1, ev1s1);
		target.unbind(target.bind(ev1h2));
		
		target.trigger(1, 2, 3);
		
		expect(ev1h1).toHaveBeenCalledWith(1, 2, 3);
		expect(ev1h1.callCount).toEqual(1);
		expect(ev1h1.mostRecentCall.object).toEqual(ev1s1);
		expect(ev1h2).not.toHaveBeenCalled();
	});
});
