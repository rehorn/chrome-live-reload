/**
 * description: live reload background run init
 * author: rehorn@vip.qq.com
 * date: 2012-04-22
 */

(function(window, undefined) {

    // var LiveReloadSetting = window.LiveReloadSetting;
    
    var LiveReloadSetting = {
        get: function(key){
            return _setting[key];
        }
    };

    var WRAPER_ID = '__live_reload_wraper__';

    var Utils = {
        toArr: function(arrLike){
            return Array.prototype.slice.call(arrLike);
        },
        getAbsUrl: function(url) {
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
        trim: function(str){
            return str.replace(/(^[\\s]*)|([\\s]*$)/g, "");
        },
        getElementDescription: function(element){
            var description = "";

            if (element.hasAttribute("id")) {
                description += "#" + element.getAttribute("id");
            }

            if (element.hasAttribute("class")) {
                var classes = element.getAttribute("class").split(" ");

                for (var i = 0, l = classes.length; i < l; i++) {
                    description += "." + this.trim(classes[i]);
                }
            }
        }
    };

    var Dom = {
        css: function(elm, style){
            for(var i in style){
                el.style[i] = style[i];
            }
        },
        show: function(elm){
            elm.css({display:'block'});
        },
        hide: function(elm){
            elm.css({display:'none'});
        },
        isShow: function(elm){
            return elm.style.display !== 'none';
        }
    };

    var LiveReload = {
        init: function() {
            console.log('injectScript startLiveReload init');
            this.initEvents();
            if(LiveReloadSetting.get('lr_enable_scrolly')){
                this._adjustScroll();
            }
            if(LiveReloadSetting.get('lr_enable_id_tag')){
                this._showNodeWrapper();
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
            var observer = {
                onExtRequest: function(request, sender, sendResponse){
                    console.log('onExtRequest');
                    if(request.action === 'reload'){
                        self._reload(request.item);
                        console.log('reload');
                    }else if(request.action === 'startLiveReload'){
                        self.initWatchList();
                        console.log('initWatchList');
                    }
                }
            };

            chrome.extension.onRequest.addListener(observer.onExtRequest);
        },

        _parseLinks: function(){
            var cssLinks = Utils.toArr(document.querySelectorAll('link[href*=".css"]')),
                jsLinks = Utils.toArr(document.querySelectorAll('script[src*=".js"]')),
                htmlLink = document.URL,
                result = [];

            if(LiveReloadSetting.get('lr_enable_css')){
                cssLinks.forEach(function(item) {
                    var l = {
                        type: 'css',
                        url: Utils.getAbsUrl(item.getAttribute('href'))
                    };
                    result.push(l);
                });    
            }
            
            if(LiveReloadSetting.get('lr_enable_js')){
                jsLinks.forEach(function(item) {
                    var l = {
                        type: 'js',
                        url: Utils.getAbsUrl(item.getAttribute('src'))
                    };
                    result.push(l);
                });
            }

            if(LiveReloadSetting.get('lr_enable_html')){
                result.push({
                    type: 'html',
                    url: htmlLink
                });
            }

            return result;
        },

        _adjustScroll: function(){
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

        _showNodeWrapper: function(){
            var wraper = this.wraper = document.createElement('div');
            wraper.id = WRAPER_ID;
            document.body.appendChild(wraper);
            wraper.hide();
        },

        _reload: function(item){
            console.log('reload ' +  item.url);
            var self = this;
            if(item.type == 'css'){
                self._reloadCss();
            }else if(['js', 'html'].indexOf(item.type) >= 0){
                self._reloadPage();
            }
        },

        _reloadCss: function(){
            var cssLinks = Utils.toArr(document.querySelectorAll('link[href*=".css"]')),
                timeStamp = (new Date())-0;

            cssLinks.forEach(function(item){
                item.setAttribute('href', item.getAttribute('href'));
            });
        },

        _reloadPage: function(){
            var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            document.cookie = '__LiveRloadScrollY' + "=" + y;
            location.reload();
        }
    };

    LiveReload.init();

})(window);

