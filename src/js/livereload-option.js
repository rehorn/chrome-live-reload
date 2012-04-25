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

            el.clearAll.addEventListener('click', observer.onClearAll, false);
        }
    };

    OptionPage.init();

})(window);
