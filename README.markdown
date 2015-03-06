JSON-RPC 2.0 client library for Javascript
------------------------------------------

Fork of jsonrpcjs 2.0 to support named parameters and code/message handling:

Sample code of wrapper javascript definition: callerConstructorWrapper.js
-----------------------------------------------------------------------

    function sampleCallFunction(data, sampleCallback) {
        callerConstructorWrapper("sampleCallFunction", {
            signData: data
        },

        function (result, error) {
            sampleCallback(result, error);
        });
}

Sample code of wrapper javascript definition: callerConstructorWrapper.js
-----------------------------------------------------------------------

	function logActionFailure(reason, code, methodName, url) {
            log.error('callerConstructorWrapper method "'+methodName+'" failed. Reason: ' + reason + ', code: ' + code + ', url: ' + url);
        }

        function logSucess(methodName, result) {
            log.devel('callerConstructorWrapper method "'+methodName+'" success', result);
        }

        function createEndPointCaller(url) {
            var jsonRpcEndpoint = new jsonRPC.JsonRpc(url);
            jsonRpcEndpoint.request.bind(function (url, data, xhr) {
                var name = "POST request ", i=url.lastIndexOf('/')+1;
                if (i>0) name += url.substr(i)+".";
                name+=data.method;
                log.info(name, xhr.getResponseHeader('serverId'));
            });


            function callEndPoint(methodName) {

                var args = [methodName];

                if (arguments.length==3){
                    args.push(arguments[1]);
                } else if (arguments.length!=2) {
                    throw "EndPointCaller must have 2 or 3 arguments!";
                }
                var callEnPointCallback=arguments[arguments.length-1];

                args.push({
                    success: function (result) {
                        logSucess(methodName, result);
                    },
                    failure: function (reason, code) {
                        logActionFailure(reason, code, methodName, url);
                        if (!code) {
                            code = 1000;
                            if (!reason) {
                                reason = "processing error";
                            }
                        }
                        callEnPointCallback(null, {code:code, message:reason})
                    },
                    callback: function (success, result) {
                        if (success) callEnPointCallback(result,null);
                    }
                });
                jsonRpcEndpoint.call.apply(jsonRpcEndpoint, args);
            }

            return callEndPoint;
        }
