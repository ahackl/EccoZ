/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_control.controller('EnergyMetersCtrl', ['$scope', '$rootScope', '$state', '$translate',
    '$interval', '$ionicPopup', 'eccozDB', '$ionicListDelegate','$filter',
    function ($scope, $rootScope, $state, $translate,
              $interval, $ionicPopup, eccozDB,$ionicListDelegate, $filter) {

        $scope.dataset =[
            [{"inputDateTime":"2011-09-25_21:06:00","readingValue":1}],
            [{"inputDateTime":"2011-09-25_21:06:00","readingValue":2}] ];


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
            size: {
                height: 100
            },
            legend: {
                show: false
            }
        };



        // update the state
        // ------------------------------------------------------------------------
        var myListener = $rootScope.$on('EnergyMetersCtrl_updated', function (event) {
            event.stopPropagation();
            getAllRows();
        });
        $scope.$on('$destroy', myListener);
        // ------------------------------------------------------------------------

        $scope.data = {
            showDelete: false,          // Toggle icon on/off
            showEdit: true,             // Toggle icon on/off
            noMoreItemsAvailable: true, // Toggle scroll log
            limitRows: 10,              // Number of rows in the UI
            ListOfElements: [],         // The list of the elements
            tableType: 'EnergyMeter'    // Name of the table
        };


        for (var i=0; i< 2* $scope.data.limitRows; i++){
            $scope.dataset[i] = [{"inputDateTime":"2011-09-25_21:06:00","readingValue":1}];
        }



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
            size: {
                height: 100
            },
            legend: {
                show: false
            }
        };


        getAllRows();


        // the functions
        // -------------
        function getChartValues(myMeterId, index) {
            var promiseGetAll = eccozDB.getAllMeterReadings(myMeterId, 20, '', '', true);
            promiseGetAll.then(
                // resolve - Handler
                function (reason) {
                    var plotData = [];
                    var listOfData = reason;
                    for (var i = listOfData.length - 1; i >= 0; i--) {
                        var dateInPlotFormat = $filter('date')(new Date(listOfData[i].doc.inputDateTime),
                            'yyyy-MM-dd_HH:mm:ss');
                        plotData.push(
                            { 'inputDateTime': dateInPlotFormat,
                                'readingValue': listOfData[i].doc.readingValue}
                        );
                    }
                    //console.log(plotData);
                    $scope.dataset[index] = plotData;
                },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                }
            );
        }




        function getAllRows() {
            var promiseGetAll = eccozDB.getAll($scope.data.tableType, '', $scope.data.limitRows, '');
            promiseGetAll.then(
                // resolve - Handler
                function (reason) {
                    $scope.data.ListOfElements = reason;
                    if (reason.length == $scope.data.limitRows) {
                        $scope.data.noMoreItemsAvailable = false;
                    }
                    for (var i = 0; i < reason.length; i++) {
                        getChartValues(reason[i].doc._id, i);
                    }
                },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                }
            );
        }

        $scope.fetchMoreLines = function () {
            var LastElement = $scope.data.ListOfElements[$scope.data.ListOfElements.length - 1];
            var promiseGetMore = eccozDB.getAll($scope.data.tableType, '', $scope.data.limitRows, LastElement);
            promiseGetMore.then(
                // resolve - Handler
                function (reason) {
                    $scope.data.ListOfElements = $scope.data.ListOfElements.concat(reason);
                    if (reason.length == 0) {
                        $scope.data.noMoreItemsAvailable = true;
                    }
                    for (var i = 0; i < reason.length; i++) {
                        getChartValues(reason[i].doc._id, i);
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            );
        };


        $scope.onItemEdit = function (indexId) {
            $ionicListDelegate.closeOptionButtons();
            var ElementId = $scope.data.ListOfElements[indexId].id;
            $state.go('app.meter-detail', { meterId: ElementId });
        };

        $scope.onItemNew = function () {
            $state.go('app.meter-detail');
        };

        $scope.onItemDelete = function (indexId) {
            var confirmPopup = $ionicPopup.confirm({
                title: $translate.instant('M_ALERT'),
                template: $translate.instant('M_DELETE_METER')
            });
            confirmPopup.then(function (res) {
                $ionicListDelegate.closeOptionButtons();
                // The 'ok' button is pressed
                if (res) {
                    var promiseDelete = eccozDB.deleteOne($scope.data.ListOfElements[indexId]);
                    promiseDelete.then(
                        // resolve - Handler
                        function (reason) {
                            console.log(reason);
                            $scope.data.ListOfElements.splice(indexId, 1);
                        },
                        // reject - Handler
                        function (reason) {
                            console.log(reason);
                        }
                    )
                }
            });


        };

    }]);