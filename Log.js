(function() {
	window.addEventListener('error',function(e) {
		//var crmcsrCookie=getCookie("crmcsr");
		var customURL=window.location.href;
		var options={e : e, guess : true};
		var stackTraceInfo = printStackTrace(options);
		var errorInfo = {
			errorMessage:stackTraceInfo.errorMessage,
			url:customURL,
			lineNo:-1,
			columnNo:-1,
			errorStack:stackTraceInfo.stackTrace,
		};
		console.log(errorInfo);
		url="https://vimal-zt58.tsi.zohocorpin.com:9333/api/v1/logJSError"
		params=errorInfo;
		ajaxRequest("GET",url,params);
		return false;
	});
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
			console.log(crmcsrCookie)
			var http = new XMLHttpRequest();
			http.open( method , url , true );
			http.setRequestHeader("X-ZCSRF-TOKEN", "crmcsrfparam=fea951d66bd9140dcd5c63f15f6209de850c1c6f02aeabc0c9811bc501cb977eb7d5c69d4caf60632e00903dbf7c865febfb2020255815a4934cc65feff2e964");

			http.onreadystatechange = function() {
			    if(http.readyState == 4 && http.status == 200) {
				console.log(http.responseText);
				    console.log("Working Successfully")
			    }
			}
			http.send(params);
		}
	function printStackTrace(options) {
		options = options || {guess: true};
		var ex = options.e || null, guess = !!options.guess;
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
			ex = ex || this.createException();
			mode = mode || this.getCurrentBrowser() || {browserName:'other',browserVersion:null};
			var stackTrace;
			var errorMessage;
			if (mode.browserName === 'other') {
				console.log("Not an ordinary browser");
			} else {
				stackTrace=ex.error.stack;
				errorMessage=ex.error.message;
			}

			return {
				browser: mode.browserName,
				stackTrace: stackTrace,
				errorMessage:errorMessage
			};
		},

		getCurrentBrowser: function(){
			var browserDetails=navigator.userAgent;
			var browserArray=browserDetails.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
			return {browserName:browserArray[1],browserVersion:browserArray[2]};
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
				this.sourceCache[url] = this.ajax(url).split('\n');
			}
			return this.sourceCache[url];
		},

	};
})();
