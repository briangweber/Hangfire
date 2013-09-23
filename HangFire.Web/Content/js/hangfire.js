﻿$(function() {
    $(document).on('click', '*[data-ajax]', function(e) {
        var $this = $(this);

        var loadingDelay = setTimeout(function() {
            $this.button('loading');
        }, 100);
        
        $.post($this.data('ajax'), function () {
            clearTimeout(loadingDelay);
            $this.button('reset');
            window.location.reload();
        });

        e.preventDefault();
    });
});

$(function () {
    (function () {
        var element = document.getElementById('realtime');
        if (!element) return;
        var graph = new Rickshaw.Graph({
            element: element,
            width: 800,
            height: 200,
            renderer: 'bar',
            interpolation: 'linear',

            series: new Rickshaw.Series.FixedDuration([
                    { name: 'failed', color: '#d9534f' },
                    { name: 'succeeded', color: '#5cb85c' }
                ],
                undefined,
                { timeInterval: 2000, maxDataPoints: 100 }
            )
        });

        var xAxis = new Rickshaw.Graph.Axis.Time({ graph: graph });
        var yAxis = new Rickshaw.Graph.Axis.Y({
            graph: graph,
            tickFormat: Rickshaw.Fixtures.Number.formatKMBT
        });

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: graph,
            yFormatter: function(y) { return Math.floor(y); }
        });

        graph.render();

        var timeInterval = 2000;
        var i = 0;
        var hangFire = {};

        $.getJSON($('#stats').data('refresh-url'), null, function(data) {
        });

        setInterval(function () {
            try {
                $.getJSON($('#stats').data('refresh-url'), null, function (data) {
                    var succeeded, failed;

                    for (var property in data) {
                        if (data.hasOwnProperty(property)) {
                            $('#stats-' + property).text(data[property]);
                        }
                    }

                    if (i !== 0) {
                        succeeded = data.succeeded - hangFire.succeeded;
                        failed = data.failed - hangFire.failed;

                        graph.series.addData({ failed: failed, succeeded: succeeded });
                        graph.render();
                    }

                    hangFire.succeeded = data.succeeded;
                    hangFire.failed = data.failed;

                    i++;
                });
            } catch(e) {
                console.log(e);
            } 
            
        }, timeInterval);
    })();

    (function () {
        var element = document.getElementById('history');
        if (!element) return;

        var createSeries = function (obj) {
            var series = [];
            for (var date in obj) {
                if (obj.hasOwnProperty(date)) {
                    var value = obj[date];
                    var point = { x: Date.parse(date) / 1000, y: value };
                    series.unshift(point);
                }
            }
            return series;
        };

        var succeeded = createSeries($(element).data("succeeded"));
        var failed = createSeries($(element).data("failed"));

        var graph = new Rickshaw.Graph({
            element: element,
            width: 800,
            height: 200,
            series: [
                {
                    color: '#d9534f',
                    data: failed,
                    name: 'Failed'
                }, {
                    color: '#5cb85c',
                    data: succeeded,
                    name: 'Succeeded'
                }
            ]
        });

        var xAxis = new Rickshaw.Graph.Axis.Time({ graph: graph });
        var yAxis = new Rickshaw.Graph.Axis.Y({
            graph: graph,
            tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            tickTreatment: 'glow'
        });

        graph.render();

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: graph,
            yFormatter: function(y) { return Math.floor(y); }
        });
    })();
});

$(function () {
    $('.failed-table').on('click', '.expand-exception', function () {
        $(this).closest('tr').next().toggle();
    });
});