/**
 * description: live reload background run init
 * author: rehorn@vip.qq.com
 * date: 2012-04-22
 */

(function(window, undefined) {

    var LiveReloadSetting = window.LiveReloadSetting;

    var Utils = {
        uniqueArr: function (source, compareFn) {
            var len = source.length,
                result = source.slice(0),
                i, datum;
                
            if ('function' != typeof compareFn) {
                compareFn = function (item1, item2) {
                    return item1 === item2;
                };
            }
            while (--len > 0) {
                datum = result[len];
                i = len;
                while (i--) {
                    if (compareFn(datum, result[i])) {
                        result.splice(len, 1);
                        break;
                    }
                }
            }
            return result;
        }
    };

    var LiveReloadWatcher = window.LiveReloadWatcher = {
        _watchTabList: {},
        _cache: {},
        _requestList: {},
        
        init: function(){
            var self = this;
            var rate = LiveReloadSetting.get('lr_refresh_rate') || 1000;
            setInterval(function(){
                self._check();
            }, rate);
        },

        _check: function(){
            var list = this._getAllRequestList();
            var self = this;

            list.forEach(function(item) {
                self._requestContent(item, function (content) {
                    if(self._cache.hasOwnProperty(item.url) && self._cache[item.url] !== content){
                        self._fireCallback(item);
                    }
                    self._cache[item.url] = content;
                });
            });
        },

        _getAllRequestList: function(){
            var self = this,
                list = [];
            for(var item in self._watchTabList){
                if(self._watchTabList.hasOwnProperty( item )){
                    self._watchTabList[item].list.forEach(function(item){
                        if(list.indexOf(item) === -1){
                            list.push(item);
                        }
                    });
                }
            }
            return Utils.uniqueArr(list);
        },

        _requestContent: function(item, callback){
            var url = item.url;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    callback && callback(xhr.responseText);
                }
            };
            xhr.send();
        },

        _fireCallback: function(item){
            for(var key in this._watchTabList){
                if(this._watchTabList.hasOwnProperty(key)){
                    var tab = this._watchTabList[key];
                    if(tab.list.indexOf(item) !== -1){
                        try {
                            tab.callback(item);
                        }catch( e ){
                            // do nothing
                            console.log('callback error');
                        }
                    }
                }
            }
        },

        add: function(tabId, list, callback){
            var self = this;
            this._watchTabList[tabId] = {
                list: list,
                callback: callback
            };

            list.forEach(function(item) {
                if(!self._cache.hasOwnProperty(item.url)){
                    self._requestContent(item, function(content){
                        self._cache[item.url] = content;
                        console.log('init '+item.url);
                    });
                }
            });
        },

        remove: function(tabId){
            delete this._watchTabList[tabId];
        }
    };

    LiveReloadWatcher.init();
})(window);
