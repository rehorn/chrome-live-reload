/**
 * author allenm i@allenm.me
 * date 2012-02-15
 * get the page's css , and tell the background page , then if the css changed , background page will tell this to reload css
 */

(function ( ) {

    var Util = {
        toArr:function ( arrLike ) {
            return Array.prototype.slice.call( arrLike );
        },

        getAttr:function( dom, attrName ){
            return dom.getAttribute(attrName);
        },

        setAttr:function ( dom, attrName, attrValue ) {
            return dom.setAttribute( attrName, attrValue );
        },

        /**
         * get absolute url
         */
        getAbsUrl:function( url ) {
            if( /https{0,1}:\/\//.test(url) ){
                return url;
            }else{
                var href = window.location.href,
                    basePathArr = href.split('/');
                basePathArr.pop();

                var urlArr = url.split('/'),
                    tmpArr = [];

                urlArr.forEach( function ( item ) {
                    if( item === '..'){
                        basePathArr.pop();
                    }else if( item === '.'){
                        // do nothing
                    }else{
                        basePathArr.push( item );
                    }
                });
                return basePathArr.join('/');
            }
        }
    }

    var main = {
        init:function ( ) {
            this.initSendLinks();
            this.initOnRequest();
            this._adjustScroll();
        },

        initSendLinks:function ( ) {
            var cssLinks = this._getCssLinks();
            chrome.extension.sendRequest({
                "action":"initList",
                "data":{
                    cssLinks:cssLinks,
                    locationHref:location.href
                }
            }, function(response) {
                console.log(response);
            });
        },

        _adjustScroll: function ( ) {
            var key = '__F5ScrollY';
            var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
                result = reg.exec(document.cookie);

            var y = result ? result[2] : null;
            if (y == null) return;
            if (window.pageYOffset != null) window.pageYOffset = y;
            if (document.documentElement.scrollTop != null) document.documentElement.scrollTop = y;
            if (window.pageYOffset != null) window.pageYOffset = y;
            if (document.body.scrollTop != null) document.body.scrollTop = y
        },

        _getCssLinks:function ( ) {
            var links = Util.toArr(document.getElementsByTagName('link')),
                result = [];

            links.forEach( function ( item ) {
                if( Util.getAttr(item ,'rel') === 'stylesheet' ){
                    result.push( Util.getAbsUrl(Util.getAttr(item , 'href')));
                }
            });

            return result;

        },

        initOnRequest:function ( ) {
            var self = this;
            chrome.extension.onRequest.addListener(function ( request, sender, sendRequest ) {
                if( request.action === 'reloadCss' ){
                    self._reloadCss();
                }else if( request.action === 'reloadHtml' ) {
                    self._reloadHtml();
                }
            });
        },

        _reloadCss: function ( ) {
            var links = Util.toArr(document.getElementsByTagName('link')),
                now = (new Date())-0;

            links.forEach( function ( item ) {
                if( Util.getAttr(item ,'rel') === 'stylesheet' ){
                    var href = Util.getAttr( item , 'href' );
                    Util.setAttr( item , 'href', href );
                }
            });

        },

        _reloadHtml: function ( ) {
            var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            document.cookie = '__F5ScrollY' + "=" + y;
            location.reload();
        }

    }

    main.init();

})();
