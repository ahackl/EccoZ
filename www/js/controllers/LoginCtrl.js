/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_control.controller('LoginCtrl', ['$scope', 'Settings', '$state', '$ionicHistory',
    function ($scope, Settings, $state, $ionicHistory) {



        var lock = new PatternLock("#lockPattern", {

            onDraw:function(pattern) {

                Settings.setLoginPattern(pattern);

                lock.reset();

                // hide the back button on next view
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.meters');
            }


    });

    lock.option('matrix',[4,3]);




    }]);