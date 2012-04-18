/**
 * author allenm i@allenm.me
 * date 2012-02-15
 * css auto reload
 */

(function ( ) {

    var main = {

        _status:{
        },

        init:function ( ) {
            this.initBrowserAction();
            this.initOnRequest();
            this.initOnTabUpdate();
            this.initOnRemoved();
        },

        initBrowserAction:function ( ) {
            var self = this;
            chrome.browserAction.onClicked.addListener(function( tab ) {
                if( !self._status[ tab.id ] ){
                    chrome.tabs.executeScript( tab.id, { "file":"js/insert2page.js" });
                    chrome.browserAction.setIcon( {
                        tabId: tab.id,
                        path: 'imgs/refresh-19.png'
                    });
                    self._status[ tab.id ] = true;
                    console.log('start watch tab '+ tab.id );
                }else{
                    Compare.unWatch( tab.id );
                    chrome.browserAction.setIcon( {
                        tabId: tab.id,
                        path: 'imgs/refresh-unactive-19.png'
                    });
                    self._status[ tab.id ] = false;
                    console.log('stop watch tab '+ tab.id );
                }
            });
        },

        initOnRequest:function ( ) {
            var self = this;
            chrome.extension.onRequest.addListener(function ( request, sender, sendResponse ) {
                if( request.action && request.action === 'initList' ){
                    Compare.addWatch( sender.tab.id, request.data, function ( ) {
                        console.log( sender.tab.id + ' have changed');
                        self.request2Reload( sender.tab.id );
                    }, function (){
                        console.log( sender.tab.id + ' html have changed');
                        self.request2ReloadHtml( sender.tab.id );
                    });
                    sendResponse('init css auto reload ok');
                }
            });
        },

        initOnTabUpdate:function ( ) {
            var self = this;
            chrome.tabs.onUpdated.addListener( function ( tabId, changeInfo ) {

                if( self._status[ tabId ]=== true && changeInfo.status === 'complete' ){
                    chrome.tabs.executeScript( tabId, { "file":"js/insert2page.js" });
                    chrome.browserAction.setIcon( {
                        tabId: tabId,
                        path: 'imgs/refresh-19.png'
                    });
                }
            });
        },

        initOnRemoved:function ( ) {
            var self = this;
            chrome.tabs.onRemoved.addListener( function ( tabId ) {
                if( self._status[ tabId ] === true ){
                    Compare.unWatch( tabId );
                    self._status[ tabId ] = false;
                }
            });
        },

        request2Reload:function ( tabId ) {
            chrome.tabs.sendRequest( tabId, {"action":"reloadCss"});
        },

        request2ReloadHtml: function ( tabId ) {
            chrome.tabs.sendRequest( tabId, {"action":"reloadHtml"});
        }

    }

    main.init();
    console.log('init success');
})();
