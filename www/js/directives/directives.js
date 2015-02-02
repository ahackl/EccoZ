/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_application.directive('myDate', function($filter) {
    return {
        require: 'ngModel',
        transclude: true,
        link: function(scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(function(data) {
                //convert data from view format to model format
                var newDate =  new Date(data).toJSON() ; //converted
                return newDate;
            });

            ngModelController.$formatters.push(function(data) {
                //convert data from model format to view format
                return $filter('date')(data, 'yyyy-MM-dd');
            });
        }
    }
});



_application.directive('myTime', function($filter) {
    return {
        require: 'ngModel',
        transclude: true,
        link: function(scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(function(data) {
                //convert data from view format to model format
                return data; //converted
            });

            ngModelController.$formatters.push(function(data) {
                //convert data from model format to view format
                var bla =  $filter('date')(data, 'HH:mm'); //converted
                return bla;
            });
        }
    }
});


_application.directive('selectMe', function($timeout) {
    return {
        link: function(scope, element, attrs) {

            $timeout(function() {
                element[0].select();
            });
        }
    };
});


_application.directive('eccozChart', ['$compile', function ($compile) {
    return {
        restrict: "E",
        replace: true,
        link: function(scope, element, attrs) {
               scope.$watch('chartState', function(newVal, oldVal) {
                   var height = element[0].offsetParent.clientHeight;
                   var width = element[0].offsetParent.clientWidth - 30;
                   if (newVal === 'on') {
                       if (scope.eChartDataset.length > attrs.chartindex) {
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
                                           type: 'area-spline'
                                       }
                                   ],
                                   xAxis: {
                                       key: 'inputDateTime',
                                       displayFormat: '%Y-%m',
                                       tickCount: 4
                                   },
                                   yAxis: {
                                       label: '',
                                       tickCount: 11
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

