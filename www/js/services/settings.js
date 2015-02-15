/**
* EccoZ
* https://github.com/ahackl/EccoZ
* Copyright (c) 2014 ; Licensed GPL 2.0
*/
_service.service('Settings',['$translate','TwoFish', function($translate, TwoFish) {
    'use strict';

    // use a proxy for the connection to the server.
    // https://www.npmjs.com/package/corsproxy
    // # sudo npm install -g corsproxy
    // # corsproxy

    var _LoginPattern = '123';

    // settings for the pouch database
    var _dbServerUrl =  'http://localhost:9292/localhost:5984/';
    var _dbSync = false;
    var _dbSyncIntervalMinutes = 5;
    var _dbName = 'eccozdb';
    var _dbDesignName =  '_design/eccoz';
    var _dbSettingsName = 'dbSettings';
    var _dbUsername = 'username';
    var _dbPassword = TwoFish.encrypt(_LoginPattern,'password');


    // settings for the webDAV server
    var _webDavHost = 'localhost:9292/localhost';
    var _webDavUseHttps = false;
    var _webDavPort = 80;
    var _webDavUsername = 'username';
    var _webDavPassword = TwoFish.encrypt(_LoginPattern,'password');
    var _webDavExportUrl = '/owncloud/remote.php/webdav/';

    // settings for the export
    var _exDecimalSeparator = ',';
    var _exColumnSeparator = ',';
    var _exFileExtension = 'csv';
    var _exDateTimeFormat = 'yyyy-MM-dd HH:mm';

    // internal settings
    var _MajorReleaseNo = 2;
    var _MinorReleaseNo = 0;
    var _PatchLevelNo = 0;
    var _UIlanguage = 'en';


    // for the database:
    var _id = _dbSettingsName;
    var _rev = '';

    this.getLoginPattern = function(){
        return _LoginPattern;
    };
    this.setLoginPattern = function(pattern){
        _LoginPattern = pattern;
    }



    this.getWebDavHost = function(){
        return _webDavHost;
    };
    this.getWebDavUseHttps = function(){
        return _webDavUseHttps;
    };
    this.getWebDavPort = function(){
        return _webDavPort;
    };
    this.getWebDavUsername = function(){
        return _webDavUsername;
    };
    this.getWebDavPassword = function() {
        return TwoFish.decrypt(_LoginPattern,_webDavPassword,false);
    };
    this.getWebDavExportUrl = function(){
        return _webDavExportUrl;
    };


    this.set_rev = function (rev) {
        _rev = rev;
    };


    this.getExDecimalSeparator = function(){
        return _exDecimalSeparator;
    };
    this.getExColumnSeparator = function(){
        return _exColumnSeparator;
    };
    this.getExFileExtension = function(){
        return _exFileExtension;
    };
    this.getExDateTimeFormat = function(){
        return _exDateTimeFormat;
    }


    this.setUIlanguage = function(UIlanguage) {
        _UIlanguage = UIlanguage;
        $translate.use(_UIlanguage)
    };
    this.getUIlanguage = function(){
        return _UIlanguage;
    };

    this.setDbServerUrl = function (dbServerUrl) {
        _dbServerUrl = dbServerUrl;
    };
    this.getDbServerUrl = function(){
        return _dbServerUrl;
    };

    this.setDbSync = function (dbSync) {
        _dbSync = dbSync;
    };
    this.getDbSync = function (){
        return _dbSync;
    };

    this.setDbSyncIntervalMinutes = function(dbSyncIntervalMinutes){
        _dbSyncIntervalMinutes = dbSyncIntervalMinutes;
    };
    this.getDbSyncIntervalMinutes = function() {
        return _dbSyncIntervalMinutes;
    };
    this.getDbPassword = function() {
        return TwoFish.decrypt(_LoginPattern,_dbPassword,false);
    };

    this.getDbName = function () {
        return _dbName;
    };
    this.getDbDesignName = function () {
        return _dbDesignName;
    };

    this.getDbSettingsName = function () {
        return _dbSettingsName;
    };

    this.getMajorReleaseNo = function() {
        return _MajorReleaseNo;
    };

    this.getMinorReleaseNo = function() {
        return _MinorReleaseNo;
    };

    this.getPatchLevelNo = function() {
        return _PatchLevelNo;
    };

    this.getDbObject = function() {
        return {
            _id: _id,
            _rev: _rev,
            MajorReleaseNo: _MajorReleaseNo,
            MinorReleaseNo: _MinorReleaseNo,
            PatchLevelNo: _PatchLevelNo,
            dbServerUrl: _dbServerUrl,
            dbSync: _dbSync,
            dbSyncIntervalMinutes: _dbSyncIntervalMinutes,
            dbUsername: _dbUsername,
            dbPassword: _dbPassword,
            UIlanguage: _UIlanguage,
            webDavHost: _webDavHost,
            webDavUseHttps: _webDavUseHttps,
            webDavPort: _webDavPort,
            webDavUsername: _webDavUsername,
            webDavPassword: _webDavPassword,
            webDavExportUrl: _webDavExportUrl,
            exDecimalSeparator: _exDecimalSeparator,
            exColumnSeparator: _exColumnSeparator,
            exFileExtension: _exFileExtension,
            exDateTimeFormat: _exDateTimeFormat
        };
    };


    this.setDbObject = function(dbSettingsDocument) {

        if (dbSettingsDocument.hasOwnProperty('exDateTimeFormat')) {
            _exDateTimeFormat = dbSettingsDocument.exDateTimeFormat;
        }
        if (dbSettingsDocument.hasOwnProperty('exFileExtension')) {
            _exFileExtension = dbSettingsDocument.exFileExtension;
        }
        if (dbSettingsDocument.hasOwnProperty('exColumnSeparator')) {
            _exColumnSeparator = dbSettingsDocument.exColumnSeparator;
        }
        if (dbSettingsDocument.hasOwnProperty('exDecimalSeparator')) {
            _exDecimalSeparator = dbSettingsDocument.exDecimalSeparator;
        }
        if (dbSettingsDocument.hasOwnProperty('dbServerUrl')) {
            _dbServerUrl = dbSettingsDocument.dbServerUrl;
        }
        if (dbSettingsDocument.hasOwnProperty('dbServerUrl')) {
            _dbServerUrl = dbSettingsDocument.dbServerUrl;
        }
        if (dbSettingsDocument.hasOwnProperty('dbSync')) {
            _dbSync = dbSettingsDocument.dbSync;
        }
        if (dbSettingsDocument.hasOwnProperty('dbSyncIntervalMinutes')) {
            _dbSyncIntervalMinutes = dbSettingsDocument.dbSyncIntervalMinutes;
        }
        if (dbSettingsDocument.hasOwnProperty('dbUsername')) {
            _dbUsername = dbSettingsDocument.dbUsername;
        }
        if (dbSettingsDocument.hasOwnProperty('UIlanguage')) {
            _UIlanguage = dbSettingsDocument.UIlanguage;
        }
        if (dbSettingsDocument.hasOwnProperty('webDavHost')) {
            _webDavHost = dbSettingsDocument.webDavHost;
        }
        if (dbSettingsDocument.hasOwnProperty('webDavUseHttps')) {
            _webDavUseHttps = dbSettingsDocument.webDavUseHttps;
        }
        if (dbSettingsDocument.hasOwnProperty('webDavPort')) {
            _webDavPort = dbSettingsDocument.webDavPort;
        }
        if (dbSettingsDocument.hasOwnProperty('webDavUsername')) {
            _webDavUsername = dbSettingsDocument.webDavUsername;
        }
        if (dbSettingsDocument.hasOwnProperty('webDavExportUrl')) {
            _webDavExportUrl = dbSettingsDocument.webDavExportUrl;
        }
        if (dbSettingsDocument.hasOwnProperty('webDavUsername')) {
            _webDavUsername = dbSettingsDocument.webDavUsername;
        }
        if (dbSettingsDocument.hasOwnProperty('webDavPassword')) {
            if( Object.prototype.toString.call( dbSettingsDocument.webDavPassword ) === '[object Array]' ||
                Object.prototype.toString.call( dbSettingsDocument.webDavPassword ) === '[object Uint8Array]') {
                _webDavPassword = dbSettingsDocument.webDavPassword;
            } else {
                _webDavPassword = TwoFish.encrypt(_LoginPattern,dbSettingsDocument.webDavPassword);
            }
        }
        if (dbSettingsDocument.hasOwnProperty('dbPassword')) {
            if( Object.prototype.toString.call( dbSettingsDocument.dbPassword ) === '[object Array]' ||
                Object.prototype.toString.call( dbSettingsDocument.dbPassword ) === '[object Uint8Array]') {
                _dbPassword = dbSettingsDocument.dbPassword;
            } else {
                _dbPassword = TwoFish.encrypt(_LoginPattern,dbSettingsDocument.dbPassword);
            }
        }

        if (dbSettingsDocument.hasOwnProperty('webDavExportUrl')) {
            _webDavExportUrl = dbSettingsDocument.webDavExportUrl;
        }

        $translate.use(_UIlanguage);
    };

    this.getLanguageArray = function () {
        var langList =
        [
            {name: $translate.instant('L_DE'), id: 'de'},
            {name: $translate.instant('L_EN'), id: 'en'}
        ];
        return langList;
    };

}]);