/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_control.controller('MeterReadingsCtrl', ['$scope', '$rootScope', '$state', '$translate', '$ionicPopup', 'eccozDB',
    function ($scope, $rootScope, $state, $translate, $ionicPopup, eccozDB) {

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


        // the functions
        // -------------

        function getAllRows() {
            var promiseGetAll = eccozDB.getAll($scope.data.tableType, myMeterId, $scope.data.limitRows, '');
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
            var promiseGetMore = eccozDB.getAll($scope.data.tableType, LastElement.doc.EnergyMeter_id, $scope.data.limitRows, LastElement);
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
            console.log('fetchMorelines');
        };

        $scope.onItemEdit = function (indexId) {
            var mId = $state.params.meterId;
            var rId = $scope.data.ListOfElements[indexId].id;
            $state.go('app.meter-reading-detail', { meterId: mId, readingId: rId });
        };

        $scope.onItemNew = function () {
            var mId = $state.params.meterId;
            $state.go('app.meter-reading-detail', { meterId: mId });
        };

        $scope.onItemDelete = function (indexId) {

            var confirmPopup = $ionicPopup.confirm({
                title: $translate.instant('M_ALERT'),
                template: $translate.instant('M_DELETE_READING')
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
