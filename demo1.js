/**
 * Created by Administrator on 2016/8/29.
 */
//定义全局的变量
var host='';                                      //域名
var wechatTitle,wechatDesc,wechatLink,wechatThumb = null;
var remScale = null;   //rem相对值
(function(window){
    //定义全局的的方法
    var commonJs ={
        //初始化页面方法
        init : function(){
            this.sizeChange();
            this.getHost();
        },
        //控制html的fontSize
        sizeChange : function(){
            var htmlEl=document.documentElement;
            var momentWith=0;
            function setHtmlFontSize(designWidth,maxWidth){
                momentWith =  htmlEl.clientWidth>maxWidth?maxWidth:htmlEl.clientWidth;
                htmlEl.style.fontSize=momentWith/designWidth*100+'px';
                remScale = momentWith/designWidth*100;
            }
            setHtmlFontSize(750,750);
            window.addEventListener('resize',function(){
                setHtmlFontSize(750,750);
            },false)
        },
        //自动获取接口域名
        getHost : function(){
            host =window.location.href;
            var  protocol = window.location.protocol;//http:
            if (host.indexOf("japi") !=-1 && host.indexOf("tjapi") ==-1 ) {
                host =protocol+"//japi.xingmoquan.com";
            } else if (host.indexOf("tjapi")!=-1) {
                host  =protocol+"//tjapi.xingmoquan.com";
            }else {
                host ="http://192.168.0.37:8082/xmq-api";
            }
        },
        //获取查询字符串参数
        getQueryString : function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        //数字少于两位加0
        add0 :　function(m){
            return m<10?'0'+m:m;
        },
        //格式化金额
        formatMoney : function(str){
            var newStr = "";
            var count = 0;
            if(!str){
                return '0';
            }
            str = str.toString();
            if(str.indexOf(".")==-1){
                for(var i=str.length-1;i>=0;i--){
                    if(count % 3 == 0 && count != 0){
                        newStr = str.charAt(i) + "," + newStr;
                    }else{
                        newStr = str.charAt(i) + newStr;
                    }
                    count++;
                }
                return newStr;
            }
            else
            {
                for(var i = str.indexOf(".")-1;i>=0;i--){
                    if(count % 3 == 0 && count != 0){
                        newStr = str.charAt(i) + "," + newStr;
                    }else{
                        newStr = str.charAt(i) + newStr; //逐个字符相接起来
                    }
                    count++;
                }
                str = newStr + (str + "00").substr((str + "00").indexOf("."),3);
                return str;
            }
        },
        //项目进度
        projectProgress : function(arrangeMoney,allMoney){
            var progress = Math.floor(arrangeMoney/allMoney*100);
            if(progress>100) {
                progress = 100;
            }
            return progress + '%';
        },
        //项目进度超过100%
        exceed100 : function(arrangeMoney,allMoney){
            var progress = Math.floor(arrangeMoney/allMoney*100);
            return progress + '%';
        },
        //格式化项目时间
        stopTime : function(stopTime){
            var nowTime = new Date().getTime();         //当前时间
            var leadTime = (stopTime - nowTime)/1000;   //相差时间(86400一天的秒数)
            //时间戳转换成天数
            leadTime = Math.ceil(leadTime/(60*60*24));
            if(leadTime<0){
                return 0;
            }else{
                return leadTime;
            }
        },
        //多余字符用...代替
        sliceStr : function(str,num){
            if(str){
                if(str.length>num){
                    return str.slice(0, num) + "...";
                }else{
                    return str;
                }
            }
        },
        //* 功   能：格式化时间戳
        //* 入口参数：imestamp:时间戳（numble）  type分隔符（字符串） 例：format(Date.now(),'-')
        //* 出口参数：例：2016-10-28
        //* 备   注：无
        format : function(timestamp,type){
            var time = new Date(timestamp);
            var y = time.getFullYear();
            var m = time.getMonth()+1;
            var d = time.getDate();
            return y + type + commonJs.add0(m) + type + commonJs.add0(d);
        },
        //微信分享
        wx_handShare : function(strTitle, strDesc, strLinkUrl, strThumbUrl, shareCompleteCallback) {
            var currentUrl = location.href.split('#')[0]
            currentUrl = encodeURIComponent(currentUrl)
            $.getJSON("../../weixin/token?currentUrl=" + currentUrl, function (json) {
                var data = json['result'];
                wx.config({
                    debug: false,
                    appId: data['appid'],
                    timestamp: data['timestamp'],
                    nonceStr: data['nonceStr'],
                    signature: data['signature'],
                    jsApiList: [
                        'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone',
                    ]
                });
                wx.ready(function () {
                    wx.onMenuShareAppMessage({
                        title: strTitle,
                        desc: strDesc,
                        link: strLinkUrl,
                        imgUrl: strThumbUrl,
                        trigger: function (res) {},
                        success: function (res) {
                            if (shareCompleteCallback != null) shareCompleteCallback('ShareFriend');
                        },
                        cancel: function (res) {},
                        fail: function (res) {}
                    });
                    wx.onMenuShareTimeline({
                        title: strTitle,
                        desc: strDesc,
                        link: strLinkUrl,
                        imgUrl: strThumbUrl,
                        trigger: function (res) {},
                        success: function () {
                            if (shareCompleteCallback != null) shareCompleteCallback('ShareTimeline');
                        },
                        cancel: function () {}
                    });
                });
                wx.error(function (res) {
                    //alert('wx.error:' + JSON.stringify(res));
                });
            })
        },
        //分享朋友圈或者好友
        wx_handShareEx : function(hookFunc, shareCompleteCallback) {
            var currentUrl = location.href.split('#')[0]
            currentUrl     = encodeURIComponent(currentUrl)
            $.getJSON("../../weixin/token?currentUrl=" + currentUrl, function (json) {
                var data = json['result'];
                wx.config({
                    debug: false,
                    appId: data['appid'],
                    timestamp: data['timestamp'],
                    nonceStr: data['nonceStr'],
                    signature: data['signature'],
                    jsApiList: [
                        'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                    ]
                });
                wx.ready(function () {
                    wx.onMenuShareAppMessage({
                        title: hookFunc == null? wechatTitle : hookFunc('Friend', 'title'),
                        desc: hookFunc == null? wechatDesc : hookFunc('Friend', 'desc'),
                        link: hookFunc == null? wechatLink : hookFunc('Friend', 'link'),
                        imgUrl: hookFunc == null? wechatThumb : hookFunc('Friend', 'thumb'),
                        trigger: function (res) {},
                        success: function (res) {
                            if (shareCompleteCallback != null) shareCompleteCallback('ShareFriend');
                        },
                        cancel: function (res) {},
                        fail: function (res) {},
                    });
                    wx.onMenuShareTimeline({
                        title: hookFunc == null? wechatTitle : hookFunc('Timeline', 'title'),
                        desc: hookFunc == null? wechatDesc : hookFunc('Timeline', 'desc'),
                        link: hookFunc == null? wechatLink : hookFunc('Timeline', 'link'),
                        imgUrl: hookFunc == null? wechatThumb : hookFunc('Timeline', 'thumb'),
                        trigger: function (res) {},
                        success: function () {
                            if (shareCompleteCallback != null) shareCompleteCallback('ShareTimeline');
                        },
                        cancel: function () {}
                    });
                });
                wx.error(function (res) {
                    //alert('wx.error:' + JSON.stringify(res));
                });
            })
        },
        //微信的回调链接，用于获取code，以及微信信息
        createWechatShareUrl: function (pageUrl) {
            if (pageUrl){
                pageUrl = encodeURIComponent(pageUrl);
                return 'http://japi.xingmoquan.com/html/get-weixin-code.html?appid=wx14e24abbe6111362&redirect_uri=' + pageUrl + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
            };
        },
        //* 功   能：本地信息存取
        //* 入口参数：operate 存储方式（set,get,remove,clear） key 键  value 值
        //* 出口参数：get方式返回取出的string或object类型，
        //* 备   注：无
        storage: function (operate, key, value) {
            var regxIn = /[<>]+/ig; //不允许存储任何网页
            if (operate == "set" && !regxIn.test(value)) {
                //一次性存储多个键值对
                if(typeof key == "object"){
                    for(var i in key){
                        if(typeof key[i] == "object"){
                            localStorage.setItem(i,JSON.stringify(key[i]));
                        }else{
                            localStorage.setItem(i,key[i]);
                        }
                    }
                    return;
                }
                //如果是一个object类型，则转为字符串存储
                if(typeof value == "object"){
                    localStorage.setItem(key, JSON.stringify(value));
                }else{
                    localStorage.setItem(key, value);
                }
            } else if (operate == "remove") {
                localStorage.removeItem(key);
            } else if (operate == "get") {
                //如果取出的是一个"[...]"或者"{...}"类型，则转为'object'
                var key = localStorage.getItem(key);
                if((/(^\[)|(^\{)/g).test(key)){
                    return JSON.parse(key);
                }else{
                    return key;
                }
            } else if (operate == "clear") {
                localStorage.clear();
            }
        },
        //* 功   能：添加或者替换历史记录
        //* 入口参数：state，title，url是一个对象，popstate事件可以捕捉到state。
        //* 出口参数：无
        //* 备   注： title，url一般为空。如果type为空，则替换当前历史记录并添加历史记录
        history: function(state,type,title,url){
            title ? title : null;
            type  ? type  : null;
            url   ? url   : null;
            if(type == 'push'){
                //添加历史记录
                history.pushState(state, title, url);
            }else if(type == 'replace'){
                //替换当前历史记录
                history.replaceState(state, title, url);
            }else if(type == null){
                //替换当前历史记录并添加历史记录
                history.replaceState(state, title, url);
                history.pushState(state, title, url);
            }
        },
        //* 功   能：计算数据的长度
        //* 入口参数：fData：需要计算的数据
        //* 出口参数：返回fData的长度(Unicode长度为2，非Unicode长度为1)
        //* 备   注：无
        DataLength : function(fData){
            var intLength=0
            for (var i=0;i<fData.length;i++)
            {
                if ((fData.charCodeAt(i) < 0) || (fData.charCodeAt(i) > 255))
                    intLength=intLength+2
                else
                    intLength=intLength+1
            }
            return intLength
        },
        },
    }
    window.commonJs = commonJs;
})(window)
commonJs.init();