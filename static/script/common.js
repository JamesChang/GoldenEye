function showSuccessTip(label){
    if ($('.loading')) {
        $('.loading').remove();
    }
    $('<div class="loading success"></div>').html('<span>' + label + ' （^o^）</span>').appendTo('body');
    setTimeout(function(){
        $('.success').remove();
    }, 3000);
}

function showErrorTip(label){
    if ($('.loading')) {
        $('.loading').remove();
    }
    $('<div class="loading error"></div>').html('<span>' + label + ' （＞﹏＜）</span>').appendTo('body');
    setTimeout(function(){
        $('.error').remove();
    }, 3000);
}

function cutString(string, num){
    var s = new String(string);
    var l = s.replace(/[^\x00-\xff]/g, '**').length;
    if (l > num) {
        for (var i = 0; i < l; i++) {
            if (s.substr(0, i).replace(/[^\x00-\xff]/g, "**").length >= num) {
                return s.substr(0, i) + '...';
            }
        }
    }
    else {
        return s;
    }
    
}
