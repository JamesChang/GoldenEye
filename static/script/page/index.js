var date="";var filter="";var noResult="没有找到符合条件的人选。";var found;$(document).ready(function(){$(".updateKeywordHandle").die().live("click",function(){pagePool("",filter,function(d){keywordsPopupRenderer(d.keywords,function(e){$("#updateKeywordPanel .searchKeyword .tagsList").html(e)});bindTip()});$.blockUI({message:$("#updateKeywordPanel"),css:{top:($(window).height()-503)/2+"px",left:($(window).width()-799)/2+"px",border:"none",width:"799px",cursor:"auto",backgroundColor:"transparent"},overlayCSS:{backgroundColor:"#ffffff",opacity:0.7,cursor:"no-drop"},focusInput:false});$("#updateKeywordPanel .okButton").die().live("click",function(){var g=$("#updateKeywordPanel .inputKeyword");if($("#updateKeywordPanel .tagsList li").length==0&&!g.val()){$(".errorTip").show();return false}if(g.val()){var d="<li class='tag'>";d+="<span class='label' value='"+g.val()+"'>"+g.val()+"</span>";d+="<span class='deleteButton'></span>";d+="</li>";g.siblings(".tagsList").append(d)}g.val("").hide();$(".addKeyword").show();var f=[];$("#updateKeywordPanel .searchKeyword .tagsList li").each(function(){var h=$(this).children(".label").attr("value");f.push('"'+h+'"')});var e="["+f.join()+"]";keywordUpdate(e,function(){refreshKeywords();$.unblockUI()});return false});$(".cancelButton").click(function(){$.unblockUI();return false});return false});$("#wizardPanel .page1 .okButton").die().live("click",function(){$(".sliderBox").scrollTo(".page2",500);return false});$("#wizardPanel .page2 .okButton").die().live("click",function(){var g=$("#wizardPanel .inputKeyword");if($("#wizardPanel .tagsList li").length==0&&!g.val()){$(".errorTip").show();return false}if(g.val()){var d="<li class='tag'>";d+="<span class='label' value='"+g.val()+"'>"+g.val()+"</span>";d+="<span class='deleteButton'></span>";d+="</li>";g.siblings(".tagsList").append(d);g.val("")}var f=[];$("#wizardPanel .page2 .searchKeyword .tagsList li").each(function(){var h=$(this).children(".label").attr("value");f.push('"'+h+'"')});var e="["+f.join()+"]";keywordUpdate(e,function(){refreshKeywords();$(".mainContent").html('<span class="noResult">已添加了话题。别急，让我先找会儿。（＞﹏＜）</span>');$.unblockUI()});return false});$(".followAll").die().live("click",function(){$(this).addClass("disable").html("增加关注中...").removeAttr("href").removeClass("followAll");candidateDailyFollow(function(){});pollingFollowed(function(){$(".tip").slideUp("def",function(){showSuccessTip("已成功关注了 "+found+" 人")})});return false});$(".addKeyword").click(function(){$(".errorTip,.normalTip").hide();$(this).siblings(".tagsList").children("li:last-child").children(".label").removeClass("selected");$(this).hide().siblings("input").show().css("width","120px").focus();return false});$(".inputKeyword").keydown(function(f){if($.browser.webkit){if(f.keyCode==13&&$(this).val()){var d="<li class='tag' title='"+$(this).val()+"'>";d+="<span class='label' value='"+$(this).val()+"'>"+cutString($(this).val(),10)+"</span>";d+="<span class='deleteButton'></span>";d+="</li>";$(this).siblings(".tagsList").append(d);$(this).val("");bindTip();return false}else{if(f.keyCode==8&&!$(this).val()){$last=$(this).siblings(".tagsList").children("li:last-child");if(!$last.children(".label").hasClass("selected")){$(".addKeyword").show();$(this).hide();$last.children(".label").addClass("selected");return false}else{$last.remove();$(".addKeyword").hide();$(this).show().focus();return false}}}}else{if(f.keyCode==13&&$(this).val()){var d="<li class='tag' title='"+$(this).val()+"'>";d+="<span class='label' value='"+$(this).val()+"'>"+cutString($(this).val(),10)+"</span>";d+="<span class='deleteButton'></span>";d+="</li>";$(this).siblings(".tagsList").append(d);$(this).val("");bindTip();return false}else{if(f.keyCode==8&&!$(this).val()){$(this).siblings(".tagsList").children("li:last-child").remove();return false}}}});$(".deleteButton").live("click",function(){$(this).parent(".tag").remove();$("#tiptip_holder").hide();$(".inputKeyword").focus()});$("#wizardPanel .searchKeyword").click(function(){$(".addKeyword").show();$(".inputKeyword").hide()});var a=null;$("table tr .check :checkbox").live("click",function(){if($(this).prop("checked")){$(this).parents("tr").addClass("selected");if(!a){a=$(this);return}if(event.shiftKey){var e=$("table tr .check :checkbox");var d=e.index($(this));var f=e.index(a);e.slice(Math.min(f,d),Math.max(f,d)).prop("checked",true).parents("tr").addClass("selected")}a=$(this)}else{$(this).parents("tr").removeClass("selected")}});$(".checkboxOp :checkbox").click(function(d){d.stopPropagation();hideDropdownList();if($(this).prop("checked")){$("table tr .check :checkbox").prop("checked",true).parents("tr").addClass("selected")}else{$("table tr .check :checkbox").prop("checked",false).parents("tr").removeClass("selected")}});$(".top .dropdownHandle").click(function(d){d.stopPropagation();showDropdownList($(this))});$(".bottom .dropdownHandle").click(function(d){d.stopPropagation();showDropdownList($(this),"top")});$(".followHandle").die().live("click",function(){candidateFollow(checkItem(),function(d){refreshCandidates(date)})});$(".unfollowHandle").die().live("click",function(){candidateUnfollow(checkItem(),function(d){refreshCandidates(date)})});$(".manageHandle").die().live("click",function(){candidateManage(checkItem(),function(d){refreshCandidates(date)})});$(".unmanageHandle").die().live("click",function(){candidateUnmanage(checkItem(),function(d){refreshCandidates(date)})});$(".badHandle").die().live("click",function(){candidateBad(checkItem(),function(d){refreshCandidates(date)})});$(".mainFilter ul li a").click(function(){$(this).parents("ul").find("a").removeClass("selected");$(this).addClass("selected");var d=new String($(this).attr("id"));pageHandle=d.replace("Handle","");filterSwitch(pageHandle);refreshCandidates(date);return false});$(".mainContent table tr").live({mouseenter:function(){$(this).find(".comment").removeClass("hide")},mouseleave:function(){if(!$(this).next().hasClass("commentTr")){$(this).find(".comment").addClass("hide")}}});$(".comment").live("click",function(){var f=$(this).parents("tr");if(f.next().find(".commentPanel").length>0){f.next().remove();f.removeClass("noBottom");$(this).html("评论&darr;")}else{var e=$(".commentPanel").html();f.addClass("noBottom");if(f.hasClass("unread")){f.after('<tr class="commentTr unread"><td colspan="4"><div class="commentPanel">'+e+"</div></td></tr>")}else{f.after('<tr class="commentTr"><td colspan="4"><div class="commentPanel">'+e+"</div></td></tr>")}var g=f.children(".check").children("input").attr("id");var d=f.next().find(".commentPanel");d.find(":checkbox").attr("id","isForward_"+g);d.find("label").attr("for","isForward_"+g);d.show();d.find(".commentInput").focus();$(this).html("评论&uarr;")}return false});$(".commentPanel .dropdownHandle").live("click",function(d){d.stopPropagation();showDropdownList($(this),"bottom")});$(".commentPanel .commentSubmit").live("click",function(){var g=$(this).parents("td").siblings(".check").find("input").attr("id");var i=$(this).parents("td").find(".commentInput").val();var e=$(this).parents(".commentPanel");var f=$(this).parents("tr").find("td").eq(2);var h=$(this).siblings(":checkbox").prop("checked");var d=(h?1:0);candidateComment('["'+g+'"]',i,d,function(j){e.remove();f.find("a.comment").remove();$('<span class="tags reviewed" title="'+i+'"></span>').appendTo(f);bindCommentTip()});return false});$(".datepicker").datepicker({closeText:"关闭",prevText:"&#x3c;上月",nextText:"下月&#x3e;",currentText:"今天",monthNames:["01月","02月","03月","04月","05月","06月","07月","08月","09月","10月","11月","12月"],monthNamesShort:["一","二","三","四","五","六","七","八","九","十","十一","十二"],dayNames:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],dayNamesShort:["周日","周一","周二","周三","周四","周五","周六"],dayNamesMin:["日","一","二","三","四","五","六"],weekHeader:"周",dateFormat:"yy年mm月dd日",firstDay:1,isRTL:false,showMonthAfterYear:true,yearSuffix:"年",showButtonPanel:true,maxDate:"+0d",onSelect:function(f,e){var g=$.datepicker.parseDate("yy年mm月dd日",f);window.location.href="#/"+$.datepicker.formatDate("yy-mm-dd",g)}});var b=new Date();$(".prev").die().live("click",function(){var e=$.datepicker.parseDate("yy年mm月dd日",$(".datepicker").val())-new Date();e=Math.ceil(e/(1000*60*60*24))-1;if(e==0){$(".datepicker").datepicker("setDate","+0d")}else{$(".datepicker").datepicker("setDate",e)}var f=$(".datepicker").datepicker("getDate");window.location.href="#/"+$.datepicker.formatDate("yy-mm-dd",f);return false});$(".next").die().live("click",function(){var e=$.datepicker.parseDate("yy年mm月dd日",$(".datepicker").val())-new Date();e=Math.ceil(e/(1000*60*60*24))+1;if(e==0){$(".datepicker").datepicker("setDate","+0d")}else{$(".datepicker").datepicker("setDate",e)}var f=$(".datepicker").datepicker("getDate");window.location.href="#/"+$.datepicker.formatDate("yy-mm-dd",f);return false});var c=function(f,e){var d=[];$.each(f,function(g,h){if((e&&e.test(g))||!e){d.push(g+": "+(typeof h=="object"?h.join?"'"+h.join(", ")+"'":c(h):"'"+h+"'"))}});return"{"+d.join(", ")+"}"};$.address.init().change(function(){date=$.address.pathNames()[0]?$.address.pathNames()[0]:"";$(".checkboxOp :checkbox").prop("checked",false);if(date==""){$(".datepicker").datepicker("setDate","+0d")}else{var e=$.datepicker.parseDate("yy-mm-dd",date);$(".datepicker").datepicker("setDate",e)}$(".logo").focus();loadPage(date)})});function loadPage(a){pagePool(a,filter,function(b){keywordsRenderer(b.keywords,function(c){$(".secondary .searchKeyword").html(c)});candidatesRenderer(b.candidates,function(c){$(".mainContent").html(c);bindCommentTip();weiboCard()});pageButton(a);tipRenderer(b.daily);bindTip();showWizard(b.keywords)})}function showWizard(a){if(a.length==0){$.blockUI({message:$("#wizardPanel"),css:{top:($(window).height()-503)/2+"px",left:($(window).width()-799)/2+"px",border:"none",width:"799px",cursor:"auto",backgroundColor:"transparent"},overlayCSS:{backgroundColor:"#ffffff",opacity:0.7,cursor:"no-drop"},focusInput:false});$("#wizardPanel .normalTip").show()}}function refreshCandidates(a){pagePool(a,filter,function(b){candidatesRenderer(b.candidates,function(c){$(".mainContent").html(c);bindCommentTip();weiboCard()});pageButton(a);$(".checkboxOp :checkbox").prop("checked",false)})}function refreshKeywords(){pagePool("",filter,function(a){keywordsRenderer(a.keywords,function(b){$(".secondary .searchKeyword").html(b)});bindTip()})}function filterSwitch(a){switch(a){case"index":filter="";noResult="没有找到符合条件的人选。";break;case"follow":filter="?following__exact=1";noResult="没有找到已关注的人。";break;case"followBack":filter="?followed_back__exact=1";noResult="没有找到我的粉丝。";break;case"followMutual":filter="?following__exact=1&followed_back__exact=1";noResult="没有找到与我互相关注的人。";break;case"manage":filter="?managed__exact=1";noResult="没有找到属于托管的人。";break;case"unmanage":filter="?managed__exact=0";noResult="没有找到不属于托管的人。";break}}function keywordsRenderer(c,d){if(c){var b="";$.each(c,function(e,f){b+='<li class="tag" title="'+f.value+'">';b+='<span class="label">'+cutString(f.value,10)+"</span>";b+='<span class="level">高</span>';b+='<br class="clear"/>';b+="</li>"});var a="<h3>正在努力寻找关于</h3>";a+='<ul class="tagsList">';a+=b;a+="</ul>";a+='<a href="#" class="updateKeywordHandle">修改话题</a>';d(a)}}function keywordsPopupRenderer(b,c){if(b){var a="";$.each(b,function(d,e){a+='<li class="tag" title="'+e.value+'">';a+='<span class="label" value="'+e.value+'">'+cutString(e.value,10)+"</span>";a+='<span class="deleteButton"></span>';a+="</li>"});c(a)}}function candidatesRenderer(c,d){if(c!=""){var b="";$.each(c,function(e,f){b+=f.managed==null?'<tr class="unread">':"<tr>";b+='<td class="check"><input id="'+f.id+'" type="checkbox"></td>';b+='<td class="name"><span wb_screen_name='+f.name+">"+f.name+"</span></td>";b+="<td>";if(f.following&&f.followed_back){b+='<span class="tags followBothway"></span>'}else{if(f.following){b+='<span class="tags follow"></span>'}else{if(f.followed_back){b+='<span class="tags followBack"></span>'}else{b+='<span class="tags followBack hide"></span>'}}}if(f.commented){b+='<span class="tags reviewed" title="'+f.commenttext+'"></span>'}else{b+='<a class="comment hide" href="#">评论&darr;</a>'}b+="</td>";b+='<td class="text">';b+=f.text?f.text:"";b+="</td>";b+="</tr>"});var a="<table>";a+='<colgroup><col class="checkbox" /><col class="nickname" /><col class="tag" /><col class="summary" /></colgroup>';a+=b;a+="</table>";d(a)}else{d('<span class="noResult">'+noResult+"（＞﹏＜）</span>")}}function pageButton(c){var b=$.datepicker.parseDate("yy-mm-dd",c)-new Date();b=Math.ceil(b/(1000*60*60*24));if(b!=0&&c!=""){$(".next").removeClass("nextPageDisable").addClass("nextPage")}else{$(".next").removeClass("nextPage").addClass("nextPageDisable")}}function pageInfo(b,d){if(b){if(b.count!=0){var c=(b.page-1)*(b.perpage)+1;if(b.has_next){var a=b.page*b.perpage}else{var a=b.count}d("第"+c+"-"+a+"条，共"+b.count+"条")}else{d("共"+b.count+"条")}}}function checkItem(){var b=[];$("table :checkbox").each(function(){if($(this).prop("checked")){b.push('"'+$(this).attr("id")+'"')}});var a="["+b.join()+"]";return a}function weiboCard(){WB.core.load(["connect","client","widget.base","widget.atWhere"],function(){var a={key:"1286397181",xdpath:"http://www.tingwo.cc/xd.html"};WB.connect.init(a);WB.client.init(a);$(".name span").each(function(b){WB.widget.atWhere.blogAt($(this).get(0))})})}function numberToZero(c,b,e){if(b!=10){var a=$('<span class="no'+b+'"></span>');var d=a.appendTo("body").hide().css("background-position-y");c.animate({"background-position-y":d},"def",function(){a.remove();c.removeClass().addClass("number").addClass("no"+b).attr("value",b);if(e){e()}})}else{var a=$('<span class="no'+9+'"></span>');var d=a.appendTo("body").hide().css("background-position-y");c.animate({"background-position-y":d},"slow",function(){a.remove();c.removeClass().addClass("number").addClass("no"+b).attr("value",b);c.css("background-position-y",0);if(e){e()}})}}function numberBoardAnimate(d,b,j){var k=d;var h=Math.floor(b%10);var a=Math.floor((b/10)%10);var l=Math.floor(b/100);var i=new Number(k.eq(2).attr("value"));var c=new Number(k.eq(1).attr("value"));var e=new Number(k.eq(0).attr("value"));var g=function(){if(a-c>0){if(c<a){numberToZero(k.eq(2),10,function(){numberToZero(k.eq(1),c+1,function(){c++;g()})})}else{numberToZero(k.eq(2),h,function(){j()})}}else{numberToZero(k.eq(2),h,function(){j()})}};g()}function tipRenderer(e){found=e.found;var a=e.followed;var g=found+a;if(found>0){var f=Math.floor(a%10);var b=Math.floor((a/10)%10);var c=Math.floor(g%10);var d=Math.floor((g/10)%10);$(".tipLabel .highlight").html(found);$(".count .followNumber span").eq(1).removeClass().addClass("number").addClass("no"+b).attr("value",b);$(".count .followNumber span").eq(2).removeClass().addClass("number").addClass("no"+f).attr("value",f);$(".count .foundDailyNumber span").eq(1).removeClass().addClass("number").addClass("no"+d).attr("value",d);$(".count .foundDailyNumber span").eq(2).removeClass().addClass("number").addClass("no"+c).attr("value",c);$(".tip").slideDown("def")}}function bindTip(){$(".tag").tipTip({defaultPosition:"top"})}function bindCommentTip(){$(".reviewed").tipTip({defaultPosition:"top"})}function pollingFollowed(b){var a=function(){pagePool("",filter,function(c){console.log(c.daily.found);numberBoardAnimate($(".count .followNumber span"),c.daily.followed,function(){if(c.daily.found!=0){setTimeout(function(){a()},5000)}else{if($(".error")!=[]){b()}else{b()}}})})};setTimeout(function(){a()},2000)}function bindCommentButton(a){a.live({mouseenter:function(){$(this).find(".comment").removeClass("hide")},mouseleave:function(){$(this).find(".comment").addClass("hide")}})};