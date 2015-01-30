/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_control.controller('MeterReadingsCtrl', ['$scope', '$rootScope', '$state', '$translate',
                                          '$ionicPopup', 'eccozDB','$ionicListDelegate','$filter',
    function ($scope, $rootScope, $state, $translate,
              $ionicPopup, eccozDB, $ionicListDelegate, $filter) {


        $scope.dataset = [
            {
                'inputDateTime': '2015-01-01_00:00:00',
                'readingValue': 1.0
            }
        ];


        $scope.schema = {
            inputDateTime: {
                type: 'datetime',
                format: '%Y-%m-%d_%H:%M:%S',
                name: 'Date'
            }
        };
        $scope.options = {
            rows: [{
                key: 'readingValue',
                type: 'line'
            }],
            xAxis: {
                key: 'inputDateTime',
                displayFormat: '%Y-%m-%d'
            }

        };






        // Manage the show/hide function for the diagram
        $scope.isChartShown = true;
        if ($scope.isChartShown == null) {
            $scope.isChartShown = false;
        };
        $scope.showChart = function () {
            $scope.isChartShown = !$scope.isChartShown;
        };

        // update the state
        // ------------------------------------------------------------------------
        var myListener = $rootScope.$on('MeterReadingsCtrl_updated', function (event) {
            event.stopPropagation();
            getAllRows();
        });
        $scope.$on('$destroy', myListener);
        // ------------------------------------------------------------------------

        var myMeterId = '';

        $scope.data = {
            showDelete: false,          // Toggle icon on/off
            showEdit: true,             // Toggle icon on/off
            noMoreItemsAvailable: true, // Toggle scroll log
            limitRows: 10,              // Number of rows in the UI
            ListOfElements: [],         // The list of the elements
            tableType: 'MeterReading'   // Name of the table
        };


        if ($state.params.meterId) {
            myMeterId = $state.params.meterId;
        }
        var promiseGetOne = eccozDB.getOne(myMeterId);
        promiseGetOne.then(
            // resolve - Handler
            function (eccozDBListItem) {
                $scope.meter = eccozDBListItem;
            },
            // reject - Handler
            function (reason) {
                alert($translate.instant('M_LIST_EMPTY') + ': ' + reason);
            }
        );

        getAllRows();


        $scope.chartConfig = {
            options: {
                chart: {
                    type: 'line'
                },
                scrollbar : {
                    enabled : false
                },
                navigator : {
                    enabled : false
                },
                rangeSelector : {
                    enabled: false
                },
                xAxis: {
                    ordinal: false
                }

            },
            series: [{
                data: [
                ],
                marker: {
                    enabled: false
                }
            }],
            useHighStocks: true,

            loading: false
        }





        // the functions
        // -------------

        function getAllRows() {
            var promiseGetAll = eccozDB.getAllMeterReadings(myMeterId, $scope.data.limitRows, '', '', true);
            promiseGetAll.then(
                // resolve - Handler
                function (reason) {


                    $scope.data.groupedPairs = _.chain(reason).groupBy(function(o) {
                        return o.key[2][0] + ' - ' + o.key[2][1];
                    }).pairs().sortBy(0).reverse().value();
                    $scope.data.ListOfElements = reason;
                    // $scope.groupedPairs = sortedPairs;
                    if (reason.length == $scope.data.limitRows) {
                        $scope.data.noMoreItemsAvailable = false;

                    }
                    var plotData = [];
                    for (var i = $scope.data.ListOfElements.length-1; i >= 0; i--) {
                        var dateInPlotFormat = $filter('date')(new Date($scope.data.ListOfElements[i].doc.inputDateTime),
                            'yyyy-MM-dd_HH:mm:ss');
                        plotData.push(
                            { 'inputDateTime':dateInPlotFormat,
                              'readingValue':$scope.data.ListOfElements[i].doc.readingValue}
                        );
                    }
                    $scope.dataset = plotData;


                },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                }
            );
        }

        $scope.fetchMoreLines = function () {
            var LastElement = $scope.data.ListOfElements[$scope.data.ListOfElements.length - 1];
            var FirstElement = $scope.data.ListOfElements[0];
            var promiseGetMore = eccozDB.getAllMeterReadings(FirstElement.doc.EnergyMeter_id,
                                                            $scope.data.limitRows,
                                                            FirstElement, LastElement, true);
            promiseGetMore.then(
                // resolve - Handler
                function (reason) {
                    $scope.data.ListOfElements = $scope.data.ListOfElements.concat(reason);

                    $scope.data.groupedPairs = _.chain($scope.data.ListOfElements).groupBy(function(o) {
                        return o.key[2][0] + ' - ' + o.key[2][1];
                    }).pairs().sortBy(0).reverse().value();

                    if (reason.length == 0) {
                        $scope.data.noMoreItemsAvailable = true;
                    }
                    var plotData = [];
                    for (var i = $scope.data.ListOfElements.length-1; i >= 0; i--) {
                        var dateInPlotFormat = $filter('date')(new Date($scope.data.ListOfElements[i].doc.inputDateTime),
                            'yyyy-MM-dd_HH:mm:ss');
                        plotData.push(
                            { 'inputDateTime':dateInPlotFormat,
                                'readingValue':$scope.data.ListOfElements[i].doc.readingValue}
                        );
                    }
                    $scope.dataset = plotData;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            );
            console.log('fetchMorelines');
        };

        $scope.onItemEdit = function (item) {
            $ionicListDelegate.closeOptionButtons();
            var mId = $state.params.meterId;
            $state.go('app.meter-reading-detail', { meterId: mId, readingId: item.doc._id });
        };

        $scope.onItemNew = function () {
            var mId = $state.params.meterId;
            $state.go('app.meter-reading-detail', { meterId: mId });
        };

        $scope.onItemDelete = function (item) {
           var confirmPopup = $ionicPopup.confirm({
                title: $translate.instant('M_ALERT'),
                template: $translate.instant('M_DELETE_READING')
            });
            confirmPopup.then(function (res) {
                // The 'ok' button is pressed
                $ionicListDelegate.closeOptionButtons();
                if (res) {
                    var promiseDelete = eccozDB.deleteOne(item);
                    promiseDelete.then(
                        // resolve - Handler
                        function (reason) {
                            console.log(reason);
                            //$scope.data.ListOfElements.splice(indexId, 1);
                            $scope.$emit('MeterReadingsCtrl_updated');
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
