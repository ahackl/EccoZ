/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_control.controller('EnergyMeterDetailCtrl', ['$scope', '$state', '$translate', 'eccozDB','$ionicHistory',
    function ($scope, $state, $translate, eccozDB, $ionicHistory) {

    // Manage the show/hide function for the save button
    $scope.change = function () {
        $scope.isChanged = true;
    };
    if ($scope.isChanged == null) {
        $scope.isChanged = false;
    };

    // The ID of the item
    var myId = '';

    // Is the UI in the edit mode '1' or in the new mode '0'
    var ModeEnum = {new: 0, edit: 1};
    var isModeEditOrNew = ModeEnum.new;

    // If a ID is added as parameter, then mode is 'edit'
    if ($state.params.meterId) {
        myId = $state.params.meterId;
        isModeEditOrNew = ModeEnum.edit;
    }

    // In the edit mode the data comes from the database
    if (isModeEditOrNew == ModeEnum.edit) {
        // load a item
        var promiseGetOne = eccozDB.getOne(myId);
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
        // In the new mode a new item is created.
    } else {
        // create a new item
        var NewEnergyMeterId = eccozDB.getID();
        $scope.meter = {
            _id: NewEnergyMeterId.toString(), // unique number
            type: 'EnergyMeter' // name of the 'table'
        }
    }


    // Update one row
    $scope.onItemUpdate = function () {

        var EnergyMeter = $scope.meter;

        if (!EnergyMeter.name || EnergyMeter.name == '') {
            EnergyMeter.name = $translate.instant('F_PLACE_NAME');
        }
        if (!EnergyMeter.number || EnergyMeter.number == '') {
            EnergyMeter.number = $translate.instant('F_PLACE_NUMBER');
        }


        var promiseUpdate = eccozDB.updateOne(EnergyMeter);

        promiseUpdate.then(
            // resolve - Handler
            function (reason) {
                console.log(JSON.stringify(reason));
                $scope.$emit('EnergyMetersCtrl_updated');
                // $state.go('app.meters');
                // $window.history.back();
                $ionicHistory.goBack();
            },
            // reject - Handler
            function (reason) {
                console.log(reason);
            }
        ).catch(function (error) {
                console.error(JSON.stringify(error));
            });

    };


}]);