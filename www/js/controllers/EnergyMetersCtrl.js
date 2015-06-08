/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_control.controller('EnergyMetersCtrl', ['$scope', '$rootScope', '$state', '$translate',
                    '$interval', '$ionicPopup', 'eccozDB', '$ionicListDelegate', '$filter', '$q',
    function ($scope, $rootScope, $state, $translate,
              $interval, $ionicPopup, eccozDB, $ionicListDelegate, $filter, $q) {



        $scope.chartState = 'off';
        $interval(changeChartState, 1000);
        function changeChartState() {
            $scope.chartState = ($scope.chartState === 'on' ? 'off' : 'on');
            // console.log("Interval occurred");
        }
        // update the state
        // ------------------------------------------------------------------------
        var myListener = $rootScope.$on('EnergyMetersCtrl_updated', function (event) {
            event.stopPropagation();
            $scope.data.ListOfElements = [];
            getAllRows();
        });
        $scope.$on('$destroy', myListener);
        // ------------------------------------------------------------------------

        $scope.data = {
            showDelete: false,          // Toggle icon on/off
            showEdit: true,             // Toggle icon on/off
            noMoreItemsAvailable: true, // Toggle scroll log
            limitRows: 15,              // Number of rows in the UI
            ListOfElements: [],         // The list of the elements
            tableType: 'EnergyMeter'    // Name of the table
        };

        getAllRows();

        function makeChartData(reason, addOrNew) {
            var promiseList = [];
            $scope.chartState = 'off';
            for (var i = 0; i < reason.length; i++) {
                promiseList.push(eccozDB.getAllMeterReadingsGraph(reason[i].doc._id, reason[i].doc.nodays, true));
            }
            $q.all(promiseList).then(function (data) {
                    if ($scope.eChartDataset === undefined || addOrNew === 'new'){
                        $scope.eChartDataset = [];
                    }
                    $scope.eChartDataset = data;
                    $scope.chartState = 'on';
                }
            );
        }


        // the functions
        // -------------
        function getAllRows() {
            var promiseGetAll = eccozDB.getAllEnergyMeters($scope.data.limitRows,'');
            promiseGetAll.then(
                // resolve - Handler
                function (reason) {
                    $scope.data.ListOfElements = reason;
                    if (reason.length == $scope.data.limitRows) {
                        $scope.data.noMoreItemsAvailable = false;
                    }
                    makeChartData(reason, 'new');
                },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                }
            );
        }

        $scope.fetchMoreLines = function () {
            var LastElement = $scope.data.ListOfElements[$scope.data.ListOfElements.length - 1];
            var promiseGetMore = eccozDB.getAllEnergyMeters($scope.data.limitRows,LastElement);
            promiseGetMore.then(
                // resolve - Handler
                function (reason) {
                    $scope.data.ListOfElements = $scope.data.ListOfElements.concat(reason);
                    if (reason.length == 0) {
                        $scope.data.noMoreItemsAvailable = true;
                    }
                    makeChartData(reason,'add');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            );
        };


        $scope.doRefresh = function() {
            //console.log("doRefresh");
            $scope.data.ListOfElements = [];
            getAllRows();
            $scope.$broadcast('scroll.refreshComplete');
        }

        $scope.onItemEdit = function (indexId) {
            $ionicListDelegate.closeOptionButtons();
            var ElementId = $scope.data.ListOfElements[indexId].id;
            $state.go('tab.energymeter-detail', { meterId: ElementId });
        };

        $scope.onItemNew = function () {
           $state.go('tab.energymeter-detail');
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