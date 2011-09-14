$(document).ready(function(){
    $('<div class="header"></div>').load('module/header.html').prependTo('body');
    $('<div class="footer"></div>').load('module/footer.html').appendTo('body');
});
