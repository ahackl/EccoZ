/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_control.controller('MeterReadingDetailCtrl',['$scope', '$state', '$filter', '$translate', 'eccozDB',
    function($scope, $state, $filter, $translate, eccozDB) {

    // Manage the show/hide function for the save button
    $scope.change = function () {
        $scope.isChanged = true;
    };
    if ($scope.isChanged == null) {
        $scope.isChanged = false;
    };

    // The ID of the item
    var myMeterId = '';
    var myReadingId = '';

    // Is the UI in the edit mode '1' or in the new mode '0'
    var ModeEnum = {new : 0, edit : 1};
    var isModeEditOrNew = ModeEnum.new;

    // If a ID is added as parameter, then mode is 'edit'
    if ($state.params.meterId) {
        myMeterId = $state.params.meterId;
    }
    if (myMeterId != '') {
        promiseGetOne = eccozDB.getOne(myMeterId);
        promiseGetOne.then(
            // resolve - Handler
            function(eccozDBListItem) {
                $scope.meter = eccozDBListItem;
            },
            // reject - Handler
            function(reason) {
                alert($translate.instant('M_LIST_EMPTY') + ': ' + reason);
            }
        );
    }

    if ($state.params.readingId) {
        myReadingId = $state.params.readingId;
        isModeEditOrNew = ModeEnum.edit;
    }

    // In the edit mode the data comes from the database
    if (isModeEditOrNew == ModeEnum.edit) {
        // load a item
        var promiseGetOne = eccozDB.getOne(myReadingId);
        promiseGetOne.then(
            // resolve - Handler
            function(eccozDBListItem) {
                eccozDBListItem.dummyDate = new Date(eccozDBListItem.inputDateTime);
                eccozDBListItem.dummyTime = new Date(eccozDBListItem.inputDateTime);
                $scope.reading = eccozDBListItem;
            },
            // reject - Handler
            function(reason) {
                alert($translate.instant('M_LIST_EMPTY') + ': ' + reason);
            }
        );
    // In the new mode a new item is created.
    } else {
        // create a new item
        var NewReadingId = new Date().toJSON() + Math.random();
        var currentDateTime = new Date( $filter('date')(new Date(), 'yyyy-MM-dd HH:mm'));
        $scope.reading = {
            _id: NewReadingId.toString(),
            type: 'MeterReading',
            EnergyMeter_id: myMeterId,
            readingValue: 0.0,
            inputDateTime:currentDateTime.toJSON(),
            dummyDate: currentDateTime,
            dummyTime: currentDateTime
        };
    };




    // Update one row
    $scope.onItemUpdate = function() {

        var MeterReading = $scope.reading;

        var dummyDate = $filter('date')(MeterReading.inputDateTime, 'yyyy-MM-dd');
        var dummyTime = $filter('date')(MeterReading.inputDateTime, 'HH:mm');

        if (typeof MeterReading.dummyDate !== 'undefined') {
            dummyDate = $filter('date')(MeterReading.dummyDate, 'yyyy-MM-dd');
        }
        if (typeof MeterReading.dummyTime !== 'undefined') {
            dummyTime = $filter('date')(MeterReading.dummyTime, 'HH:mm');
        }

        MeterReading.inputDateTime = new Date(dummyDate + ' ' + dummyTime).toJSON();
        delete MeterReading.dummyDate;
        delete MeterReading.dummyTime;

        var promiseUpdate = eccozDB.updateOne(MeterReading);

        promiseUpdate.then(
            // resolve - Handler
            function(reason) {
                console.log(reason);
                $scope.$emit('MeterReadingsCtrl_updated');
                $state.go('app.meter-readings',{ meterId : $scope.reading.EnergyMeter_id });
                //$state.go('^');
            },
            // reject - Handler
            function(reason) {
                console.log(reason);
            }
        );

    };


}]);