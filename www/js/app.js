/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

var _application = angular.module('EccoZ', ['ionic', 'pascalprecht.translate', 'eccoz.controllers', 'eccoz.services']);

_application.run(function ($ionicPlatform, $translate) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
});

_application.config(function ($stateProvider, $urlRouterProvider, $translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix: 'js/languages/locale-',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage("de");
    $translateProvider.fallbackLanguage("de");


    $stateProvider

        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html"
        })
        .state('app.settings', {
            url: "/settings",
            views: {
                'menuContent': {
                    templateUrl: "templates/settings.html",
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state('app.meters', {
            url: "/meters",
            views: {
                'menuContent': {
                    templateUrl: "templates/energymeter.html",
                    controller: 'EnergyMetersCtrl'
                }
            }
        })
        .state('app.meter-detail', {
            url: "/meter/:meterId",
            views: {
                'menuContent': {
                    templateUrl: "templates/energymeterdetail.html",
                    controller: 'EnergyMeterDetailCtrl'
                }
            }
        })
        .state('app.meter-readings', {
            url: '/meter/:meterId/readings',
            views: {
                'menuContent': {
                    templateUrl: 'templates/meterreading.html',
                    controller: 'MeterReadingsCtrl'
                }
            }
        })
        .state('app.meter-reading-detail', {
            url: '/meter/:meterId/reading/:readingId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/meterreadingdetail.html',
                    controller: 'MeterReadingDetailCtrl'
                }
            }
        });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/meters');


});

