/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 *
 *
 */

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var _application = angular.module('EccoZ', ['ionic', 'pascalprecht.translate', 'eccoz.controllers',
    'eccoz.services', 'angularChart'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

      document.addEventListener("offline", onOffline, false);

      function onOffline() {
          console.log("onOffline");
      }
      document.addEventListener("online", onOnline, false);

      function onOnline() {
          console.log("onOnline");
      }

  });
})

.config(function($stateProvider, $urlRouterProvider, $translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix: 'languages/locale-',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage("de");
    $translateProvider.fallbackLanguage("de");


  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


  .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.energymeter', {
      url: '/energymeter',
      views: {
          'tab-chats': {
              templateUrl: 'templates/tab-energymeter.html',
              controller: 'EnergyMetersCtrl'
          }
      }
  })
  .state('tab.energymeter-detail', {
      url: '/energymeter/:meterId',
      views: {
          'tab-chats': {
              templateUrl: 'templates/tab-energymeter-detail.html',
              controller: 'EnergyMeterDetailCtrl'
          }
      }
  })
  .state('tab.meter-readings', {
      url: '/meter/:meterId/readings',
      views: {
          'tab-chats': {
              templateUrl: 'templates/tab-meterreading.html',
              controller: 'MeterReadingsCtrl'
          }
      }
  })
  .state('tab.meter-reading-detail', {
      url: '/meter/:meterId/reading/:readingId',
      views: {
          'tab-chats': {
              templateUrl: 'templates/tab-meterreading-detail.html',
              controller: 'MeterReadingDetailCtrl'
          }
      }
  })

  .state('tab.settings', {
      url: '/settings',
      views: {
          'tab-dash': {
              templateUrl: 'templates/tab-settings.html',
              controller: 'SettingsCtrl'
          }
      }
  })

  .state('tab.help', {
      url: '/help',
      views: {
          'tab-help': {
              templateUrl: 'templates/tab-help.html'

          }
      }
  })


  .state('tab.export', {
      url: "/export",
      views: {
          'tab-export': {
              templateUrl: "templates/tab-export.html",
              controller: 'ExportCtrl'
          }
      }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/sign-in');

});
