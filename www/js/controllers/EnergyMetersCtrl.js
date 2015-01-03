/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_control.controller('EnergyMetersCtrl', ['$scope', '$rootScope', '$state', '$translate', '$interval', '$ionicPopup', 'eccozDB',
    function ($scope, $rootScope, $state, $translate, $interval, $ionicPopup, eccozDB ) {


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


        getAllRows();


        // the functions
        // -------------

        function getAllRows() {
            var promiseGetAll = eccozDB.getAll($scope.data.tableType, '', $scope.data.limitRows, '');
            promiseGetAll.then(
                // resolve - Handler
                function (reason) {
                    $scope.data.ListOfElements = reason;
                    if (reason.length == $scope.data.limitRows) {
                        $scope.data.noMoreItemsAvailable = false;
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