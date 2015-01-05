/**
* EccoZ
* https://github.com/ahackl/EccoZ
* Copyright (c) 2014 ; Licensed GPL 2.0
*/
_service.service('Settings',['$translate', function($translate) {
    'use strict';

    // use a proxy for the connection to the server.
    // https://www.npmjs.com/package/corsproxy
    // # sudo npm install -g corsproxy
    // # corsproxy

    // settings for the pouch database
    var _dbServerUrl =  'http://localhost:9292/localhost:5984/';
    var _dbSync = false;
    var _dbSyncIntervalMinutes = 5;
    var _dbName = 'eccozdb';
    var _dbDesignName =  '_design/eccoz';
    var _dbSettingsName = 'dbSettings';

    // settings for the webDAV server
    var _webDavHost = 'localhost:9292/localhost';
    var _webDavUseHttps = false;
    var _webDavPort = 80;
    var _webDavUsername = 'username';
    var _webDavPassword = 'password';
    var _webDavExportUrl = '/owncloud/remote.php/webdav/';

    // internal settings
    var _MajorReleaseNo = 2;
    var _MinorReleaseNo = 0;
    var _PatchLevelNo = 0;
    var _UIlanguage = 'en';


    // for the database:
    var _id = _dbSettingsName;
    var _rev = '';


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
        return _webDavPassword;
    };
    this.getWebDavExportUrl = function(){
        return _webDavExportUrl;
    };


    this.set_rev = function (rev) {
        _rev = rev;
    };

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
            UIlanguage: _UIlanguage,
            webDavHost: _webDavHost,
            webDavUseHttps: _webDavUseHttps,
            webDavPort: _webDavPort,
            webDavUsername: _webDavUsername,
            webDavPassword: _webDavPassword,
            webDavExportUrl: _webDavExportUrl
        };
    };


    this.setDbObject = function(dbSettingsDocument) {

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
            _webDavPassword = dbSettingsDocument.webDavPassword;
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