/**
 * Created by Administrator on 2016/11/30.
 */
(function(c){
    var v = new Vue({
        el :　'#vue',
        //数据
        data : {
            wechatCode : c.getQueryString("code"),    //微信code
            showIndex : true,                         //首页显示
            showMine : false,                         //我的显示
            projectLists : null,                      //项目列表
            projectNum : null,                        //项目数量
            wechatUnionId : null,                     //微信UnionId
            wechatOpenId : null,                      //微信OpenId
            wechatNickName : null,                    //微信昵称
            wechatHeadImg : null,                     //微信头像
        },
        //方法
        methods : {
            //初始化首页
            init: function () {
                v.getProjectList(1,10);                          //获取项目信息
                v.byCodeGetUserInfo(v.wechatCode);               //通过微信code获取用户信息
                v.bottomTap(localStorage.getItem('showType'));   //是否显示我的页面
                v.listenerHistory();
            },
            //通过微信code获取用户信息
            byCodeGetUserInfo : function(code){
                if(code){
                    $.getJSON("../../weixin/requestWechatUsrInfo?code=" + code, function(json) {
                        if(json.retcode==0){
                            v.wechatUnionId = json.result.unionid;    //微信unionid
                            v.wechatOpenId = json.result.openid;      //微信OpenId
                            v.wechatNickName = json.result.nickname;  //微信用户昵称
                            v.wechatHeadImg = json.result.headimgurl; //微信用户头像
                            c.storage('set',{
                                wechatUnionId : v.wechatUnionId,
                                wechatOpenId : v.wechatOpenId,
                                wechatNickName : v.wechatNickName,
                                wechatHeadImg : v.wechatHeadImg,
                            });
                            //从公众号菜单进入删除分享标记
                            localStorage.removeItem('fromShare');
                        }
                    });
                }else{
                    //beBug-------------------
                    //localStorage.removeItem('fromShare');
                    //v.wechatUnionId = 12312;
                    //v.wechatOpenId = 'fghgf312';
                    //v.wechatNickName = 'Jeck'
                    //v.wechatHeadImg = 'http://7xkfbr.com1.z0.glb.clouddn.com/170104/15/1710/170104_151710_J1gs6G6j.jpg'; //微信用户头像
                    //c.storage('set',{
                    //    wechatUnionId : v.wechatUnionId,
                    //    wechatOpenId : v.wechatOpenId,
                    //    wechatNickName : v.wechatNickName,
                    //    wechatHeadImg : v.wechatHeadImg,
                    //});
                    //beBug-------------------
                }
                //微信分享
                var strShareTitle = '各大电影开放众筹！丰厚回报超乎你想象！';
                var strShareDesc = '想要获得电影的高额回报，并在电影中打上你的名字，就赶紧来出品这部电影吧！';
                var strShareLinkUrl = host+'/moviecrowdfund/html/index.html';
                var strShareThumbUrl = 'http://o7b9uxv6i.bkt.clouddn.com/logo.png';
                c.wx_handShare(strShareTitle, strShareDesc, c.createWechatShareUrl(strShareLinkUrl),strShareThumbUrl);
            },
            //获取项目列表
            getProjectList : function(page,pageSize) {
                $.post(host + '/zc2/project/list', {page : page,pageSize : pageSize,type : 'vedio'}, function (data) {
                    if (data.retcode == 0) {
                        v.projectNum = data.result.length;
                        if(v.projectNum != 0){
                            if(v.projectNum>5){
                                $('.projectList .more').show();
                                v.projectLists = data.result.slice(0,5);
                            }else{
                                v.projectLists = data.result;
                            }
                        }else{
                            alert('暂无项目');
                        }
                    } else {
                        alert('请求错误');
                    }
                })
            },
            //底部导航栏逻辑
            bottomTap : function(type,e){
                //初始化显示我的页面
                if(!e){
                    if(type=='showMine'){
                        v.wechatNickName = localStorage.getItem('wechatNickName');
                        v.wechatHeadImg = localStorage.getItem('wechatHeadImg');
                        v.showIndex = false;
                        $('.bottomTap>.right').find('img').attr('src','../images/mineTapSelect.png');
                        $('.bottomTap>.left').find('img').attr('src','../images/indexTap.png');
                    }
                }
                //点击逻辑
                else{
                    var ele = $(e.currentTarget);
                    if(type == 'index'){
                        v.showIndex = true;
                        v.getProjectList(1,10);            //获取项目信息
                        localStorage.removeItem('showType');
                        ele.find('img').attr('src','../images/indexTapSelect.png');
                        ele.siblings().find('img').attr('src','../images/mineTap.png');
                    }else{
                        v.showIndex = false;
                        v.wechatNickName = localStorage.getItem('wechatNickName');
                        v.wechatHeadImg = localStorage.getItem('wechatHeadImg');
                        ele.find('img').attr('src','../images/mineTapSelect.png');
                        ele.siblings().find('img').attr('src','../images/indexTap.png');
                    }
                }
            },
            //跳转更多项目列表页
            skipMoreProject: function (argument) {
                location.href = 'moreProject.html'
            },
            //跳转投资项目页
            skipInvestment: function (argument) {
                localStorage.setItem('showType','showMine');
                location.href = 'investment.html'
            },
            //跳转出品项目页
            skipPresentProject: function (argument) {
                localStorage.setItem('showType','showMine');
                location.href = 'presentProject.html';
            },
            //跳转项目内页
            skipProject: function (projectId) {

                //来自分享页面
                if(c.storage('get','fromShare')=='true'){
                    var referrerUnionId = localStorage.getItem('referrerUnionId');
                    var link = host+'/moviecrowdfund/html/project.html?projectId='+ projectId +'&fromShare=true&wechatUnionId='+ c.getQueryString('wechatUnionId');
                    if(referrerUnionId){
                        //是出品人
                        link += '&referrerUnionId='+ referrerUnionId;
                    }else{
                        //不是出品人
                    }
                    location.href = link;
                }else{
                    //不是分享页面
                    //删除分享后的推荐人Id缓存
                    localStorage.removeItem('referrerUnionId');
                    location.href = 'project.html?projectId='+projectId;
                }
            },
            //跳转介绍网页
            toIntroduce : function() {
                //location.href = 'http://mp.weixin.qq.com/s?__biz=MzI0NzAyMDIwNg==&mid=2649832155&idx=1&sn=4f6d62ad28e5d723b65bbcce2fb94b19&chksm=f1b3f51ac6c47c0cfe45d7af249092d519d2d6849d0e706dd5aad57b870f8cfd595c4353cdeb#rd';
                location.href = 'article.html';
                //监听历史记录
            },
            listenerHistory : function(){
                window.addEventListener('popstate',function(e){
                    if(e.state)
                    {
                        var pages =e.state.page
                        switch(pages)
                        {
                            //返回查看余额页面
                            case 'index' :
                                //location.href ='';
                                alert(1);
                                break;
                            default:
                            //n 与 case 1 和 case 2 不同时执行的代码
                        }
                    }
                })
            },
        },
        //自定义数据过滤器
        filters: {
            //项目进度超过100%
            exceed100 : function(arrangeMoney,allMoney){
                return c.exceed100(arrangeMoney,allMoney);
            },
            //格式化金额
            formatMoney : function(str){
                return c.formatMoney(str);
            },
            //格式化项目时间
            stopTime : function(stopTime){
                return c.stopTime(stopTime);
            },
            //减少图片大小
            formatImg : function(src){
                return src +'?imageslim';
            }
        }
    })
    v.init();
})(window.commonJs);
