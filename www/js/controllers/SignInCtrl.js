/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_control.controller('SignInCtrl', ['$scope', 'Settings', '$state', '$ionicHistory',
    function ($scope, Settings, $state, $ionicHistory) {

        var lock = new PatternLock("#lockPattern", {

            onDraw:function(pattern) {
                Settings.setLoginPattern(pattern);
                lock.reset();
                $state.go('tab.energymeter');
            }


    });

    lock.option('matrix',[4,3]);




    }]);