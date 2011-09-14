var hostname = 'http://www.tingwo.cc';
var stem = '/api';

$(document).ready(function(){
    $.ajaxSetup({
        cache: false,
        statusCode: {
            403: function(){
                window.location.href = 'login.html';
            },
            500: function(){
                $('<div class="loading error"></div>').html('<span>服务器发生错误... （＞﹏＜）</span>').appendTo('body');
            }
        }
    });
    
    $('<div class="loading"></div>').html('<img src="image/ico-loader.gif"><span>正在载入...</span>').appendTo('body').hide().ajaxStart(function(){
        $('.error', '.success').remove();
        $(this).show();
    }).ajaxStop(function(){
        $(this).hide();
    })
});

function httpRequestCode(code){
    var RequestCode = String(code);
    if (RequestCode.substring(0, 1) == "2") {
        return "success";
    }
    else 
        if (RequestCode.substring(0, 1) == "4") {
            switch (RequestCode) {
                case "403000":
                    showErrorTip("账号没有权限执行此操作。");
                    break;
                case "418000":
                    showErrorTip("请求参数发生了错误。");
                    break;
                case "422000":
                    window.location.href = 'login.html';
                    break;
                case "419001":
                    showErrorTip("今天的关注人数太多了，明天再来试试吧。");
                    break;
                default:
                    showErrorTip("未知权限错误。错误码:(" + RequestCode + ")。");
            }
        }
        else 
            if (RequestCode.substring(0, 1) == "5") {
                switch (RequestCode) {
                    case "551000":
                        showErrorTip("新浪微博的服务发生了错误。");
                        break;
                    default:
                        showErrorTip("未知权限错误。错误码:(" + RequestCode + ")。");
                }
            }
            else {
                showErrorTip("未知错误。错误码(" + RequestCode + ")。");
            }
}

function pagePool(page, filter, callback){
    $.getJSON(hostname + stem + '/page.pool/' + filter, {
        "page": page
    }, function(data){
        if (httpRequestCode(data.response.code) == "success") {
            callback(data);
        }
    });
}

function candidateFollow(obj, callback){
    $.post(hostname + stem + '/candidate.follow/', {
        "candidates": obj
    }, function(data){
        if (httpRequestCode(data.response.code) == "success") {
            callback(data);
        }
    }, 'json');
}

function candidateUnfollow(obj, callback){
    $.post(hostname + stem + '/candidate.unfollow/', {
        "candidates": obj
    }, function(data){
        if (httpRequestCode(data.response.code) == "success") {
            callback(data);
        }
    }, 'json');
}

function candidateManage(obj, callback){
    $.post(hostname + stem + '/candidate.manage/', {
        "candidates": obj
    }, function(data){
        if (httpRequestCode(data.response.code) == "success") {
            callback(data);
        }
    }, 'json');
}

function candidateUnmanage(obj, callback){
    $.post(hostname + stem + '/candidate.unmanage/', {
        "candidates": obj
    }, function(data){
        if (httpRequestCode(data.response.code) == "success") {
            callback(data);
        }
    }, 'json');
}

function candidateDailyFollow(callback){
    $.post(hostname + stem + '/candidate.daily_follow/', {}, function(data){
        if (httpRequestCode(data.response.code) == "success") {
            callback(data);
        }
    }, 'json');
}

function keywordNew(obj, callback){
    $.post(hostname + stem + '/keyword.new/', {
        "values": obj
    }, function(data){
        if (httpRequestCode(data.response.code) == "success") {
            callback(data);
        }
    }, 'json');
}

function keywordUpdate(obj, callback){
    $.post(hostname + stem + '/keyword.wholly_update/', {
        "values": obj
    }, function(data){
        if (httpRequestCode(data.response.code) == "success") {
            callback(data);
        }
    }, 'json');
}

function pageAnalysis(callback){
    $.getJSON(hostname + stem + '/page.analysis/', {}, function(data){
        if (httpRequestCode(data.response.code) == "success") {
            callback(data);
        }
    });
}

