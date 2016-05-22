/**
 * description: live reload background run init
 * author: rehorn@vip.qq.com
 * date: 2012-04-22
 */

(function(window, undefined){

    var LiveReloadSetting = window.LiveReloadSetting;
    var LiveReloadWatcher = window.LiveReloadWatcher;

    var LiveReload = {
        // 当前tab是否启用了live reload
        _tabStatus:{},

        _res:{
            iconOn: 'images/livereload-19.png',
            iconOff: 'images/livereload-off-19.png',
            settingScript: 'js/livereload-setting.js',
            injectScript: 'js/livereload-inject.js',
            injectCss: 'css/inject.css'
        },

        // 扩展初始化入口
        init: function(){
            console.log('LiveRload init start');
            this.initEvents();
        },

        //获得去掉hashtag后的url，以支持多hashtag页面自动刷新 by liangvls@gmail.com 2012-06-10
        getRealUrl: function(url){
            var pos = url.indexOf('#');
            if(pos != -1) {
                url = url.substring(0, pos);
                console.log(url);
            }
            return url;
        },

        initEvents: function(){
            console.log('LiveRload initEvents');
            var self = this;

            var observer = {
                injectScript: function(tab){
                    console.log('injectScript');
                    chrome.tabs.executeScript(tab.id, {
                        "code": "var _setting = " + JSON.stringify(LiveReloadSetting.getOption()) + ";"
                    });
                    chrome.tabs.executeScript(tab.id, {
                        "file": self._res.injectScript
                    });
                    chrome.tabs.insertCSS(tab.id, {
                        "file": self._res.injectCss
                    });
                },
                
                enableLiveReload: function(tab){
                    chrome.tabs.sendRequest(tab.id, {
                        "action": "startLiveReload"
                    });
                    chrome.browserAction.setIcon({
                        tabId: tab.id,
                        path: self._res.iconOn
                    });
                    self._tabStatus[tab.id] = true;
                    var _url = self.getRealUrl(tab.url);
                    LiveReloadSetting.addLiveList(_url);
                    console.log('enable reload tab ' + tab.id);
                },
                disableLiveReload: function(tab){
                    LiveReloadWatcher.remove(tab.id);
                    chrome.browserAction.setIcon({
                        tabId: tab.id,
                        path: self._res.iconOff
                    });
                    self._tabStatus[tab.id] = false;
                    var _url = self.getRealUrl(tab.url);
                    LiveReloadSetting.removeLiveList(_url);
                    console.log('disable reload tab ' + tab.id);
                },
                onBrowserActionClicked: function(tab){
                    if(!self._tabStatus[tab.id]){
                        observer.enableLiveReload(tab);
                    }else{
                        observer.disableLiveReload(tab);
                    }
                },
                onExtRequest: function(request, sender, sendResponse){
                    if(request.action && request.action === 'initWatchList'){
                        console.log('Request initWatchList');
                        LiveReloadWatcher.add(sender.tab.id, request.data, function(item){
                            self.fireRload(sender.tab.id, item);
                            console.log('tab' + sender.tab.id + ' have changed');
                        });
                        sendResponse('livereload initWatchList ok');
                    }
                },
                onTabUpdated: function(tabId, changeInfo, tab){
                    var _url = self.getRealUrl(tab.url);
                    if(_url.indexOf('chrome://') != -1 || 
                        _url.indexOf('chrome-devtools://') != -1  || 
                        _url.indexOf('chrome-extension://') != -1  || 
                        _url.indexOf('view-source:') != -1){
                        return false;
                    }
                    
                    if(changeInfo.status === 'complete'){
                        console.log('complete');
                        observer.injectScript(tab);
                        if(LiveReloadSetting.isUrlLive(_url)){
                            observer.enableLiveReload(tab);
                        }else{
                            observer.disableLiveReload(tab);
                        }
                    }
                },
                onTabRemoved: function(tabId){
                    if(self._tabStatus[tabId] === true){
                        LiveReloadWatcher.remove(tabId);
                        self._tabStatus[tabId] = false;
                    }
                }
            };

            chrome.browserAction.onClicked.addListener(observer.onBrowserActionClicked);
            chrome.extension.onRequest.addListener(observer.onExtRequest);
            chrome.tabs.onUpdated.addListener(observer.onTabUpdated);
            chrome.tabs.onRemoved.addListener(observer.onTabRemoved);

        },

        fireRload: function(tabId, item){
            chrome.tabs.sendRequest(tabId, {
                action: "reload",
                item: item
            });
        }
    };

    LiveReload.init();

})(window);
