/**
 * description: live reload background run init
 * author: rehorn@vip.qq.com
 * date: 2012-04-22
 */

(function(window, undefined) {

    // var LiveReloadSetting = window.LiveReloadSetting;

    var LiveReloadSetting = {
        get: function(key) {
            return _setting[key];
        }
    };

    var WRAPER_ID = '__live_reload_wraper__';

    var Utils = {
        toArr: function(arrLike) {
            return Array.prototype.slice.call(arrLike);
        },
        getAbsUrl: function(url) {
            if(!url) return '';
            if (/https{0,1}:\/\//.test(url)) {
                return url;
            } else {
                var href = window.location.href,
                    basePathArr = href.split('/');
                basePathArr.pop();

                var urlArr = url.split('/'),
                    tmpArr = [];

                urlArr.forEach(function(item) {
                    if (item === '..') {
                        basePathArr.pop();
                    } else if (item === '.') {
                        // do nothing
                    } else {
                        basePathArr.push(item);
                    }
                });
                return basePathArr.join('/');
            }
        },
        trim: function(str) {
            return str.replace(/(^[\\s]*)|([\\s]*$)/g, "");
        },
        getElementDescription: function(element) {
            var description = element.tagName.toLowerCase();

            if (element.hasAttribute("id")) {
                description += "#" + element.getAttribute("id");
            }

            if (element.hasAttribute("class")) {
                var classes = element.getAttribute("class").split(" ");

                for (var i = 0, l = classes.length; i < l; i++) {
                    description += "." + this.trim(classes[i]);
                }
            }

            return description;
        },
        isCheckable: function(url) {
            if(!url) {
                return false;
            }
            if (!LiveReloadSetting.get('lr_skip_external')) {
                return true;
            }

            var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
            if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return false;
            if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":(" + {
                "http:": 80,
                "https:": 443
            }[location.protocol] + ")?$"), "") !== location.host) return false;
            return true;
        }
    };

    var Dom = {
        css: function(elm, style) {
            for (var i in style) {
                elm.style[i] = style[i];
            }
        },
        show: function(elm) {
            this.css(elm, {
                display: 'block'
            });
        },
        hide: function(elm) {
            this.css(elm, {
                display: 'none'
            });
        },
        isShow: function(elm) {
            return elm.style.display !== 'none';
        }
    };

    var LiveReload = {
        init: function() {
            console.log('injectScript startLiveReload init');
            this.initEvents();
            if (LiveReloadSetting.get('lr_enable_scrolly')) {
                this._adjustScroll();
            }
        },

        initWatchList: function() {
            var links = this._parseLinks();
            chrome.extension.sendRequest({
                "action": "initWatchList",
                "data": links
            }, function(response) {
                console.log(response);
            });
        },

        initEvents: function() {
            var self = this;
            var observer = this.observer = {
                onExtRequest: function(request, sender, sendResponse) {
                    console.log('onExtRequest');
                    if (request.action === 'reload') {
                        self._reload(request.item);
                        console.log('reload');
                    } else if (request.action === 'startLiveReload') {
                        self.initWatchList();
                        console.log('initWatchList');
                    }
                },
                onDocumentMouseOver: function(e) {
                    var target = e.target;
                    var rect = target.getBoundingClientRect();
                    var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                    var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
                    Dom.css(self.wraper, {
                        'width': rect.width + 'px',
                        'height': rect.height + 'px',
                        'top': rect.top + scrollTop + 'px',
                        'left': rect.left + scrollLeft + 'px',
                        'display': 'block'
                    });
                    self.idClassTag.innerHTML = Utils.getElementDescription(target);
                    (rect.width < 100) ? Dom.hide(self.escTag) : Dom.show(self.escTag);
                },
                onDocumentKeyDown: function(e) {
                    // F8:119, F9:120, esc:27
                    if (e.keyCode == 120 && LiveReloadSetting.get('lr_enable_F9')) {
                        self._reloadCss();
                    } else if (e.keyCode == 119 && LiveReloadSetting.get('lr_enable_tag')) {
                        self._toggleNodeWrapper();
                    } else if (e.keyCode == 27) {
                        self._hideNodeWrapper();
                    }
                }
            };

            chrome.extension.onRequest.addListener(observer.onExtRequest);
            document.addEventListener('keydown', observer.onDocumentKeyDown, false);
        },

        _parseLinks: function() {
            var cssLinks = Utils.toArr(document.querySelectorAll('link[href*=".css"]')),
                jsLinks = Utils.toArr(document.querySelectorAll('script[src*=".js"]')),
                htmlLink = document.URL,
                result = [];

            if (LiveReloadSetting.get('lr_enable_css')) {
                cssLinks.forEach(function(item) {
                    var url = Utils.getAbsUrl(item.getAttribute('href'));
                    if(Utils.isCheckable(url)){
                        var l = {
                            type: 'css',
                            url: url
                        };
                        result.push(l);
                    }
                });
            }

            if (LiveReloadSetting.get('lr_enable_js')) {
                jsLinks.forEach(function(item) {
                    var url = Utils.getAbsUrl(item.getAttribute('src'));
                    if(Utils.isCheckable(url)){
                        var l = {
                            type: 'js',
                            url: url
                        };
                        result.push(l);
                    }
                });
            }

            if (LiveReloadSetting.get('lr_enable_html')) {
                if(Utils.isCheckable(htmlLink)){
                    result.push({
                        type: 'html',
                        url: htmlLink
                    });
                }
            }

            return result;
        },

        _adjustScroll: function() {
            var key = '__LiveRloadScrollY';
            var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
                result = reg.exec(document.cookie);

            var y = result ? result[2] : null;
            if (y == null) return;
            if (window.pageYOffset != null) window.pageYOffset = y;
            if (document.documentElement.scrollTop != null) document.documentElement.scrollTop = y;
            if (window.pageYOffset != null) window.pageYOffset = y;
            if (document.body.scrollTop != null) document.body.scrollTop = y;
        },

        _showNodeWrapper: function() {
            if (!this.wraper) {
                var wraper = this.wraper = document.createElement('div');
                wraper.id = WRAPER_ID;
                wraper.innerHTML = '<div id="' + WRAPER_ID + 'tag" class="wraper-tag id-class-tag"></div><div id="' + WRAPER_ID + 'esc"  class="wraper-tag esc-tips">esc退出</div>';
                document.body.appendChild(wraper);
                this.idClassTag = document.querySelector('#' + WRAPER_ID + 'tag');
                this.escTag = document.querySelector('#' + WRAPER_ID + 'esc');
                Dom.hide(wraper);
            }
            document.addEventListener('mouseover', this.observer.onDocumentMouseOver, false);
            this.isWrapperShow = true;
        },

        _hideNodeWrapper: function() {
            if (this.wraper) {
                Dom.hide(this.wraper);
                document.removeEventListener('mouseover', this.observer.onDocumentMouseOver, false);
            }
            this.isWrapperShow = false;
        },

        _toggleNodeWrapper: function() {
            this.isWrapperShow ? this._hideNodeWrapper() : this._showNodeWrapper();
        },

        _reload: function(item) {
            console.log('reload ' + item.url);
            var self = this;
            if (item.type == 'css') {
                self._reloadCss();
            } else if (['js', 'html'].indexOf(item.type) >= 0) {
                self._reloadPage();
            }
        },

        _reloadCss: function() {
            var cssLinks = Utils.toArr(document.querySelectorAll('link[href*=".css"]')),
                timeStamp = (new Date()) - 0;

            cssLinks.forEach(function(item) {
                item.setAttribute('href', item.getAttribute('href'));
            });
        },

        _reloadPage: function() {
            var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            document.cookie = '__LiveRloadScrollY' + "=" + y;
            location.reload();
        }
    };

    LiveReload.init();

})(window);
