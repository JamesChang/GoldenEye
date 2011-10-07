var date = '';
var filter = '';
var noResult = '暂时没有找到符合条件的人选。';
var found;

$(document).ready(function(){

    $('.updateKeywordHandle').die().live('click', function(){
        pagePool('', filter, function(data){
            keywordsPopupRenderer(data.keywords, function(data){
                $('#updateKeywordPanel .searchKeyword .tagsList').html(data);
            });
            
            bindTip();
        });
        
        $.blockUI({
            message: $('#updateKeywordPanel'),
            css: {
                top: ($(window).height() - 503) / 2 + 'px',
                left: ($(window).width() - 799) / 2 + 'px',
                border: 'none',
                width: '799px',
                cursor: 'auto',
                backgroundColor: 'transparent'
            },
            overlayCSS: {
                backgroundColor: '#ffffff',
                opacity: 0.7,
                cursor: 'no-drop'
            },
            focusInput: false
        });
        
        $('#updateKeywordPanel .okButton').die().live('click', function(){
            var $input = $('#updateKeywordPanel .inputKeyword');
            if ($('#updateKeywordPanel .tagsList li').length == 0 && !$input.val()) {
                $('.errorTip').show();
                return false;
            }
            if ($input.val()) {
                var h = "<li class='tag'>";
                h += "<span class='label' value='" + $input.val() + "'>" + $input.val() + "</span>";
                h += "<span class='deleteButton'></span>";
                h += "</li>";
                $input.siblings('.tagsList').append(h);
            }
            
            $input.val('').hide();
            $('.addKeyword').show();
            
            var obj = [];
            $('#updateKeywordPanel .searchKeyword .tagsList li').each(function(){
                var s = $(this).children('.label').attr('value');
                obj.push('"' + s + '"');
            });
            var value = '[' + obj.join() + ']';
            
            keywordUpdate(value, function(){
                refreshKeywords();
                $.unblockUI();
            });
            
            return false;
        });
        
        $('.cancelButton').click(function(){
            $.unblockUI();
            $('#updateKeywordPanel .inputKeyword').val('').hide();
            $('#updateKeywordPanel .addKeyword').show();
            return false;
        });
        
        return false;
    });
    
    $('#wizardPanel .page1 .okButton').die().live('click', function(){
        $('.sliderBox').scrollTo('.page2', 500);
        return false;
    });
    
    $('#wizardPanel .page2 .okButton').die().live('click', function(){
        var $input = $('#wizardPanel .inputKeyword');
        if ($('#wizardPanel .tagsList li').length == 0 && !$input.val()) {
            $('.errorTip').show();
            return false;
        }
        if ($input.val()) {
            var h = "<li class='tag'>";
            h += "<span class='label' value='" + $input.val() + "'>" + $input.val() + "</span>";
            h += "<span class='deleteButton'></span>";
            h += "</li>";
            $input.siblings('.tagsList').append(h);
            $input.val('');
        }
        
        var obj = [];
        $('#wizardPanel .page2 .searchKeyword .tagsList li').each(function(){
            var s = $(this).children('.label').attr('value');
            obj.push('"' + s + '"');
        });
        var value = '[' + obj.join() + ']';
        
        keywordUpdate(value, function(){
            refreshKeywords();
            $('.mainContent').html('<span class="noResult">' + '已开始为您寻找最佳人选。<br/>由于需要进行大量收集、计算及分析。所以别急，让我多找一会儿，过几个小时再来看看。' + '（＞﹏＜）' + '</span>');
            $.unblockUI();
        });
        
        return false;
    });
    
    $('.followAll').die().live('click', function(){
        $(this).addClass('disable').html('增加关注中...').removeAttr('href').removeClass('followAll');
        candidateDailyFollow(function(){
        });
        pollingFollowed(function(){
            $('.tip').slideUp('def', function(){
                showSuccessTip('已成功关注了 ' + found + ' 人');
            });
        });
        return false;
    });
    
    $('.addKeyword').click(function(){
        $('.errorTip,.normalTip').hide();
        $(this).siblings('.tagsList').children('li:last-child').children('.label').removeClass('selected');
        $(this).hide().siblings('input').show().css('width', '120px').focus();
        return false;
    });
    
    $('.inputKeyword').keydown(function(e){
        if ($.browser.webkit) {
            if ($(this).val() && (e.keyCode == 13 || e.keyCode == 220 || e.keyCode == 186 || e.keyCode == 188)) {
                var h = "<li class='tag' title='" + $(this).val() + "'>";
                h += "<span class='label' value='" + $(this).val() + "'>" + cutString($(this).val(), 10) + "</span>";
                h += "<span class='deleteButton'></span>";
                h += "</li>";
                $(this).siblings('.tagsList').append(h);
                $(this).val('');
                bindTip();
                return false;
            }
            else 
                if (e.keyCode == 8 && !$(this).val()) {
                    $last = $(this).siblings('.tagsList').children('li:last-child');
                    if (!$last.children('.label').hasClass('selected')) {
                        $('.addKeyword').show();
                        $(this).hide();
                        $last.children('.label').addClass('selected');
                        return false;
                    }
                    else {
                        $last.remove();
                        $('.addKeyword').hide();
                        $(this).show().focus();
                        return false;
                    }
                }
        }
        else {
            if ($(this).val() && (e.keyCode == 13 || e.keyCode == 220 || e.keyCode == 186 || e.keyCode == 188)) {
                var h = "<li class='tag' title='" + $(this).val() + "'>";
                h += "<span class='label' value='" + $(this).val() + "'>" + cutString($(this).val(), 10) + "</span>";
                h += "<span class='deleteButton'></span>";
                h += "</li>";
                $(this).siblings('.tagsList').append(h);
                $(this).val('');
                bindTip();
                return false;
            }
            else 
                if (e.keyCode == 8 && !$(this).val()) {
                    $(this).siblings('.tagsList').children('li:last-child').remove();
                    return false;
                }
        }
    });
    
    $('.deleteButton').live('click', function(){
        $(this).parent('.tag').remove();
        $("#tiptip_holder").hide();
        $('.inputKeyword').focus();
    });
    
    $('#wizardPanel .searchKeyword').click(function(){
        $('.addKeyword').show();
        $('.inputKeyword').hide();
    });
    
    /*shift多选*/
    var lastChecked = null;
    $('table tr .check :checkbox').live('click', function(){
        if ($(this).prop('checked')) {
        
            $(this).parents('tr').addClass('selected');
            
            if (!lastChecked) {
                lastChecked = $(this);
                return;
            }
            
            if (event.shiftKey) {
                var $chkbox = $('table tr .check :checkbox');
                var end = $chkbox.index($(this));
                var start = $chkbox.index(lastChecked);
                
                $chkbox.slice(Math.min(start, end), Math.max(start, end)).prop('checked', true).parents('tr').addClass('selected');
            }
            
            lastChecked = $(this);
        }
        else {
            $(this).parents('tr').removeClass('selected');
        }
    });
    
    /*全选*/
    $('.checkboxOp :checkbox').click(function(e){
        e.stopPropagation();
        
        hideDropdownList();
        
        if ($(this).prop('checked')) {
            $('table tr .check :checkbox').prop('checked', true).parents('tr').addClass('selected');
        }
        else {
            $('table tr .check :checkbox').prop('checked', false).parents('tr').removeClass('selected');
        }
    });
    
    /*顶部下拉菜单*/
    $('.top .dropdownHandle').click(function(e){
        e.stopPropagation();
        
        showDropdownList($(this));
    });
    
    /*底部下拉菜单*/
    $('.bottom .dropdownHandle').click(function(e){
        e.stopPropagation();
        
        showDropdownList($(this), 'top');
    });
    
    /*翻页*/
    /*
     $('.prev').die().live('click', function(){
     if (!$(this).hasClass('prevPageDisable')) {
     window.location.href = '#/' + (new Number(pageNumber) - 1);
     }
     return false;
     });
     
     $('.next').die().live('click', function(){
     if (!$(this).hasClass('nextPageDisable')) {
     window.location.href = '#/' + (new Number(pageNumber) + 1);
     }
     return false;
     });
     */
    /*关注*/
    $('.followHandle').die().live('click', function(){
        candidateFollow(checkItem(), function(data){
            refreshCandidates(date);
        });
    });
    
    /*取消关注*/
    $('.unfollowHandle').die().live('click', function(){
        candidateUnfollow(checkItem(), function(data){
            refreshCandidates(date);
        });
    });
    
    /*托管*/
    $('.manageHandle').die().live('click', function(){
        candidateManage(checkItem(), function(data){
            refreshCandidates(date);
        });
    });
    
    /*取消托管*/
    $('.unmanageHandle').die().live('click', function(){
        candidateUnmanage(checkItem(), function(data){
            refreshCandidates(date);
        });
    });
    
    /*不当人选*/
    $('.badHandle').die().live('click', function(){
        candidateBad(checkItem(), function(data){
            refreshCandidates(date);
        });
    });
    
    /*
     $('.secondary .tag').die().live({
     mouseenter: function(){
     $(this).children('.level').stop().animate({
     left: 100
     });
     },
     mouseleave: function(){
     $(this).children('.level').stop().animate({
     left: 73
     });
     }
     });
     */
    $('.mainFilter ul li a').click(function(){
        $(this).parents('ul').find('a').removeClass('selected');
        $(this).addClass('selected');
        var s = new String($(this).attr('id'));
        pageHandle = s.replace('Handle', '');
        filterSwitch(pageHandle);
        refreshCandidates(date);
        return false;
    });
    
    
    $('.mainContent table tr').live({
        mouseenter: function(){
            $(this).find('.comment').removeClass('hide');
        },
        mouseleave: function(){
            if (!$(this).next().hasClass('commentTr')) {
                $(this).find('.comment').addClass('hide');
            }
        }
    });
    
    $('.comment').live('click', function(){
        var $tr = $(this).parents('tr');
        if ($tr.next().find('.commentPanel').length > 0) {
            $tr.next().remove();
            $tr.removeClass('noBottom');
            $(this).html('评论&darr;');
        }
        else {
            var h = $('.commentPanel').html();
            $tr.addClass('noBottom');
            /*
             if ($tr.hasClass('unread')) {
             $tr.after('<tr class="commentTr unread"><td></td><td></td><td colspan="2"><div class="commentPanel">' + h + '</div></td><td></td></tr>');
             
             }
             else {
             $tr.after('<tr class="commentTr"><td></td><td></td><td colspan="2"><div class="commentPanel">' + h + '</div></td><td></td></tr>');
             }
             */
            if ($tr.hasClass('unread')) {
                $tr.after('<tr class="commentTr unread"><td colspan="4"><div class="commentPanel">' + h + '</div></td></tr>');
            }
            else {
                $tr.after('<tr class="commentTr"><td colspan="4"><div class="commentPanel">' + h + '</div></td></tr>');
            }
            var id = $tr.children('.check').children('input').attr('id');
            var $commentPanel = $tr.next().find('.commentPanel');
            $commentPanel.find(':checkbox').attr('id', 'isForward' + '_' + id);
            $commentPanel.find('label').attr('for', 'isForward' + '_' + id);
            $commentPanel.show();
            $commentPanel.find('.commentInput').focus();
            $(this).html('评论&uarr;');
        }
        return false;
    });
    
    $('.commentPanel .dropdownHandle').live('click', function(e){
        e.stopPropagation();
        showDropdownList($(this), 'bottom');
    });
    
    $('.commentPanel .commentSubmit').live('click', function(){
        var candidateID = $(this).parents('tr').prev().children('.check').find('input').attr('id');
        var text = $(this).parents('td').find('.commentInput').val();
        var $commentPanel = $(this).parents('.commentPanel');
        var $tag = $(this).parents('tr').prev().find('td').eq(2);
        var isForward = $(this).siblings(':checkbox').prop('checked');
        var retweet = (isForward ? 1 : 0);
        candidateComment('["' + candidateID + '"]', text, retweet, function(data){
            $commentPanel.remove();
            $tag.find('a.comment').remove();
            $('<span class="tags reviewed" title="' + text + '"></span>').appendTo($tag);
            bindCommentTip();
            refreshCandidates(date);
        });
        return false;
    });
    
    $(".datepicker").datepicker({
        closeText: '关闭',
        prevText: '&#x3c;上月',
        nextText: '下月&#x3e;',
        currentText: '今天',
        monthNames: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
        monthNamesShort: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
        dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
        weekHeader: '周',
        dateFormat: 'yy年mm月dd日',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: '年',
        showButtonPanel: true,
        maxDate: '+0d',
        onSelect: function(dateText, inst){
            var d = $.datepicker.parseDate('yy年mm月dd日', dateText);
            window.location.href = "#/" + $.datepicker.formatDate('yy-mm-dd', d);
        }
    });
    
    var today = new Date();
    
    $('.prev').die().live('click', function(){
        var a = $.datepicker.parseDate('yy年mm月dd日', $('.datepicker').val()) - new Date();
        a = Math.ceil(a / (1000 * 60 * 60 * 24)) - 1;
        if (a == 0) {
            $(".datepicker").datepicker("setDate", "+0d");
        }
        else {
        
            $(".datepicker").datepicker("setDate", a);
        }
        
        var d = $(".datepicker").datepicker("getDate");
        
        window.location.href = "#/" + $.datepicker.formatDate('yy-mm-dd', d);
        
        return false;
    });
    
    $('.next').die().live('click', function(){
        var a = $.datepicker.parseDate('yy年mm月dd日', $('.datepicker').val()) - new Date();
        a = Math.ceil(a / (1000 * 60 * 60 * 24)) + 1;
        if (a == 0) {
            $(".datepicker").datepicker("setDate", "+0d");
        }
        else {
        
            $(".datepicker").datepicker("setDate", a);
        }
        
        var d = $(".datepicker").datepicker("getDate");
        
        window.location.href = "#/" + $.datepicker.formatDate('yy-mm-dd', d);
        
        return false;
    });
    
    /*
     $('.tag').each(function(i){
     setTimeout(function(){
     $('.tag:eq(' + i + ')').css({
     display: 'block',
     opacity: 0
     }).stop().animate({
     opacity: 1
     });
     }, 250 * (i + 1))
     });
     */
    /*序列化地址栏变量*/
    var serialize = function(obj, re){
        var result = [];
        $.each(obj, function(i, val){
            if ((re && re.test(i)) || !re) 
                result.push(i + ': ' +
                (typeof val == 'object' ? val.join ? '\'' + val.join(', ') + '\'' : serialize(val) : '\'' + val + '\''));
        });
        return '{' + result.join(', ') + '}';
    };
    
    /*派发地址栏获取事件*/
    $.address.init().change(function(){
        date = $.address.pathNames()[0] ? $.address.pathNames()[0] : '';
        
        $('.checkboxOp :checkbox').prop('checked', false);
        
        if (date == '') {
            $(".datepicker").datepicker("setDate", "+0d");
        }
        else {
            var d = $.datepicker.parseDate('yy-mm-dd', date);
            $(".datepicker").datepicker("setDate", d);
        }
        
        $('.logo').focus();
        
        /*载入相关分页*/
        loadPage(date);
    });
    
});

function loadPage(_date){
    pagePool(_date, filter, function(data){
    
        keywordsRenderer(data.keywords, function(data){
            $('.secondary .searchKeyword').html(data);
        });
        candidatesRenderer(data.candidates, function(data){
            $('.mainContent').html(data);
            bindCommentTip();
            weiboCard();
        });
        
        pageButton(_date);
        
        /*
         pageButton(data.candidate_page);
         */
        /*
         pageInfo(data.candidate_page, function(data){
         $('.itemNum').html(data);
         });
         */
        tipRenderer(data.daily);
        
        bindTip();
        
        showWizard(data.keywords);
    });
}

function showWizard(obj){
    if (obj.length == 0) {
        $.blockUI({
            message: $('#wizardPanel'),
            css: {
                top: ($(window).height() - 503) / 2 + 'px',
                left: ($(window).width() - 799) / 2 + 'px',
                border: 'none',
                width: '799px',
                cursor: 'auto',
                backgroundColor: 'transparent'
            },
            overlayCSS: {
                backgroundColor: '#ffffff',
                opacity: 0.7,
                cursor: 'no-drop'
            },
            focusInput: false
        });
        
        $('#wizardPanel .normalTip').show();
    }
}

function refreshCandidates(_date){
    pagePool(_date, filter, function(data){
        candidatesRenderer(data.candidates, function(data){
            $('.mainContent').html(data);
            bindCommentTip();
            weiboCard();
        });
        
        tipRenderer(data.daily);
        
        pageButton(_date);
        
        /*
         pageButton(data.candidate_page);
         */
        /*
         pageInfo(data.candidate_page, function(data){
         $('.itemNum').html(data);
         });
         */
        $('.checkboxOp :checkbox').prop('checked', false);
    });
}

function refreshKeywords(){
    pagePool('', filter, function(data){
        keywordsRenderer(data.keywords, function(data){
            $('.secondary .searchKeyword').html(data);
        });
        bindTip();
    });
}

function filterSwitch(_filter){
    switch (_filter) {
        case 'index':
            filter = '';
            noResult = '暂时没有找到符合条件的人选。';
            break;
        case 'follow':
            filter = '?following__exact=1';
            noResult = '没有找到已关注的人。'
            break;
        case 'followBack':
            filter = '?followed_back__exact=1';
            noResult = '没有找到我的粉丝。'
            break;
        case 'followMutual':
            filter = '?following__exact=1&followed_back__exact=1';
            noResult = '没有找到与我互相关注的人。'
            break;
        case 'manage':
            filter = '?managed__exact=1';
            noResult = '没有找到属于托管的人。'
            break;
        case 'unmanage':
            filter = '?managed__exact=0';
            noResult = '没有找到不属于托管的人。'
            break;
    }
}

function keywordsRenderer(obj, callback){
    if (obj) {
        var h = '';
        $.each(obj, function(entryIndex, entry){
            h += '<li class="tag" title="' + entry['value'] + '">';
            h += '<span class="label">' + cutString(entry['value'], 10) + '</span>';
            h += '<span class="level">' + '高' + '</span>';
            h += '<br class="clear"/>';
            h += '</li>';
        });
        var html = '<h3>' + '正在努力寻找关于' + '</h3>';
        html += '<ul class="tagsList">';
        html += h;
        html += '</ul>';
        html += '<a href="#" class="updateKeywordHandle">修改话题</a>';
        callback(html);
    }
}

function keywordsPopupRenderer(obj, callback){
    if (obj) {
        var h = '';
        $.each(obj, function(entryIndex, entry){
            h += '<li class="tag" title="' + entry['value'] + '">';
            h += '<span class="label" value="' + entry['value'] + '">' + cutString(entry['value'], 10) + '</span>';
            h += '<span class="deleteButton">' + '</span>';
            h += '</li>';
        });
        callback(h);
    }
}

function candidatesRenderer(obj, callback){
    if (obj != '') {
        var h = '';
        $.each(obj, function(entryIndex, entry){
            h += entry['managed'] == null ? '<tr class="unread">' : '<tr>';
            h += '<td class="check">' + '<input id="' + entry['id'] + '" type="checkbox">' + '</td>';
            //h += '<td class="name" ' + 'wb_screen_name=' + entry['name'] + '>' + entry['name'] + '</td>';
            h += '<td class="name">' + '<span ' + 'wb_screen_name=' + entry['name'] + '>' + entry['name'] + '</span>' + '</td>';
            h += '<td>';
            if (entry['following'] && entry['followed_back']) {
                h += '<span class="tags followBothway">' + '</span>';
            }
            else 
                if (entry['following']) {
                    h += '<span class="tags follow">' + '</span>';
                }
                else 
                    if (entry['followed_back']) {
                        h += '<span class="tags followBack">' + '</span>';
                    }
                    else {
                        h += '<span class="tags followBack hide">' + '</span>';
                    }
            
            if (entry['commented']) {
                h += '<span class="tags reviewed" title="' + entry['commenttext'] + '"></span>';
            }
            else {
                h += '<a class="comment hide" href="#">' + '评论&darr;' + '</a>';
            }
            /*
             if (entry['managed'] == null) {
             h += '<span>' + '</span>';
             }
             else
             if (entry['managed']) {
             h += '<span class="tags mandatory">' + '</span>';
             }
             else {
             h += '<span class="tags freedom">' + '</span>';
             }
             */
            h += '</td>';
            h += '<td class="text">';
            h += entry['text'] ? entry['text'] : "";
            h += '</td>';
            h += '</tr>';
        });
        var html = '<table>';
        html += '<colgroup><col class="checkbox" /><col class="nickname" /><col class="tag" /><col class="summary" /></colgroup>';
        html += h;
        html += '</table>';
        callback(html);
    }
    else {
        callback('<span class="noResult">' + noResult + '（＞﹏＜）' + '</span>');
    }
}

function pageButton(_date){
    var a = $.datepicker.parseDate('yy-mm-dd', _date) - new Date();
    a = Math.ceil(a / (1000 * 60 * 60 * 24));
    if (a != 0 && _date != '') {
        $('.next').removeClass('nextPageDisable').addClass('nextPage');
    }
    else {
        $('.next').removeClass('nextPage').addClass('nextPageDisable');
    }
}

function pageInfo(obj, callback){
    if (obj) {
        if (obj.count != 0) {
            var first = (obj.page - 1) * (obj.perpage) + 1;
            
            if (obj.has_next) {
                var last = obj.page * obj.perpage;
            }
            else {
                var last = obj.count;
            }
            callback('第' + first + '-' + last + '条，' + '共' + obj.count + '条');
        }
        else {
            callback('共' + obj.count + '条');
        }
    }
}

function checkItem(){
    var obj = [];
    $('table :checkbox').each(function(){
        if ($(this).prop('checked')) {
            obj.push('"' + $(this).attr('id') + '"');
        }
    });
    
    var candidates = '[' + obj.join() + ']';
    return candidates;
}

function weiboCard(){
    WB.core.load(['connect', 'client', 'widget.base', 'widget.atWhere'], function(){
        var cfg = {
            key: '1286397181',
            xdpath: 'http://www.tingwo.cc/xd.html'
        };
        WB.connect.init(cfg);
        WB.client.init(cfg);
        
        $('.name span').each(function(index){
            WB.widget.atWhere.blogAt($(this).get(0));
        });
    });
}

function numberToZero(obj, number, callback){
    if (number != 10) {
        var $n = $('<span class="no' + number + '"></span>');
        var y = $n.appendTo('body').hide().css('background-position-y');
        obj.animate({
            'background-position-y': y
        }, 'def', function(){
            $n.remove();
            obj.removeClass().addClass('number').addClass('no' + number).attr('value', number);
            if (callback) {
                callback();
            }
        });
    }
    else {
        var $n = $('<span class="no' + 9 + '"></span>');
        var y = $n.appendTo('body').hide().css('background-position-y');
        obj.animate({
            'background-position-y': y
        }, 'slow', function(){
            $n.remove();
            obj.removeClass().addClass('number').addClass('no' + number).attr('value', number);
            obj.css('background-position-y', 0);
            if (callback) {
                callback();
            }
        });
    }
}

function numberBoardAnimate(obj, number, callback){
    var $number = obj;
    var bit = Math.floor(number % 10);
    var ten = Math.floor((number / 10) % 10);
    var hundred = Math.floor(number / 100);
    
    var nowBit = new Number($number.eq(2).attr('value'));
    var nowTen = new Number($number.eq(1).attr('value'));
    var nowHundred = new Number($number.eq(0).attr('value'));
    
    var f = function(){
        if (ten - nowTen > 0) {
            if (nowTen < ten) {
                numberToZero($number.eq(2), 10, function(){
                    numberToZero($number.eq(1), nowTen + 1, function(){
                        nowTen++;
                        f();
                    });
                });
            }
            else {
                numberToZero($number.eq(2), bit, function(){
                    callback();
                });
            }
            
        }
        else {
            numberToZero($number.eq(2), bit, function(){
                callback();
            });
        }
    }
    f();
}

function tipRenderer(obj){
    found = obj.found;
    var followed = obj.followed;
    var dailyFound = found + followed;
    if (found > 0) {
        var bit = Math.floor(followed % 10);
        var ten = Math.floor((followed / 10) % 10);
        
        var dailyBit = Math.floor(dailyFound % 10);
        var dailyTen = Math.floor((dailyFound / 10) % 10);
        
        $('.tipLabel .highlight').html(found);
        
        $('.count .followNumber span').eq(1).removeClass().addClass('number').addClass('no' + ten).attr('value', ten);
        $('.count .followNumber span').eq(2).removeClass().addClass('number').addClass('no' + bit).attr('value', bit);
        
        $('.count .foundDailyNumber span').eq(1).removeClass().addClass('number').addClass('no' + dailyTen).attr('value', dailyTen);
        $('.count .foundDailyNumber span').eq(2).removeClass().addClass('number').addClass('no' + dailyBit).attr('value', dailyBit);
        
        $('.tip').slideDown('def');
    }
    else {
        $('.tip').slideUp('def');
    }
}

function bindTip(){
    $('.tag').tipTip({
        defaultPosition: 'top'
    });
}

function bindCommentTip(){
    $('.reviewed').tipTip({
        defaultPosition: 'top'
    });
}

function pollingFollowed(callback){
    var f = function(){
        pagePool('', filter, function(data){
            console.log(data.daily.found);
            numberBoardAnimate($('.count .followNumber span'), data.daily.followed, function(){
                if (data.daily.found != 0) {
                    setTimeout(function(){
                        f();
                    }, 5000);
                }
                else 
                    if ($('.error') != []) {
                        callback();
                    }
                    else {
                        callback();
                    }
            });
        });
    }
    
    setTimeout(function(){
        f();
    }, 2000);
}

function bindCommentButton(obj){
    obj.live({
        mouseenter: function(){
            $(this).find('.comment').removeClass('hide');
        },
        mouseleave: function(){
            $(this).find('.comment').addClass('hide');
        }
    });
}
