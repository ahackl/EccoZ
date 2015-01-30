/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */
_control.controller('ChartCtrl', ['$scope', '$rootScope','$filter',
    function ($scope, $rootScope, $filter) {

    // update the state
    // ------------------------------------------------------------------------
    var myListener = $rootScope.$on('ChartCtrl_updated', function (event) {
        event.stopPropagation();
        updateChart();
    });
    $scope.$on('$destroy', myListener);
    // ------------------------------------------------------------------------

    $scope.dataset =[ [{"inputDateTime":"2011-09-25_21:06:00","readingValue":79097}] ];

    $scope.schema = {
        inputDateTime: {
            type: 'datetime',
            format: '%Y-%m-%d_%H:%M:%S',
            name: 'Date'
        }
    };




    $scope.options = {
        rows: [
            {
                key: 'readingValue',
                type: 'area-spline'
            }
        ],
        xAxis: {
            key: 'inputDateTime',
            displayFormat: '%Y-%m-%d'
        },
        yAxis: {
            label: ''
        },
        legend: {
           show: false
        }
    };

    function updateChart() {
        var plotData = [];
        var listOfData = $scope.$parent.$parent.data.ListOfElements;
        for (var i = listOfData.length - 1; i >= 0; i--) {
            var dateInPlotFormat = $filter('date')(new Date(listOfData[i].doc.inputDateTime),
                'yyyy-MM-dd_HH:mm:ss');
            plotData.push(
                { 'inputDateTime': dateInPlotFormat,
                    'readingValue': listOfData[i].doc.readingValue}
            );
        }
        $scope.dataset = [plotData];

    }


}]);



