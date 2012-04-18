/**
 * author allenm i@allenm.me
 * date 2012-02-19
 */

var Compare = {

    _cssList : [],
    _watchList:{},

    _cssCache : {},
    _htmlCache : {},

    init:function ( ) {
        var self = this;
        setInterval( function ( ) {
            self._doCompare();
        },1000);
    },

    // 执行比较
    _doCompare:function ( ) {
        var list = this._getDistinctList();
        var cssList = list[0],
            htmlList = list[1],
            self = this;

        cssList.forEach( function ( item ) {
            self._getCssContent( item , function ( content ) {
                if( self._cssCache.hasOwnProperty( item ) && self._cssCache[item] !== content ){
                    self._fireCallback( item, 'css');
                }

                self._cssCache[item] = content;
            });
        });

        htmlList.forEach( function ( item ) {
            self._getHtmlContent( item , function ( content ) {
                if( self._htmlCache.hasOwnProperty( item ) && self._htmlCache[item] !== content ){
                    self._fireCallback( item, 'html' );
                }

                self._htmlCache[item] = content;
            });
        });
    },

    /**
     * 发生了改变，触发 callback
     */
    _fireCallback:function ( url, type ) {
        for( var key in this._watchList ){
            if( this._watchList.hasOwnProperty( key )){
                var item = this._watchList[key];
                if(type == 'css'){
                    if( item.cssList.indexOf( url ) !== -1 ){
                        try {
                            item.cssCallback();
                        }catch( e ){
                            // do nothing
                            console.log('css callback error');
                        }
                    }
                }else if(type == 'html'){
                    if( item.locationHref === url ){
                        try {
                            item.htmlCallback();
                        }catch( e ){
                            console.log('html callback error');

                        }
                    }
                }
            }
        }
    },

    //  获取去重后的 css 列表
    _getDistinctList:function ( ) {
        var css = [], html = [];
        for( var item in this._watchList ){
            if( this._watchList.hasOwnProperty( item )){
                this._watchList[item].cssList.forEach( function ( cssLink ) {
                    if( css.indexOf( cssLink ) === -1 ){
                        css.push( cssLink );
                    }
                });
                var loc = this._watchList[item].locationHref;
                if( html.indexOf( loc ) === -1 ){
                    html.push( loc );
                }
            }
        }

        return [css, html] ;
    },

    _getCssContent:function ( url,callback ) {
        var self = this;
        this._getContent( url , function ( content ) {
            self._parseCssContent( url , content , callback );
        });
    },

    _getHtmlContent:function ( url,callback ) {
        var self = this;
        this._getContent( url , function ( content ) {
            callback(content);
        });
    },

    _getContent:function ( url, callback ) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback && callback( xhr.responseText );
            }
        };
        xhr.send();
    },

    /**
     * 添加需要监控的 css
     */
    addWatch : function ( tabId , data, cssCallback, htmlCallback ){
        var self = this;
        var cssList = data.cssLinks,
            locationHref = data.locationHref;
        this._watchList[ tabId ] = {
            "cssList": cssList,
            "cssCallback": cssCallback,
            "locationHref": locationHref,
            "htmlCallback": htmlCallback
        };

        cssList.forEach( function ( item ) {
            if( !self._cssCache.hasOwnProperty( item ) ){
                self._getCssContent( item , function ( content ) {
                    self._cssCache[item] = content;
                    console.log('init '+item);
                });
            }
        });

        self._getHtmlContent(locationHref, function ( content ) {
            self._htmlCache[locationHref] = content;
            console.log('init '+locationHref);
        });
    },

    /**
     * 取消关注某个 tab
     */
    unWatch:function ( tabId ) {
        delete this._watchList[tabId];
    },

    /**
     * parse css content , support the @import syntax
     */
    _parseCssContent:function ( cssUrl, content , callback ){
        var importReg = /@import.*(?:['"](.*)['"]|url\((.*)\))/g,
            importList = [],
            self = this;
        while( true ){
            var result = importReg.exec( content );
            if( !result ){
                break;
            }else{
                var prePart = content.slice(0, result.index ),
                    startComment = prePart.lastIndexOf( '/*' ),
                    cssFile = result[1]?result[1]:result[2];

                if( !cssFile ){
                    break;
                }

                if( startComment !== -1 ){
                    var endComment = prePart.lastIndexOf('*/');
                    if( endComment !== -1 && endComment > startComment ){ //不在注释中
                        importList.push( self._getAbsUrl( cssUrl, cssFile ) );
                    }
                }else{
                    importList.push( self._getAbsUrl( cssUrl, cssFile ) );
                }
            }
        }

        if( importList.length > 0 ){
            this._getWholeContent( content, importList, callback );
        }else{
            callback( content );
        }
    },

    /**
     * 按照 import list 的顺序，把通过 @import 引入进来的 css 的内容附在 content 的后面，用来后面比较文件变化
     */
    _getWholeContent:function ( content , importList, callback ) {

        var cssUrl = importList.shift(),
            content = content,
            self = this,
            getSubContent = function ( cssUrl ) {
                self._getCssContent( cssUrl, function ( c ) {
                    content += c;
                    if( importList.length > 0 ){
                        getSubContent( importList.shift() );
                    }else{
                        callback( content );
                    }
                });
            };

        getSubContent( cssUrl );

    },

    /**
     * 获取相对路径对应的绝对URL
     */
    _getAbsUrl:function ( baseUrl, url ) {
        if( /https{0,1}:\/\//.test(url) ){
            return url;
        }else{
            var basePathArr = baseUrl.split('/');
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

Compare.init();
