### page auto reload 介绍：
page auto reload 是一个为了提高web前端开发者开发效率的chrome扩展。它能够自动监控页面html及其所包含css的变化，自动刷新页面，避免开发者开发过程需要频繁F5页面的烦恼，提高的开发效率。

暂不支持本地file://文档格式，推荐结合fiddler, rythem等本地替换开发工具进行

ps：
page auto reload是在allenm开发的css auto reload的基础上进行改造而来。

https://github.com/allenm/css-auto-reload

css auto reload 特性:
只需要安装一个 chrome 插件，不需要特殊的服务器端，不需要特意改变你的页面
需要的时候，只需要点击一下插件栏的图标即可对当前页面开启监控，不需要的时候，再次点击以关闭
此插件不会更改任何 DOM 结构，也不会在你页面的 js 执行环境中执行任何 js ,绝不干扰你页面的任何代码
在你没改变 css 的时候，页面不会 reload css ，调试面板中网络一栏不会多出很多请求
支持 css 和 page 不同域的情况
支持 css 相对路径，绝对路径
支持 @import ， @import 进来的 css 如果发生了改变也会 reload
暂不支持:
不支持通过 file:// 打开的页面
不支持页面中的 iframe 内的 css 变化
