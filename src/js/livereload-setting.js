/**
 * description: live reload background run init
 * author: rehorn@vip.qq.com
 * date: 2012-04-22
 */

(function(window, undefined){

    var LiveReloadSetting = {
        _option:{
            lr_enable_css: true,
            lr_enable_js: true,
            lr_enable_html: true,
            lr_skip_external: true,
            lr_css_transitions: true,
            lr_refresh_rate: 1000,
            lr_enable_scrolly: true,
            lr_enable_id_tag: true,
            lr_enable_class_tag: true,
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
            var list = this._option['lr_live_list'];
            list.push(url);
            this.set('lr_live_list', list);
        },
        removeLiveList: function(url){
            var list = this._option['lr_live_list'];
            if(this.isUrlLive(url)){
                list.remove(url);
                this.set('lr_live_list', list);
            }
        },
        isUrlLive: function(url){
            return this._option['lr_live_list'].indexOf(url) > 0;
        },
        getOption: function(){
            this.update();
            return this._option;
        }
    };

    window.LiveReloadSetting = LiveReloadSetting;

})(window);
