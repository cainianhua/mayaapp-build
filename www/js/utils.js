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
	}
	/**
	 * 验证日期是否合法
	 * @param  {[type]}  dateStr [description]
	 * @return {Boolean}         [description]
	 */
	this.isValidDate = function(dateStr) {
		return (new Date(dateStr).toString() != "Invalid Date");
	}
	/**
	 * 验证日期范围
	 * @param  {[type]} date [description]
	 * @return {[type]}      [description]
	 */
	this.checkDateRange = function(date) {
		var _minDate = new Date(2010, 1, 1);
		var _maxDate = new Date(2030, 12, 31);

		return date <= _maxDate && date >= _minDate;
	}
}