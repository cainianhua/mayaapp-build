/**
 * Global Audio plugin
 */
function GlobalAudio(el, options) {
	var that = this,
		defaults = {
			_api: config.serviceUrl + "/services/musics"
		};
	that.options = $.extend({}, defaults, options);
	that.isPlaying = false;
	that.currAjaxRequest = null;
}

GlobalAudio.prototype = {
	initialize: function() {
		var that = this;

		if (musics.length <= 0) return;
		var i = 0;
		var endIndex = musics.length;
		var audioHost = $("#audio_host");
		var au = $('.audio_btn');

		console.log("music index is:" + i);

        audioHost.attr('src', musics[0].LinkTo);
        //audioHost.attr('loop', true);
        audioHost.attr('autoplay', false);
        audioHost.on("ended", function() {
        	i++;
        	console.log("music index is:" + i);
        	if (i > endIndex - 1) {
        		// 从头开始
        		i  = 0;
        		audioHost.attr('src', musics[i].LinkTo);
        		au.toggleClass('z-play');
        		audioHost.get(0).pause();
        		return false;
        	}
        	audioHost.attr('src', musics[i].LinkTo);
        	au.addClass('z-play');
        	audioHost.get(0).play();
        });
        // 播放状态
        au.addClass('z-play');
        audioHost.get(0).play();

        au.on('click', function() {
            if ($(this).data('status') === 'off') {
                $(this).data('status', 'on');
                audioHost.get(0).play();
            } else {
                $(this).data('status', 'off');
                audioHost.get(0).pause();
            }
            au.toggleClass('z-play');
        });
	},
	getAudios: function(districtId) {
		var that = this,
			options = that.options;
		// ajax music data.
		var ajaxSettings = {
			url: options._api,
			dataType: "json",
			data: { did: districtId }
		}

		if (that.currAjaxRequest) {
			that.currAjaxRequest.abort();
		};

		that.currAjaxRequest = $.ajax(ajaxSettings).fail(function(jqXHR, textStatus, errorThrown) {			
			that._showNotice("网络连接不可用");
		}).done(function(musics) {
			console.log("music's count: " + musics.length);
			initAudio(musics);
		});
	},
	play: function() {

	},
	pause: function() {

	},
	_showNotice: function(content) {
		var _notice = $("#afui").notice({ 
	        message: content, 
	        onShow: function() {
	            setTimeout(function() { _notice.hide(); }, 3000);
	        }
	    });
	}
}