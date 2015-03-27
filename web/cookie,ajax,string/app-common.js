var app = app || {};

// --------- AJAX Wrapper --------- //
(function(){
	app.doGet = function(path, data){
		return ajax(false,path,data);
	};

	app.doPost = function(path, data){
		return ajax(true,path,data);
	};

	function ajax(isPost, path, data){
		var tenantid = app.ctx.pathAsNum(0);
		if(typeof tenantid != "undefined"){
			data.tenantid = tenantid;
		}
		var dfd = $.Deferred();
		var method = (isPost)?"POST":"GET";
		var jqXHR = $.ajax({
			url: path, 
			type: method,
			dataType: "json",
			data: data
		});

		jqXHR.done(function(response){
			// TODO: need test reponse.result
			if (response.success){
				dfd.resolve(response.result);
			}else{
				dfd.reject(response.result);
			}
		});

		jqXHR.fail(function(jqx, textStatus, error){
			dfd.reject(error);
			// TODO: need to normalize error
		});

		return dfd.promise();
	}


})();
// --------- /AJAX Wrapper --------- //

// -------------- CHECK BROWSER ------------ //
(function($){
	app.checkBrowserBlock = function(checkBrowser){
	 	var showMessage = false;
	 	var isChromeBrowser = false;
		var isSafariBrowser = false;
		if(checkBrowser){
			var ua = navigator.userAgent.toLowerCase();
			isChromeBrowser = ua.match(/chrome\/([\d.]+)/);
			isSafariBrowser = ua.match(/version\/([\d.]+)/);
		}
		if(checkBrowser){
			if(isChromeBrowser || isSafariBrowser){
				showMessage = false;
			}else{
				showMessage = true;
			}
		}
		return showMessage;
	}

	app.getBrowserType = function(){
	 	var type = "";
		var isChromeBrowser = false;
		var isSafariBrowser = false;
		var ua = navigator.userAgent.toLowerCase();
		isChromeBrowser = ua.match(/chrome\/([\d.]+)/);
		isSafariBrowser = ua.match(/version\/([\d.]+)/);
		if(isChromeBrowser){
			type = "chrome";
		}else if(isSafariBrowser){
			type = "safari";
		}
		return type;
	}
})(jQuery);
// --------------/CHECK BROWSER ------------ //

// -------------- COOKIE OPERATION ------------ //
(function($) {
	app.preference = {
		store : function(key, value) {
			app.cookie(key,value);
		},
		get : function(key, defaultVal) {
			return getCookie(key, defaultVal);
		}
	};

	app.cookie = function(name, value, options) {
		if ( typeof value !== 'undefined') {
			options = options || {expires:365};
			if (value === null) {
				value = '';
				options = $.extend({}, options);
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && ( typeof options.expires === 'number' || options.expires.toUTCString)) {
				var date;
				if ( typeof options.expires === 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString();
			}
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		} else {
			var cookieValue = null;
			if (document.cookie && document.cookie !== '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = $.trim(cookies[i]);
					if (cookie.substring(0, name.length + 1) === (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};
	
	function getCookie(key, defaultVal) {
		var val = app.cookie(key);
		return val ? val : defaultVal;
	}
	
})(jQuery); 
// --------------/COOKIE OPERATION ------------ //

// -------------- String format ------------ //
(function($) {
	//add format to string
	String.prototype.format = function(args) {
		if (arguments.length > 0) {
			var result = this;
			if (arguments.length == 1 && typeof (args) == "object") {
				for (var key in args) {
					var reg = new RegExp("({" + key + "})", "g");
					result = result.replace(reg, args[key]);
				}
			} else {
				for (var i = 0; i < arguments.length; i++) {
					if (typeof arguments[i] == "undefined") {
						return "";
					} else {
						var reg = new RegExp("({[" + i + "]})", "g");
						result = result.replace(reg, arguments[i]);
					}
				}
			}
			return result;
		} else {
			return this;
		}
	};

})(jQuery);
// --------------/String format ------------ //

//---------------/file upload --------------//
(function($) {
	app.ajaxPost = function(url, data, fileElement) {
		var dfd = $.Deferred();
		var formData = new FormData();
		var tenantid = app.ctx.pathAsNum(0);
		if(typeof tenantid != "undefined"){
			formData.append("tenantid", tenantid);
		}
		formData.append("props", JSON.stringify(data));
		formData.append("file", fileElement);
		var xhr = getXMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.onload = function(e) {
			var adGroup = eval("("+this.response +" )").result;
			dfd.resolve(adGroup);
		};
		xhr.send(formData);

		return dfd.promise();
	}

	function  getXMLHttpRequest(){
		var XMLHttp=null;
		if (window.XMLHttpRequest){
			XMLHttp = new XMLHttpRequest();
		}else if (window.ActiveXObject){
			XMLHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		return XMLHttp;
	}
})(jQuery);
//----------------/file upload---------------//