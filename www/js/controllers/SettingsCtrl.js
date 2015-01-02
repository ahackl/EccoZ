/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */
_control.controller('SettingsCtrl', ['$scope', '$rootScope', 'Settings', '$state', '$translate', '$ionicPopup', 'db',
    function ($scope, $rootScope, Settings, $state, $translate, $ionicPopup, db) {

        // Hide or show the save button.
        // ------------------------------------
        $scope.change = function () {
            $scope.isChanged = true;
        };
        if ($scope.isChanged == null) {
            $scope.isChanged = false;
        }
        ;
        // ------------------------------------

        $scope.setting = Settings.getDbObject();
        $scope.setting.langlist = Settings.getLanguageArray();

        var indexOfLanguage = 0;
        var currentLang = $translate.use();
        for (var i = 0; i < $scope.setting.langlist.length; i++) {
            if ($scope.setting.langlist[i].id === currentLang) {
                indexOfLanguage = i;
            }
        }
        $scope.setting.langselect = $scope.setting.langlist[indexOfLanguage];


        $scope.onItemUpdate = function () {

            var setting = $scope.setting;
            setting.UIlanguage = setting.langselect.id;
            Settings.setDbObject(setting);

            var dBSetting = Settings.getDbObject();

            $scope.isChanged = false;


            if (dBSetting.UIlanguage !== $translate.use()) {
                $translate.use(dBSetting.UIlanguage);
            }
            ;

            db.put(dBSetting).then(function (result) {
                console.log('Settings saved: ' + result.toString());
                Settings.set_rev(result.rev);
            }).catch(function (err) {
                console.error('Settings not saved: ' + err.toString());
            });
        };


    }]);


