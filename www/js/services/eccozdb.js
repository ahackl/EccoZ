/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

_service.factory('eccozDB', ['$q', '$rootScope', 'Settings', '$interval',
    function ($q, $rootScope, Settings, $interval) {
        'use strict';

        var service = {
            updateOne: updateOne,
            deleteOne: deleteOne,
            getOne: getOne,
            getAll: getAll,
            snycDB: snycDB,
            saveSettings: saveSettings
        };

        var localDb = new PouchDB(Settings.getDbName());

        var clockTimer = null;


        // check design document
        localDb.get(Settings.getDbDesignName()).then(function (designDocument) {
            console.log('Design document available');
        }).catch(function (err) {
            if (err.status === 404) {
                console.log('Design document not available -> create it');
                var DesignDocument = {
                    _id: Settings.getDbDesignName(),
                    language: 'javascript',
                    views: { all: { map: 'function(doc) {  emit([doc.type, doc.EnergyMeter_id, doc._id])}' } }
                };
                localDb.put(DesignDocument).then(function (result) {
                    console.log('Design document created: ' + result.toString());
                }).catch(function (err) {
                    console.error('Design document not created: ' + err.toString());
                });
            } else {
                console.error(err.toString());
            };
        });

        // read setting from database
        localDb.get(Settings.getDbSettingsName()).then(function(settingDocument){
            console.log('Read Settings from database');
            Settings.setDbObject(settingDocument);
            Settings.set_rev(settingDocument._rev);

            // activate sync of database
            if (Settings.getDbSync() === true) {
                startClock();
            } else{
                stopClock();
            }

        }).catch(function(err){
            if (err.status === 404) {
                console.log('Setting document not available -> create it');
                var dbSettingsDocument = Settings.getDbObject();
                localDb.put(dbSettingsDocument).then(function (result) {
                    console.log('Setting document created: ' + result.toString());
                    Settings.set_rev(result.rev);

                    // activate sync of database
                    if (Settings.getDbSync() === true) {
                        startClock();
                    } else{
                        stopClock();
                    }


                }).catch(function (err) {
                    console.error('Setting document not created: ' + err.toString());
                });
            } else {
                console.error(err.toString());
            };
        });


        function startClock(){
            if(clockTimer === null){
                clockTimer = $interval(function(){
                    snycDB();
                }, 1000*60*Settings.getDbSyncIntervalMinutes() );
            }
        }
        function stopClock(){
            if(clockTimer !== null){
                $interval.cancel(clockTimer);
                clockTimer = null;
            }
        }
        function saveSettings() {
            // get back the ob
            // ject to save it in the database
            var dBSetting = Settings.getDbObject();

            // save the new setting to the database
            localDb.put(dBSetting).then(function (result) {
                console.log('Settings saved: ' + result.toString());
                // write the new revision number into the global setting object
                Settings.set_rev(result.rev);

                // activate sync of database
                if (Settings.getDbSync() === true) {
                    startClock();
                } else{
                    stopClock();
                }


            }).catch(function (err) {
                console.error('Settings not saved: ' + err.toString());
            });
        };

        function updateOne(databaseItem) {
            var delay = $q.defer();
            localDb.put(databaseItem, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        console.log('Update failed: ');
                        // console.log(error);
                        delay.reject(error);
                    } else {
                        console.log('Update succeeded: ');
                        // console.log(response);
                        delay.resolve(response);
                    }
                });
            });
            return delay.promise;
        };

        function deleteOne(item) {
            var delay = $q.defer();

            localDb.remove(item.doc._id, item.doc._rev, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        delay.reject(error);
                    } else {
                        delay.resolve(response);
                    }

                });
            });
            return delay.promise;
        };

        function getOne(item_id) {
            var delay = $q.defer();
            var options = {};

            localDb.get(item_id, options, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        delay.reject(error);
                    } else {
                        delay.resolve(response);
                    }

                });
            });

            return delay.promise;
        };

        function getAll(setTypeName, setSubId, setLimit, lastKeyFetched) {
            var delay = $q.defer();
            var options = {};
            var map = null;

            options.include_docs = true;

            if (setLimit != 0) {
                options.limit = setLimit;
            }

            if (setSubId == '') {
                if (lastKeyFetched != '') {
                    options.startkey = lastKeyFetched.key;
                    options.endkey = [setTypeName, {}, {}];
                    options.skip = 1;
                } else {
                    options.startkey = [setTypeName];
                    options.endkey = [setTypeName, {}, {}];
                }

            } else {
                if (lastKeyFetched != '') {
                    options.startkey = lastKeyFetched.key;
                    options.endkey = [setTypeName, setSubId, {}];
                    options.skip = 1;
                } else {
                    options.startkey = [setTypeName, setSubId];
                    options.endkey = [setTypeName, setSubId, {}];
                }
            }


            localDb.query('eccoz/all', options, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        delay.reject(error);
                    } else {
                        console.log('Query retrieved ' + response.rows.length + ' rows');
                        delay.resolve(response.rows);
                    }
                });
            });

            return delay.promise;

        };

        function snycDB() {
            stopClock();
            var localDbName = Settings.getDbName();
            var remoteDbName = Settings.getDbServerUrl() + Settings.getDbName();
            var options = {live: true};

            var sync = PouchDB.sync(localDbName, remoteDbName, options)
                .on('change', function (info) {
                    // handle change
                    console.log('handle change');
                    startClock();
                }).on('complete', function (info) {
                    // handle complete
                    console.log('handle complete');
                    startClock();
                }).on('uptodate', function (info) {
                    // handle up-to-date
                    console.log('handle up-to-date: ' + info.toString());
                    startClock();
                }).on('error', function (err) {
                    // handle error
                    console.log('handle error: ' + error);
                    startClock();
                });

        };

        return service;
}]);