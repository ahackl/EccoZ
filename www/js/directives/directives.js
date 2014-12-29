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



