/**
* EccoZ
* https://github.com/ahackl/EccoZ
* Copyright (c) 2014 ; Licensed GPL 2.0
*/
_service.service('Settings', function() {
    // use a proxy for the connection to the server.
    // https://www.npmjs.com/package/corsproxy
    // # sudo npm install -g corsproxy
    // # corsproxy
    var _dbServerUrl =  'http://localhost:9292/127.0.0.1:5984/';
    var _dbSync = false;
    var _dbName = 'eccozdb19';
    var _dbDesignName =  '_design/eccoz';
    var _dbSettingsName = 'dbSettings';

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


    this.getDbName = function () {
        return _dbName;
    };
    this.getDbDesignName = function () {
        return _dbDesignName;
    };

    this.getDbSettingsName = function () {
        return _dbSettingsName;
    }


});