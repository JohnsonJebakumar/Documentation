(function() {
	var debugMode = false;
	var logErrorURL = "../server/php-flatfile/logError.php";

	// --------------------------------------------------------------------------------------------


	window.addEventListener('error',function(e) {
		var options={e : e, guess : true};
		var stackTraceInfo = printStackTrace(options);
		console.log(stackTraceInfo);
		var errorInfo = {
			url:        "Nothing",
			lineNum:    e.lineno,
			stackTrace: stackTraceInfo.stackTrace,
			browser:    stackTraceInfo.browser
		};
		console.log(errorInfo);
		return false;
	});

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
			console.log(mode);
			var stackTrace;
			if (mode.browserName === 'other') {
				console.log("Not an ordinary browser");
			} else {
				stackTrace=ex.stack;
			}

			return {
				browser: mode.browserName,
				stackTrace: stackTrace
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

		ajax: function(url) {
			var req = this.createXMLHTTPObject();
			if (req) {
				try {
					req.open('GET', url, false);
					req.send(null);
					return req.responseText;
				} catch (e) {
				}
			}
			return '';
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
