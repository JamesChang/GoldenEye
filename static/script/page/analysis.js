$(document).ready(function(){
    pageAnalysisRenderer();
});

var followOptions = {
    chart: {
        renderTo: 'followNumberAnalysis',
        defaultSeriesType: 'line',
        marginBottom: 40
    },
    title: {
        text: '关注与粉丝人数统计'
    },
    xAxis: {
        categories: []
    },
    yAxis: {
        title: null,
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    },
    tooltip: {
        shared: true,
        crosshairs: true
    },
    legend: {
        y: -30
    },
    credits: {
        position: {
            align: 'right',
            x: -10,
            verticalAlign: 'bottom',
            y: -5
        },
        text: "Copyright 2011 听我说"
    },
    series: [{
        name: '关注'
    }, {
        name: '粉丝'
    }]
}

function pageAnalysisRenderer(){
    pageAnalysis(function(data){
        followNumberRenderer(data.follow_graph);
    });
}

function followNumberRenderer(obj){
    followOptions.series[0].data = obj.followed;
    followOptions.series[1].data = obj.followed_back;
    followOptions.xAxis.categories = obj.x_axis;
    var chart = new Highcharts.Chart(followOptions);
}




