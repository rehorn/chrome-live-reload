/**
 * description: live reload background run init
 * author: rehorn@vip.qq.com
 * date: 2012-04-22
 */

(function(window, undefined) {

    var LiveReloadSetting = window.LiveReloadSetting;
    console.log(LiveReloadSetting);

    var el = {};
    el.clearAll = document.querySelector('#clearAll');
    el.urlList = document.querySelector('#urlList');
    el.fields = document.querySelectorAll('.container select, .container input[type="checkbox"]');

    var OptionPage = {
        init: function() {
            this.initEvents();
        },
        initEvents: function() {
            var self = this;
            var observer = {
                onClearAll: function(e) {
                    console.log('clearAll');
                    el.urlList.innerHTML = '';
                    LiveReloadSetting.set('lr_live_list', []);
                },
                updateValue: function(e) {
                    console.log('update');
                    var elm = e.srcElement;
                    if (elm.getAttribute('type') == 'checkbox') {
                        LiveReloadSetting.set(elm.id, elm.checked);
                    } else {
                        LiveReloadSetting.set(elm.id, elm.value);
                    }
                    console.log(LiveReloadSetting.getOption());
                },
                onRemoveUrl: function(e){
                    var elm = e.srcElement;
                    if(elm.className == 'deleteButton'){
                        LiveReloadSetting.removeLiveList(elm.getAttribute('url'));
                        self.initUrlList();
                    }
                }
            };

            for (var i = 0; i < el.fields.length; i++) {
                if (el.fields[i].getAttribute('type') == 'checkbox') {
                    el.fields[i].checked = false;
                    if (LiveReloadSetting.get(el.fields[i].id)) {
                        el.fields[i].checked = true;
                    }
                } else {
                    el.fields[i].value = '' + LiveReloadSetting.get(el.fields[i].id);
                }
                el.fields[i].addEventListener('change', observer.updateValue, false);
            }

            this.initUrlList();
            el.urlList.addEventListener('click', observer.onRemoveUrl, false);
            el.clearAll.addEventListener('click', observer.onClearAll, false);
        },
        initUrlList: function(){
            var urls = LiveReloadSetting.get('lr_live_list');
            var html = '';
            for(var j = 0; j < urls.length; j++){
                var url = urls[j];
                html += '<li><a href="'+url+'" title="'+url+'" target="_blank">'+url+'</a><button class="deleteButton" url="'+url+'">×</button></li>'
            }
            el.urlList.innerHTML = html;
        }
    };

    OptionPage.init();

})(window);
