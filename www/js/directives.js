/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_application.directive('myDate', function ($filter) {
    return {
        require: 'ngModel',
        transclude: true,
        link: function (scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(function (data) {
                //convert data from view format to model format
                var newDate = new Date(data).toJSON(); //converted
                return newDate;
            });

            ngModelController.$formatters.push(function (data) {
                //convert data from model format to view format
                return $filter('date')(data, 'yyyy-MM-dd');
            });
        }
    }
});


_application.directive('myTime', function ($filter) {
    return {
        require: 'ngModel',
        transclude: true,
        link: function (scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(function (data) {
                //convert data from view format to model format
                return data; //converted
            });

            ngModelController.$formatters.push(function (data) {
                //convert data from model format to view format
                var bla = $filter('date')(data, 'HH:mm'); //converted
                return bla;
            });
        }
    }
});


_application.directive('selectMe', function ($timeout) {
    return {
        link: function (scope, element, attrs) {

            $timeout(function () {
                element[0].select();
            });
        }
    };
});


_application.directive('eccozChart', ['$compile', function ($compile) {
    return {
        restrict: "E",
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch('chartState', function (newVal, oldVal) {
                var height = 0;
                var width = 0;
                if (element && element.length > 0 && element[0].offsetParent && element[0].offsetParent.clientHeight) {
                    height = element[0].offsetParent.clientHeight;
                }
                if (element && element.length > 0 && element[0].offsetParent && element[0].offsetParent.clientWidth) {
                    width = element[0].offsetParent.clientWidth - 30;
                }
                if (newVal === 'on') {
                    if (scope.eChartDataset && scope.eChartDataset.length > attrs.chartindex) {
                        if (element.context.children.length == 0) {
                            scope.eChartSchema = {
                                inputDateTime: {
                                    type: 'datetime',
                                    format: '%Y-%m-%d_%H:%M:%S',
                                    name: 'Date'
                                }
                            };
                            scope.eChartOptions = {
                                rows: [
                                    {
                                        key: 'readingValue',
                                        type: 'area-step'
                                    }
                                ],
                                xAxis: {
                                    key: 'inputDateTime',
                                    displayFormat: function (d) {
                                        var now = new Date();
                                        // return the days from now.
                                        // 86400000 -> ms per day
                                        return Math.round(((now - d) / 86400000) * 10) / 10;
                                    },
                                    tickCount: 4,
                                    show: true
                                },
                                yAxis: {
                                    label: '',
                                    tickCount: 4,
                                    displayFormat: function (d) {
                                        return Math.round(d*10)/10;
                                    },
                                    show: true
                                },
                                size: {
                                    height: height,
                                    width: width
                                },
                                legend: {
                                    show: false
                                },
                                interaction: {
                                    enabled: false
                                },
                                //tooltip: {
                                //    show: false
                                //},
                                onmouseover: function (d) {
                                    var TrueIndex = scope.data.ListOfElements.length - d.index - 1;
                                    scope.SelectXindex = TrueIndex;
                                    //console.log("onmouseover", JSON.stringify(d));
                                    //console.log(JSON.stringify(scope.data.ListOfElements[TrueIndex]));
                                }

                            };
                            element.html('<angularchart dataset="eChartDataset[' + attrs.chartindex
                                + ']" schema="eChartSchema" options="eChartOptions"> </angularchart>');
                            $compile(element.contents())(scope);
                        }
                    }
                }
            });
        }

    };
}]);

