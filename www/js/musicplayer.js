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
                instance = new MusicPlayer(this, options);
                $self.data(dataKey, instance);
            }
        });
    };

    function MusicPlayer(el, options) {
        var that = this,
            defaults = {
                serviceUrl: "", // 音乐数据接口
                did: false,     // 地点的编号，用于查询对应地点的音乐设置，必须
                onPlay: null,   // 播放事件处理方法（未实现）
                onPause: null   // 暂停事件处理方法（未实现）
            };

        // Shared variables;
        that.element = el;  // 当前元素dom对象
        that.el = $(el);    // 当前元素jQuery对象
        that.options = $.extend({}, defaults, options);
        that.isPlaying = false; // 播放器状态，只有在用户点击播放或者暂停的时候改变状态
        that.currAjaxRequest = null; // 异步请求对象
        that.audioElement = null; // html5 audio控件
        that.controlButton = null; // 点击可以控制播放或者暂停

        that.musics = []; // 播放音乐列表
        that.currMusicIndex = -1;
        that.firstPlay = true; // 是否第一次点击播放

        // 必须在加载完音乐之后再初始化音乐控件
        // 否则会出现点击播放之后，虽然已经显示开始播放，
        // 但是实际无法播放，原因是因为音乐还没加载
        that.getMusics(that.options.did, function(error, musics) {
            if (error) {
                $.maya.utils.showNotice(error.message);
                return;
            };

            console.log("music's count: " + musics.length);

            that.initialize();
        });
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

            container.html('<a href="javascript:void(0);" class="u-globalAudio audio_btn">' 
                         + '    <i class="icon-music"></i>' 
                         + '</a>' 
                         + '<audio class="audio_control"></audio>');

            that.controlButton = $('.audio_btn', container);
            that.audioElement = $(".audio_control", container);
            // 初始化audio控件
            // 
            //// 取消循环播放
            //that.audioElement.attr('loop', true);
            // 取消自动播放
            that.audioElement.attr('autoplay', false);
            that.audioElement.attr('src', '');
            // 事件绑定
            that.controlButton.on('click.musicplayer', function() {
                if (that.isPlaying) {
                    that.pause();
                } 
                else {
                    if (!that.canPlay()) {
                        $.maya.utils.showNotice("没有可以播放的音乐");
                        return;
                    };

                    // 手机系统要求必须用户手动点击audio播放音乐，程序支持播放会被浏览器阻止
                    // dialogs插件的confirm方法会改变当前的event值，从而导致浏览器认为当前的
                    // 播放操作不是用户点击的，因此会被阻止。
                    // 我们在这里先初始化，然后就可以通过程序控制播放器的播放和暂停，
                    // 从而绕过了浏览器的默认行为
                    that.play();
                    that.reset();
                    
                    // 检测用户使用的网络类型
                    if (that.firstPlay && $.maya.network.isCell()) {
                        $.maya.utils.confirm({ 
                            title: "流量提醒",
                            message: "您正在使用流量播放旅行音乐，可能会产生高额费用，是否继续播放？",
                            doneCallback: function() { 
                                that.firstPlay = false;
                                that.play();
                            }
                        });
                    } else { 
                        that.play();
                    }
                }
            });
            // 当前播放列表已经播放完毕（控件每次播放列表只有一首音乐）
            that.audioElement.on("ended", function() {
                console.log("ended invoke.");
                if (that.switchTo(++that.currMusicIndex)) {
                    that.play();
                }
            });
            // 音频开始播放
            that.audioElement.on("play", function() {
                console.log("play invoke.");
                //that.play();
                that.playStatus();
            });
            // 音频暂停播放
            that.audioElement.on("pause", function() {
                console.log("pause invoke.");
                //that.pause();
                that.pauseStatus();
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
                url: options.serviceUrl,
                dataType: "json",
                data: {
                    did: districtId
                }
            }

            if (that.currAjaxRequest) {
                that.currAjaxRequest.abort();
            };

            that.currAjaxRequest = $.ajax(ajaxSettings).done(function(musics) {
                that.musics = musics;
                callback(null, musics);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                callback({
                    code: -1,
                    message: "请求旅行音乐数据异常"
                });
            }).always(function() {
                that.currAjaxRequest = null;
            });
        },
        /**
         * 切换音乐
         * @param  {[type]} currIndex [description]
         * @return {bool}             是否切换成功，true表示切换成功，否则切换失败
         */
        switchTo: function(currIndex) {
            //console.log("music play index: " + currIndex);

            var that = this,
                musics = that.musics;

            var endIndex = musics.length - 1;

            // 超出音乐列表，退出播放
            if (currIndex < 0 || currIndex > endIndex) {
                // 重置播放列表，处于暂停状态
                that.reset();
                return false;
            }

            console.log("playing index: " + currIndex);

            that.currMusicIndex = currIndex;

            that.audioElement.attr('src', musics[currIndex].LinkTo);

            //that.play();

            return true;
        },
        /**
         * 是否可以播放
         * @return {[type]} [description]
         */
        canPlay: function() {
            return this.musics.length > 0;
        },
        /**
         * 开始播放
         * @return {[type]} [description]
         */
        play: function() {
            var that = this;
            if (!that.canPlay()) return;

            if (that.currMusicIndex === -1) {
                that.switchTo(0);
            };

            that.audioElement.get(0).play();
        },
        /**
         * 设置为播放的状态
         * @return {[type]} [description]
         */
        playStatus: function() {
            this.controlButton.addClass("z-play");
            this.isPlaying = true;
        },
        /**
         * 暂停播放
         * @return {[type]} [description]
         */
        pause: function() {
            this.audioElement.get(0).pause();
            //this.pauseStatus();
        },
        /**
         * 设置为暂停的状态
         * @return {[type]} [description]
         */
        pauseStatus: function() {
            this.controlButton.removeClass("z-play");
            this.isPlaying = false;
        },
        /**
         * 重置播放器
         * @return {[type]} [description]
         */
        reset: function() {
            var that = this;

            that.currMusicIndex = -1;

            that.audioElement.attr('src', "");
            that.pause();
        },
        /**
         * 释放对象
         * @return {[type]} [description]
         */
        dispose: function() {
            // Refer from: http://api.jquery.com/empty/
            // To avoid memory leaks, 
            // jQuery removes other constructs such as data and event handlers from the child elements before removing the elements themselves.
            this.el.empty().removeData("musicplayer");
        }
    };
})(jQuery);
