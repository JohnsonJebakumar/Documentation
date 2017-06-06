(function() {
	var Browser=getBrowserName();
	function getBrowserName(){
		var ua= navigator.userAgent, tem, 
		M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		if(/trident/i.test(M[1])){
			tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
			return 'IE '+(tem[1] || '');
		}
		if(M[1]=== 'Chrome'){
			tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
			if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
		}
		M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
		if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
		return {browserName:M[0],browserVersion:M[1]};
	   }
	if (Browser.browserName != "MSIE")
	{
		window.addEventListener('error',function(e) {
			var options={e : e, guess : true};
			var stackTraceInfo = printStackTrace(options);
			FinaliseWork(stackTraceInfo);
			return false;
		});
	}
	else if(Browser.browserName == "MSIE")
	{
		window.onerror = function(msg, url, lineNum) {
			var options={e:{error:{message:msg},lineno:lineNum},guess: true};
			var stackTraceInfo = printStackTrace(options);
			FinaliseWork(stackTraceInfo);
			return false;
		}
	}
	function FinaliseWork(stackTraceInfo)
	{
		var customURL=window.location.href;
		var errorInfo = {
			errorMessage:stackTraceInfo.errorMessage,
			url:customURL,
			lineNo:stackTraceInfo.lineNo,
			columnNo:stackTraceInfo.columnNo,
			errorStack:stackTraceInfo.stackTrace,
		};
		url="http://vimal-zt58.tsi.zohocorpin.com:9037/api/v1/logJSError?portalname=reactmig2"
		params=errorInfo;
		ajaxRequest("POST",url,params);
	}
	function getCookie(cname) {
	    var name = cname + "=";
	    var decodedCookie = decodeURIComponent(document.cookie);
	    var ca = decodedCookie.split(';');
	    for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
		    c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
		    return c.substring(name.length, c.length);
		}
	    }
	    return "";
	}
	function ajaxRequest(method, url,params){
			var http = new XMLHttpRequest();
			http.open( method , url , true );
			http.setRequestHeader("X-ZCSRF-TOKEN", "crmcsrfparam=be64ec6734393d415e011b2d0beefcb6c17fbb8e51e313a243d8bddfe0f32478e51266a8dfbc01bc185d123173ef7d4137893aa6155df43b622c4dc7eb2c5707");
			http.onreadystatechange = function() {
			    if(http.readyState == 4 && http.status == 201) {
				console.log(http);
				console.log("Working Successfully");
			    }
			    else
			    {
				console.log("error");
			    }
			}
			http.send(JSON.stringify(params));
		}
	function printStackTrace(options) {
		options = options || {guess: true};
		var ex = options.e || null;
		var p = new printStackTrace.implementation();
		var response = p.run(ex);
		return response;
	}

	if (typeof module !== "undefined" && module.exports) {
		module.exports = printStackTrace;
	}

	printStackTrace.implementation = function() { };

	printStackTrace.implementation.prototype = {
		run: function(ex, mode) {
			ex = ex;
			var stackTrace=ex.error.stack || null;
			var errorMessage=ex.error.message || null;
			var lineNo=ex.lineno || -1;
			var columnNo=ex.colno || -1;

			return {
				stackTrace: stackTrace,
				errorMessage:errorMessage,
				lineNo:lineNo,
				columnNo:columnNo
			};
		},

		instrumentFunction: function(context, functionName, callback) {
			context = context || window;
			var original = context[functionName];
			context[functionName] = function instrumented() {
				callback.call(this, printStackTrace().slice(4));
				return context[functionName]._instrumented.apply(this, arguments);
			};
			context[functionName]._instrumented = original;
		},

		deinstrumentFunction: function(context, functionName) {
			if (context[functionName].constructor === Function &&
					context[functionName]._instrumented &&
					context[functionName]._instrumented.constructor === Function) {
				context[functionName] = context[functionName]._instrumented;
			}
		},

		isSameDomain: function(url) {
			return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
		},
		getSource: function(url) {
			if (!(url in this.sourceCache)) {
				this.sourceCache[url] = this.ajax(url).split('');
			}
			return this.sourceCache[url];
		},

	};
})();
