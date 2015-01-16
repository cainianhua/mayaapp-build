/**
 * Music player plugin
 */
;(function ($) {
    "use strict";
    /**
     * 挂载插件到jQuery上，一般有三种使用方式：
     * 1. 初始化控件
     *     $(selector).musicplayer({...});
     * 2. 调用控件的方法
     *     $(selector).musicplayer("fn");
     * 3. 获取控件实例
     *     $(selector).musicplayer();
     * @param  {[type]} options [description]
     * @param  {[type]} args    [description]
     * @return {[type]}         [description]
     */
    $.fn.musicplayer = function (options, args) {
        var dataKey = 'musicplayer';
        // 获取实例对象
        if (arguments.length === 0) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var $self = $(this),
                instance = $self.data(dataKey);

            if (typeof options === 'string') {
                // 调用控件方法
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } 
            else {
                // 初始化控件
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new LocationSetter(this, options);
                $self.data(dataKey, instance);
            }
        });
    };

    function MusicPlayer(el, options) {
        var that = this,
            defaults = {
                _api: config.serviceUrl + "/services/musics",
                did: false // 地点的编号，用于查询对应地点的音乐设置
            };

        // Shared variables;
        that.element = el; // 当前元素dom对象
        that.el = $(el); // 当前元素jQuery对象
        that.options = $.extend({}, defaults, options);
        that.isPlaying = false; // 播放状态
        that.currAjaxRequest = null; // 异步请求对象
        that.audioElement = null; // html5 audio控件
        that.controlButton = null; // 点击可以控制播放或者暂停

        that.musics = []; // 播放音乐列表
        that.currMusicIndex = 0;
    }

    MusicPlayer.prototype = {
        /**
         * 音乐播放控件初始化
         * @return {[type]} [description]
         */
        initialize: function() {
            var that = this,
                container = that.el,
                districtId = that.options.did;

            container.html('<a href="javascript:void(0);" class="u-globalAudio audio_btn"  data-status="on">' 
                         + '    <i class="icon-music"></i>' 
                         + '</a>' 
                         + '<audio id="audio_host" data-src=""></audio>');

            that.audioElement = $("#audio_host", container);
            that.controllButton = $('.audio_btn', container);
            that.controllButton.on('click', function() {
                if (that.isPlaying) {
                    that.pause();
                } else {
                    that.play();
                }
            });
            //// 取消循环播放
            //that.audioElement.attr('loop', true);
            // 取消自动播放
            that.audioElement.attr('autoplay', false);

            if (!districtId) return;

            that.getMusics(districtId, function(error, musics) {
                if (error) {
                    that._showNotice(error.message);
                    return;
                };

                that.audioElement.on("ended", function() {
                    that.switchTo(++that.currMusicIndex);
                });

                that.switchTo(0);
            });
        },
        /**
         * 异步获取指定地点的音乐设置信息
         * @param  {[type]}   districtId [description]
         * @param  {Function} callback   [description]
         * @return {[type]}              [description]
         */
        getMusics: function(districtId, callback) {
            var that = this,
                options = that.options;
            // ajax music data.
            var ajaxSettings = {
                url: options._api,
                dataType: "json",
                data: {
                    did: districtId
                }
            }

            if (that.currAjaxRequest) {
                that.currAjaxRequest.abort();
            };

            that.currAjaxRequest = $.ajax(ajaxSettings).done(function(musics) {
                console.log("music's count: " + musics.length);
                that.musics = musics;
                callback(null, musics);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                //that._showNotice("网络连接不可用");
                callback({
                    code: -1,
                    message: "网络连接不可用"
                });
            }).always(function() {
                that.currAjaxRequest = null;
            });
        },
        /**
         * 切换音乐
         * @param  {[type]} currIndex [description]
         * @return {[type]}           [description]
         */
        switchTo: function(currIndex) {
            var that = this,
                musics = that.musics;

            var endIndex = musics.length - 1;

            // 超出音乐列表，退出播放
            if (currIndex < 0 || currIndex > endIndex) {
                // 重置播放列表，处于暂停状态
                that.reset();
            }

            that.currMusicIndex = currIndex;

            that.audioElement.attr('src', musics[currIndex].LinkTo);

            that.play();
        },
        /**
         * 开始播放
         * @return {[type]} [description]
         */
        play: function() {
            var that = this;

            if (that.isPlaying) return;

            that.audioElement.get(0).play();
            that.controlButton.addClass("z-play");

            that.isPlaying = true;
        },
        /**
         * 暂停播放
         * @return {[type]} [description]
         */
        pause: function() {
            var that = this;

            if (that.isPlaying) {
                that.audioElement.get(0).pause();
                that.controlButton.removeClass("z-play");

                that.isPlaying = false;
            }
        },
        /**
         * 重置播放器
         * @return {[type]} [description]
         */
        reset: function() {
            var that = this;

            that.currMusicIndex = 0;

            that.audioElement.attr('src', that.musics[that.currMusicIndex].LinkTo);
            that.pause();
        },
        /**
         * 释放对象
         * @return {[type]} [description]
         */
        dispose: function() {

        },
        /**
         * 显示通知
         * @param  {[type]} content [description]
         * @return {[type]}         [description]
         */
        _showNotice: function(content) {
            var _notice = $("#afui").notice({
                message: content,
                onShow: function() {
                    setTimeout(function() {
                        _notice.hide();
                    }, 3000);
                }
            });
        }
    };
})(jQuery);