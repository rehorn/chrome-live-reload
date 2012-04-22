/**
 * description: live reload background run init
 * author: rehorn@vip.qq.com
 * date: 2012-04-22
 */

(function(window, undefined){

    var LiveReloadWatcher = window.LiveReloadWatcher;

    var LiveReload = {
        // 当前tab是否启用了live reload
        _tabStatus:{},

        _res:{
            iconOn: 'images/livereload-19.png',
            iconOff: 'images/livereload-off-19.png',
            injectScript: 'js/livereload-inject.js'
        },

        // 扩展初始化入口
        init: function(){
            console.log('LiveRload init start');
            this.initEvents();
        },

        initEvents: function(){
            console.log('LiveRload initEvents');
            var self = this;

            var observer = {
                onBrowserActionClicked: function(tab){
                    if(!self._tabStatus[tab.id]){
                        chrome.tabs.executeScript(tab.id, {
                            "file": self._res.injectScript
                        });
                        chrome.browserAction.setIcon({
                            tabId: tab.id,
                            path: self._res.iconOn
                        });
                        self._tabStatus[tab.id] = true;
                        console.log('start watch tab ' + tab.id);
                    }else{
                        LiveReloadWatcher.remove(tab.id);
                        chrome.browserAction.setIcon({
                            tabId: tab.id,
                            path: self._res.iconOff
                        });
                        self._tabStatus[tab.id] = false;
                        console.log('stop watch tab ' + tab.id);
                    }
                },
                onExtRequest: function(request, sender, sendResponse){
                    console.log('Request initWatchList');
                    if(request.action && request.action === 'initWatchList'){
                        LiveReloadWatcher.add(sender.tab.id, request.data, function(item){
                            self.fireRload(sender.tab.id, item);
                            console.log('tab' + sender.tab.id + ' have changed');
                        });
                        sendResponse('livereload initWatchList ok');
                    }
                },
                onTabUpdated: function(tabId, changeInfo){
                    if(self._tabStatus[tabId] === true && changeInfo.status === 'complete'){
                        chrome.tabs.executeScript(tabId, {
                            "file": self._res.injectScript
                        });
                        chrome.browserAction.setIcon({
                            tabId: tabId,
                            path: self._res.iconOn
                        });
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
