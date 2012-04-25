/**
 * description: live reload background run init
 * author: rehorn@vip.qq.com
 * date: 2012-04-22
 */

(function(window, undefined) {

    var LiveReloadSetting = window.LiveReloadSetting;
    LiveReloadSetting.init();
    console.log(LiveReloadSetting.getOption());

    var el = {};
    el.clearAll = document.querySelector('#clearAll');
    el.urlList = document.querySelector('#urlList');
    el.fields = document.querySelectorAll('.container select, .container input[type="checkbox"]');

    var OptionPage = {
        init: function() {
            this.initEvents();
        },
        initEvents: function() {
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

            var urls = LiveReloadSetting.get('lr_live_list');
            var html = '';
            for(var j = 0; j < urls.length; j++){
                html += '<li><a href="'+urls+'" title="'+urls+'" target="_blank">'+urls+'</a><button class="deleteButton" url="'+urls+'">×</button></li>'
            }
            el.urlList.innerHTML = '';
            el.urlList.addEventListener('click', observer.onRemoveUrl, false);
            el.clearAll.addEventListener('click', observer.onClearAll, false);
        }
    };

    OptionPage.init();

})(window);
