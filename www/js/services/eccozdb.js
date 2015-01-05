/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 *
 * Service to communicate with the pouch database
 *
 */
_service.factory('eccozDB', ['$q', '$rootScope', 'Settings', '$interval',
    function ($q, $rootScope, Settings, $interval) {
        'use strict';

        var service = {
            updateOne: updateOne,
            deleteOne: deleteOne,
            getOne: getOne,
            getAll: getAll,
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
                    console.log('Design document created: ' + JSON.stringify(result));
                }).catch(function (err) {
                    console.error('Design document not created: ' + JSON.stringify(err));
                });
            } else {
                console.error(err.toString());
            }

        });

        // read setting from database
        localDb.get(Settings.getDbSettingsName()).then(function (settingDocument) {
            console.log('Read Settings from database');
            Settings.setDbObject(settingDocument);
            Settings.set_rev(settingDocument._rev);

            // activate sync of database
            if (Settings.getDbSync() === true) {
                startClock();
            } else {
                stopClock();
            }

        }).catch(function (err) {
            if (err.status === 404) {
                console.log('Setting document not available -> create it');
                var dbSettingsDocument = Settings.getDbObject();
                localDb.put(dbSettingsDocument).then(function (result) {
                    console.log('Setting document created: ' + JSON.stringify(result));
                    Settings.set_rev(result.rev);

                    // activate sync of database
                    if (Settings.getDbSync() === true) {
                        startClock();
                    } else {
                        stopClock();
                    }


                }).catch(function (err) {
                    console.error('Setting document not created: ' + JSON.stringify(err));
                });
            } else {
                console.error(err.toString());
            }

        });


        /**
         * Start the timer for syncing of the database
         */
        function startClock() {
            if (clockTimer === null) {
                clockTimer = $interval(function () {syncDB();}, 1000 * 60 * Settings.getDbSyncIntervalMinutes());
            }
        }

        /**
         * Stop the timer for syncing the database
         */
        function stopClock() {
            if (clockTimer !== null) {
                $interval.cancel(clockTimer);
                clockTimer = null;
            }
        }

        /**
         * Reads the settings parameter and save them into the database
         */
        function saveSettings() {

            // get the data, which must be saved it in the database
            var dBSetting = Settings.getDbObject();

            // save the new setting to the database
            localDb.put(dBSetting).then(function (result) {
                console.log('Settings saved: ' + JSON.stringify(result));
                // write the new revision number into the global setting object
                Settings.set_rev(result.rev);

                // activate sync of database if needed
                if (Settings.getDbSync() === true) {
                    startClock();
                } else {
                    stopClock();
                }

            }).catch(function (error) {
                console.error('Settings not saved: ' + JSON.stringify(error));
            });
        }

        /**
         * Save one object into the database
         *
         * @param {object} databaseItem One database object
         * @return {object} The promise of the result.
         *
         */
        function updateOne(databaseItem) {
            var delay = $q.defer();
            localDb.put(databaseItem, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        console.log('eccozDB.updateOne failed -> ' + JSON.stringify(databaseItem));
                        console.log('eccozDB.updateOne failed <- ' + JSON.stringify(error));
                        delay.reject(error);
                    } else {
                        //console.log('eccozDB.updateOne succeeded -> ' + JSON.stringify(databaseItem));
                        //console.log('eccozDB.updateOne succeeded <- ' + JSON.stringify(response));
                        delay.resolve(response);
                    }
                });
            });
            return delay.promise;
        }

        /**
         * Delete one object from the database
         *
         * @param {object} databaseItem One database object
         * @return {object} The promise of the result.
         *
         */
        function deleteOne(databaseItem) {
            var delay = $q.defer();
            localDb.remove(databaseItem.doc._id, databaseItem.doc._rev, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        console.log('eccozDB.deleteOne failed -> ' + JSON.stringify(databaseItem));
                        console.log('eccozDB.deleteOne failed <- ' + JSON.stringify(error));
                        delay.reject(error);
                    } else {
                        //console.log('eccozDB.deleteOne succeeded -> ' + JSON.stringify(databaseItem));
                        //console.log('eccozDB.deleteOne succeeded <- ' + JSON.stringify(response));
                        delay.resolve(response);
                    }
                });
            });
            return delay.promise;
        }


        /**
         * Read all data for one _id
         *
         * @param {string} item_id The _id of a database object
         * @return {object} The promise of the result.
         *
         */
        function getOne(item_id) {
            var delay = $q.defer();
            var options = {};
            localDb.get(item_id, options, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        console.log('eccozDB.getOne failed -> ' + JSON.stringify(item_id));
                        console.log('eccozDB.getOne failed <- ' + JSON.stringify(error));
                        delay.reject(error);
                    } else {
                        //console.log('eccozDB.getOne succeeded -> ' + JSON.stringify(item_id));
                        //console.log('eccozDB.getOne succeeded <- ' + JSON.stringify(response));
                        delay.resolve(response);
                    }

                });
            });

            return delay.promise;
        }



        /**
         * Read all data form the database with some filter options:
         * Select only rows which are tagged with setTypeName
         * If the parameter "setSubId" is given, then only readings for
         * a given Meter_id are selected.
         * Only "setLimit" number of rows are read from the database.
         * If more then "setLimit" rows needed, then the it is possible
         * to skip the retrieving of the rows with "lastKeyFetched"
         *
         * @param {string} setTypeName Marking of rows (Reading or Meter)
         * @param {string} setSubId The _id of a Meter
         * @param {string} setLimit Numbers of rows
         * @param {object} lastKeyFetched The _id of a row
         *
         * @return {object} The promise of the result.
         *
         */
        function getAll(setTypeName, setSubId, setLimit, lastKeyFetched) {
            var delay = $q.defer();
            var options = {};

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
                        console.log('eccozDB.getAll failed -> ' + JSON.stringify(setTypeName)
                                                        + " | " + JSON.stringify(setSubId)
                                                        + " | " + JSON.stringify(setLimit)
                                                        + " | " + JSON.stringify(lastKeyFetched) );
                        console.log('eccozDB.getAll failed <- ' + JSON.stringify(error));
                        delay.reject(error);
                    } else {
                        //console.log('eccozDB.getAll succeeded -> ' + JSON.stringify(setTypeName)
                        //                                   + " | " + JSON.stringify(setSubId)
                        //                                   + " | " + JSON.stringify(setLimit)
                        //                                   + " | " + JSON.stringify(lastKeyFetched) );
                        //console.log('eccozDB.getAll succeeded <- ' + JSON.stringify(response));
                        //console.log('eccozDB.getAll retrieved ' + response.rows.length + ' rows');
                        delay.resolve(response.rows);
                    }
                });
            });
            return delay.promise;
        }


        /**
         * Synchronization of the local and the remote pouch databases.
         */
        function syncDB() {
            // stop clock, to avoid loops.
            stopClock();

            var localDbName = Settings.getDbName();
            var remoteDbName = Settings.getDbServerUrl() + Settings.getDbName();

            var options = {live: true};

            PouchDB.sync(localDbName, remoteDbName, options)
                .on('change', function (info) {
                    console.log('eccozDB.syncDB - change <- ' + JSON.stringify(info));
                    startClock();
                }).on('complete', function (info) {
                    console.log('eccozDB.syncDB - complete <- ' + JSON.stringify(info));
                    startClock();
                }).on('uptodate', function (info) {
                    console.log('eccozDB.syncDB - uptodate <- ' + JSON.stringify(info));
                    startClock();
                }).on('error', function (error) {
                    console.log('eccozDB.syncDB - error <- ' + JSON.stringify(error));
                    startClock();
                });
        }
        return service;
    }]);