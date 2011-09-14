$(document).ready(function(){
    $('.radioButton').click(function(){
        $(this).siblings('a').removeClass("radioButtonSelected");
        if ($(this).hasClass('radioButtonSelected')) {
            $(this).removeClass("radioButtonSelected");
        }
        else {
            $(this).addClass("radioButtonSelected");
        }
        return false;
    });
    
    $(document).click(function(e){
        /*
         if (!(e.target.nodeName == "INPUT")) {
         hideDropdownList();
         }
         */
        hideDropdownList();
    });
    
});

function showDropdownList(obj, position){
    if (!obj.hasClass('selected')) {
        hideDropdownList();
        var $dropdownList = obj.siblings('.dropdownList');
        var offset = obj.offset();
        if (!position || position == "bottom") {
            var top = offset.top + obj.height();
        }
        else 
            if (position == "top") {
                var top = offset.top - $dropdownList.height() - 4;
            }
        
        if (obj.outerWidth() < $dropdownList.outerWidth()) {
            var left = offset.left + obj.outerWidth() - ($dropdownList.outerWidth());
        }
        else {
            var left = offset.left;
        }
        obj.addClass('selected');
        $dropdownList.css('top', top).css('left', left).hide().slideDown(100);
    }
    else {
        hideDropdownList();
    }
}

function hideDropdownList(){
    $('.dropdownHandle').removeClass('selected');
    $('.dropdownList').css('left', '-999px');
}
