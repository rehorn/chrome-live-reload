/**
 * description: live reload background run init
 * author: rehorn@vip.qq.com
 * date: 2012-04-22
 */

(function(window, undefined){

    var Utils = {
        remove: function (source, match) {
            var len = source.length;
                
            while (len--) {
                if (len in source && source[len] === match) {
                    source.splice(len, 1);
                }
            }
            return source;
        }
    };

    var LiveReloadSetting = {
        _option:{
            lr_enable_css: true,
            lr_enable_js: true,
            lr_enable_html: true,
            lr_skip_external: true,
            lr_css_transitions: true,
            lr_refresh_rate: 1000,
            lr_enable_scrolly: true,
            lr_enable_tag: true,
            lr_enable_F9: true,
            lr_live_list: []
        },
        init: function(){
            this.update();
        },
        set: function(key, value){
            this._option[key] = value;
            localStorage.setItem(key, JSON.stringify(value));
        },
        get: function(key){
            var item = JSON.parse(localStorage.getItem(key));
            return (item !== null) ? item : this._option[key];
        },
        remove: function(key){
            localStorage.removeItem(key);
        },
        update: function(){
            for(var key in this._option){
                this._option[key] = this.get(key);
            }
        },
        addLiveList: function(url){
            var list = this.get('lr_live_list');
            if(!this.isUrlLive(url)){
                list.push(url);
                this.set('lr_live_list', list);
                this._option['lr_live_list'] = list;
            }
        },
        removeLiveList: function(url){
            var list = this.get('lr_live_list');
            if(this.isUrlLive(url)){
                Utils.remove(list, url);
                this.set('lr_live_list', list);
                this._option['lr_live_list'] = list;
            }
        },
        isUrlLive: function(url){
            return this.get('lr_live_list').indexOf(url) >= 0;
        },
        getOption: function(){
            this.update();
            return this._option;
        }
    };

    LiveReloadSetting.init();

    window.LiveReloadSetting = LiveReloadSetting;

})(window);
