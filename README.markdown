JSON-RPC 2.0 client library for Javascript
------------------------------------------

Blah blah blah

Sample code
-----------

	<html>
	<head>
		<title></title>
		<script type="text/javascript" src="jsonrpc.js"></script>
	</head>
	<body>
		<script type="text/javascript">
			var rpc = new jsonrpc.JsonRpc('http://www.server.com/rpc');
			
			// Handy interceptors for showing loading feedback in the UI
			rpc.loading.bind(function(){ console.log('loading...'); });
			rpc.loaded.bind(function(){ console.log('done!'); });
			
			// Handy interceptors for all RPC calls that fails and for which there's no failure callback defined
			rpc.unhandledFailure.bind(function(){ console.log('an rpc call failed, and has not  failure callback defined'); });
			
			// Simple call style
			rpc.call('aMethod', 'param1', 'param2', 'param3', function (result, code) {
				console.log('Method aMethod called with param1, param2, param3. Return value is: ' + result + 'with code:'+ code);
			});
			
			// Extended call style
			rpc.call('anotherMethod', 'param1', 'param2', 'param3', {
				success: function (result) { console.log('Method call succeded, result is: ' + result); },
				failure: function (reason) { console.log('Method call failed because of ' + reason); },
				callback: function (success, data) { console.log('Method call finished, success=' + success); },
				scope: window
			});
		</script>
	</body>
	</html>
