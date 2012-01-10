describe('jsonrpc.Observable', function () {
	var target;

	beforeEach(function () {
		target = new jsonrpc.Observable();
	});

	it('should trigger events', function () {
		var scope = {},
			h1 = jasmine.createSpy(),
			s1 = {},
			h2 = jasmine.createSpy();
		
		target.bind(h1, s1);
		target.unbind(target.bind(h2));
		
		target.trigger(1, 2, 3);
		
		expect(h1).toHaveBeenCalledWith(1, 2, 3);
		expect(h1.callCount).toEqual(1);
		expect(h1.mostRecentCall.object).toEqual(s1);
		expect(h2).not.toHaveBeenCalled();
	});
});
