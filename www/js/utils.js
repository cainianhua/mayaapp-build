/**
 * 通用方法类
 */
function Utils() {
	/**
	 * 格式化日期为yyyy-MM-dd
	 * @param  {[type]} date [description]
	 * @return {[type]}      [description]
	 */
	this.formatDate = function(date) {
		date = date || new Date();
	    var y = date.getFullYear(),
	    	m = date.getMonth() + 1,
	    	d = date.getDate();

	    return y + "-" + ("0" + m).slice(-2) + "-" + ("0" + d).slice(-2);
	};
	/**
	 * 验证日期是否合法
	 * @param  {[type]}  dateStr [description]
	 * @return {Boolean}         [description]
	 */
	this.isValidDate = function(dateStr) {
		return (new Date(dateStr).toString() != "Invalid Date");
	};
	/**
	 * 验证日期范围
	 * @param  {[type]} date [description]
	 * @return {[type]}      [description]
	 */
	this.checkDateRange = function(date) {
		var _minDate = new Date(2010, 1, 1);
		var _maxDate = new Date(2030, 12, 31);

		return date <= _maxDate && date >= _minDate;
	};
	/**
	 * 显示通知，3秒之后自动隐藏
	 * @param  {[type]} content [description]
	 * @return {[type]}         [description]
	 */
	this.showNotice = function(content) {
		if (window.plugins && window.plugins.toast) {
			window.plugins.toast.showLongCenter(content);
		}
		else {
			var _notice = $("#afui").notice({ 
		        message: content, 
		        onShow: function() {
		            setTimeout(function() { _notice.hide(); }, 3000);
		        }
		    });
		}
	};
	/**
	 * AfUI的动画效果完成之后，执行指定的方法
	 * @param  {Function} callback 回调方法
	 * @return {[type]}            [description]
	 */
	this.afterAfuiTransitionCompleted = function(callback) {
		if ($.ui.doingTransition == false) {
			callback();
		}
		else {
			// 监听doingTransition的状态
			var transitionInterval = setInterval(function() {
				if ($.ui.doingTransition == false) {
					clearInterval(transitionInterval);
					callback();
				}
			}, 500);
		}
	};
	/**
	 * 把弧度值转成角度值
	 * @param  {Number} s 需要转换的值
	 * @return {[type]}   [description]
	 */
	this.toAngleString = function(s) {
		var positiveValue = Math.abs(parseFloat(s)),
            degree = parseInt(positiveValue),
            minute = parseInt((positiveValue - degree) * 60),
            second = Math.round(parseInt(((positiveValue - degree) * 60 - minute) * 60));

        return degree + "°" + minute + "′" + second + "\"";
	},
	/**
	 * [confirm description]
	 * @param  {String} message         	Dialog message
	 * @param  {Function} confirmCallback 	Callback to invoke with index of button pressed (1, 2, or 3) or when the dialog is dismissed without a button press (0).
	 * @param  {String} title           	Dialog title. (String) (Optional, defaults to Confirm)
	 * @param  {Array} buttonLabels    		Array of strings specifying button labels. (Optional, defaults to [OK,Cancel])
	 * @return {[type]}                 	[description]
	 */
	/**
	 * 显示Confirm消息
	 * opts parameters:
	 * @param  {String} message        	Dialog message
	 * @param  {String} doneText       	[description]
	 * @param  {Function} doneCallback  [description]
	 * @param  {String} cancelText     	[description]
	 * @param  {Function} cancelCallback [description]
	 * @param  {[type]} title          	[description]
	 */
	this.confirm = function(opts) {
		var message = opts.message || "",
			doneText = opts.doneText || "OK",
			doneCallback = opts.doneCallback || function() {},
			cancelText = opts.cancelText || "Cancel",
			cancelCallback = opts.cancelCallback || function() {},
			title = opts.title || "Confirm";
		/*
		if (navigator.notification) {
			navigator.notification.confirm(message, function(index) {
				index == 2 ? doneCallback() : cancelCallback();
			}, title, [ cancelText, doneText ])
		} else {
			$.ui.popup({
	            title: title,
	            message: message,
	            cancelText: cancelText,
	            cancelCallback: cancelCallback,
	            doneText: doneText,
	            doneCallback: doneCallback,
	            cancelOnly: false
	        });
		}*/

		$.ui.popup({
            title: title,
            message: message,
            cancelText: cancelText,
            cancelCallback: cancelCallback,
            doneText: doneText,
            doneCallback: doneCallback,
            cancelOnly: false
        });
	},
	/**
	 * 显示Alert消息
	 * opts parameters:
	 * @param  {[String]} message       	Dialog message.
	 * @param  {[Function]} alertCallback 	Callback to invoke when alert dialog is dismissed
	 * @param  {[String]} title         	Dialog title. (Optional, defaults to Alert)
	 * @param  {[String]} buttonName    	Button name. (String) (Optional, defaults to OK)
	 * @return {[type]}               		[description]
	 */
	this.alert = function(opts) {
		var message = opts.message || "",
			alertCallback = opts.alertCallback || function() {},
			title = opts.title || "Alert",
			buttonName = opts.buttonName || "OK";

		if (navigator.notification) {
			navigator.notification.alert(message, alertCallback, title, buttonName);
		} else {
			$.ui.popup({ 
				title: title, 
				message: message, 
				cancelOnly: true, 
				cancelText: buttonName, 
				cancelCallback: alertCallback 
			});
		}
	},
	/**
	 * [getAppData description]
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	this.getAppData = function(key) {
		return localStorage.getItem(key);
	}
}

/**
 * 应用数据类，存储应用级别的数据，存储介质可能为Cookie或者localStorage
 */
function AppData() {
	/**
	 * 设置值，支持链式操作
	 * @param {[type]} key   [description]
	 * @param {[type]} value [description]
	 */
	this.setItem = function(key, value) {
		localStorage.setItem(key, value);
		return this;
	},
	/**
	 * 获取值
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	this.getItem = function(key) {
		return localStorage.getItem(key);
	},
	/**
	 * 删除值，支持链式操作
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	this.removeItem = function(key) {
		localStorage.removeItem(key);
		return this;
	}
}

/**
 * 网络
 */
function Network() {
	function checkConnection() {
	    var networkState = navigator.connection.type;

	    var states = {};
	    states[Connection.UNKNOWN]  = 'Unknown connection';
	    states[Connection.ETHERNET] = 'Ethernet connection';
	    states[Connection.WIFI]     = 'WiFi connection';
	    states[Connection.CELL_2G]  = 'Cell 2G connection';
	    states[Connection.CELL_3G]  = 'Cell 3G connection';
	    states[Connection.CELL_4G]  = 'Cell 4G connection';
	    states[Connection.CELL]     = 'Cell generic connection';
	    states[Connection.NONE]     = 'No network connection';

	    console.log('Connection type: ' + states[networkState]);
	}
	/**
	 * 是否正在使用移动网络
	 * @return {Boolean} [description]
	 */
	this.isCell = function() {
		return navigator.connection && (navigator.connection.type == Connection.CELL || navigator.connection.type == Connection.CELL_2G || navigator.connection.type == Connection.CELL_3G || navigator.connection.type == Connection.CELL_4G);
	}
}

// 挂载到jQuery对象上
if (typeof $.maya === "undefined") $.maya = {};
$.maya.utils = new Utils();
$.maya.appData = new AppData();
$.maya.network = new Network();