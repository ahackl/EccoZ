/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */
_control.controller('SettingsCtrl',
    ['$scope', '$rootScope', 'Settings', '$state', '$translate','$ionicPopup', 'eccozDB', '$ionicHistory','$location',
    function ($scope, $rootScope, Settings, $state, $translate, $ionicPopup, eccozDB, $ionicHistory, $location) {


        // Manage the show/hide function for the save button
        $scope.change = function () {
            $scope.isChanged = true;
        };
        if ($scope.isChanged == null) {
            $scope.isChanged = false;
        };

        // get all data for the display
        $scope.setting = Settings.getDbObject();
        $scope.setting.webDavPassword = Settings.getWebDavPassword();

        // get the list for the selection of the languages
        $scope.setting.langlist = Settings.getLanguageArray();

        // find the current selected language in the list
        var indexOfLanguage = 0;
        var currentLang = $translate.use();
        for (var i = 0; i < $scope.setting.langlist.length; i++) {
            if ($scope.setting.langlist[i].id === currentLang) {
                indexOfLanguage = i;
            }
        }
        // save the current selected language in the $scope
        $scope.setting.langselect = $scope.setting.langlist[indexOfLanguage];



        /**
         * Function to save the changed setting to the database
         * and change the languages of the UI.
         */
        $scope.onItemUpdate = function () {

            // hide the save button
            $scope.isChanged = false;

            // get the data from the $scope
            var setting = $scope.setting;

            // save the selected language
            setting.UIlanguage = setting.langselect.id;

            // write all changes back to the global setting object
            Settings.setDbObject(setting);

            // get back the object to save it in the database
            var dBSetting = Settings.getDbObject();

            // change the languages
            if (dBSetting.UIlanguage !== $translate.use()) {
                $translate.use(dBSetting.UIlanguage);
            };

            // save settings in database
            eccozDB.saveSettings();

            // hide the back button on next view
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            // go to list of meters
            $state.go('app.meters');

        };


    }]);


