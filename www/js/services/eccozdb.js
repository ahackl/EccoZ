/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 *
 * Service to communicate with the pouch database
 */
_service.factory('eccozDB', ['$q', '$rootScope', 'Settings', '$interval', '$filter',
    function ($q, $rootScope, Settings, $interval, $filter) {
        'use strict';

        var service = {
            updateOne: updateOne,
            deleteOne: deleteOne,
            getOne: getOne,
            getAll: getAll,
            saveSettings: saveSettings,
            getAllMeterReadings: getAllMeterReadings,
            getAllEnergyMeters: getAllEnergyMeters,
            getAllMeterReadingsGraph: getAllMeterReadingsGraph,
            getID: getID,
            syncDB: syncDB
        };

        var localDb = new PouchDB(Settings.getDbName());
        var clockTimer = null;


        // check design document
        localDb.get(Settings.getDbDesignName()).then(function (designDocument) {
            console.log('Design document available: ' + JSON.stringify(designDocument));
            //localDb.remove(designDocument._id,designDocument._rev).then(function (result) {
            //    console.log('Design document deleted: ' + JSON.stringify(result));
            //    makeDesignDocument();
            //}).catch(function (err) {
            //    console.error('Design document not deleted: ' + JSON.stringify(err));
            //});
        }).catch(function (err) {
            if (err.status === 404) {
                console.log('Design document not available -> create it');
                makeDesignDocument();
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
         * Create a design document
         */
        function makeDesignDocument() {
            var DesignDocument = {
                _id: Settings.getDbDesignName(),
                language: 'javascript',
                views: { all: { map: 'function(doc) {  emit([doc.type, doc.EnergyMeter_id, doc._id])}' },
                    allEnergyMeter: { map: 'function(doc) {  emit([doc.type, doc.location, doc.name, doc._id])}' },
                    allMeterReading: { map: 'function(doc) { ' +
                        'var curDate = new Date(doc.inputDateTime);' +
                        'var curYear = curDate.getFullYear().toString();' +
                        'var curMonth = ("0" + (curDate.getMonth() + 1)).slice(-2);' +
                        'var curDate = ("0" + curDate.getDate()).slice(-2);' +
                        'emit([doc.EnergyMeter_id, doc.inputDateTime, [curYear,curMonth,curDate], doc._id])}' },
                    allMeterReadingGraph: { map: 'function(doc) { ' +
                        'var curDate = new Date(doc.inputDateTime);' +
                        'var curYear = curDate.getFullYear().toString();' +
                        'var curMonth = ("0" + (curDate.getMonth() + 1)).slice(-2);' +
                        'var curDate = ("0" + curDate.getDate()).slice(-2);' +
                        'emit([doc.EnergyMeter_id,  [curYear,curMonth,curDate], doc.inputDateTime, doc._id])}' }}
                };
            localDb.put(DesignDocument).then(function (result) {
                console.log('Design document created: ' + JSON.stringify(result));
            }).catch(function (err) {
                console.error('Design document not created: ' + JSON.stringify(err));
            });
        }



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
         * Create a ID based on the current data, time and a random number
         *
         * @returns {string} The ID of the database
         */
        function getID () {
            var min = 0;
            var max = 9999999999999;
            var randomSize = 13;
            var currentDateTime = moment().utc().format('YYYYMMDDHHmmssSSS');
            var randValue =  Math.floor(Math.random() * (max - min + 1)) + min;
            var zero = randomSize - randValue.toString().length + 1;
            return currentDateTime + [(+(zero > 0 && zero))].join("0") + randValue;
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
         * @param {number} setLimit Numbers of rows
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
         * Read all energy meters from the database with some filter options:
         * Only "setLimit" number of rows are read from the database.
         * If more then "setLimit" rows needed, then the it is possible
         * to skip the retrieving of the rows with "lastKeyFetched"
         *
         * @param {number} setLimit Numbers of rows
         * @param {object} lastKeyFetched The _id of a row
         *
         * @return {object} The promise of the result.
         *
         */
        function getAllEnergyMeters(setLimit, lastKeyFetched) {
            var delay = $q.defer();
            var options = {};

            options.include_docs = true;

            if (setLimit != 0) {
                options.limit = setLimit;
            }

            if (lastKeyFetched != '') {
                options.startkey = lastKeyFetched.key;
                options.endkey = ["EnergyMeter",{}, {}, {}];
                options.skip = 1;
            } else {
                options.startkey = ["EnergyMeter"];
                options.endkey = ["EnergyMeter", {}, {}, {}];
            }

            localDb.query('eccoz/allEnergyMeter', options, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        console.log('eccozDB.getAll failed -> '
                            + " | " + JSON.stringify(setLimit)
                            + " | " + JSON.stringify(lastKeyFetched) );
                        console.log('eccozDB.getAll failed <- ' + JSON.stringify(error));
                        delay.reject(error);
                    } else {
                        //console.log('eccozDB.getAll succeeded -> '
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
         * Read all data readings of one meter form the database with some filter options:
         * Only "setLimit" number of rows are read from the database.
         * If more then "setLimit" rows needed, then the it is possible
         * to skip the retrieving of the rows with "firstKeyFetched" "lastKeyFetched"
         *
         * @param {string} setSubId The _id of a meter
         * @param {number} setLimit numbers of rows
         * @param {object} firstKeyFetched The _id of a row
         * @param {object} lastKeyFetched The _id of a row
         * @param {boolean} descending sort order
         *
         * @return {object} The promise of the result.
         *
         */
        function getAllMeterReadings(setSubId, setLimit, firstKeyFetched, lastKeyFetched, descending) {
            var delay = $q.defer();
            var options = {};

            options.include_docs = true;

            if (setLimit != 0) {
                options.limit = setLimit;
            }

            options.descending = descending;


            if (firstKeyFetched != '') {
                if (options.descending === false) {
                    options.startkey = lastKeyFetched.key;
                    options.endkey = [setSubId, {}];
                    //options.skip = 1;
                } else {
                    options.startkey = lastKeyFetched.key;
                    options.endkey = [setSubId];
                    options.skip = 1;
                }
            } else {
                if (options.descending === false) {
                    options.startkey = [setSubId];
                    options.endkey = [setSubId, {}];
                } else {
                    options.startkey = [setSubId, {}];
                    options.endkey = [setSubId];
                }
            }

            localDb.query('eccoz/allMeterReading', options, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        console.log('eccozDB.getAllMeterReadings failed -> '
                            + " | " + JSON.stringify(setSubId)
                            + " | " + JSON.stringify(setLimit)
                            + " | " + JSON.stringify(firstKeyFetched)
                            + " | " + JSON.stringify(lastKeyFetched)
                            + " | " + JSON.stringify(options) );
                        console.log('eccozDB.getAllMeterReadings failed <- ' + JSON.stringify(error));
                        delay.reject(error);
                    } else {
                        //console.log('eccozDB.getAllMeterReadings succeeded -> '
                        //                                   + " | " + JSON.stringify(setSubId)
                        //                                   + " | " + JSON.stringify(setLimit)
                        //                                   + " | " + JSON.stringify(firstKeyFetched)
                        //                                   + " | " + JSON.stringify(lastKeyFetched)
                        //                                   + " | " + JSON.stringify(options) );
                        //console.log('eccozDB.getAllMeterReadings succeeded <- ' + JSON.stringify(response));
                        //console.log('eccozDB.getAllMeterReadings retrieved ' + response.rows.length + ' rows');
                        delay.resolve(response.rows);
                    }
                });
            });
            return delay.promise;
        }

        /**
         * Read all data readings of one meter form the database with some filter options:
         *
         * @param {string} setSubId The _id of a meter
         * @param {number} NoDays numbers in the diagram
         * @param {boolean} descending sort order
         *
         * @return {object} The promise of the result for the diagram
         *
         */
        function getAllMeterReadingsGraph(setSubId, NoDays, descending) {
            var delay = $q.defer();
            var options = {};

            options.include_docs = true;

            options.descending = descending;

            var CurrentDate = moment();

            var currentYear = CurrentDate.utc().format('YYYY');
            var currentMonths = CurrentDate.utc().format('MM');
            var currentDay = CurrentDate.utc().format('DD');

            CurrentDate.subtract(NoDays, 'days');

            var beforeYear = CurrentDate.utc().format('YYYY');
            var beforeMonths = CurrentDate.utc().format('MM');
            var beforeDay = CurrentDate.utc().format('DD');

            var LastKey = [currentYear, currentMonths, currentDay ];
            var FirstKey = [beforeYear, beforeMonths, beforeDay ];


            if (options.descending === false) {
                options.startkey = [setSubId, FirstKey];
                options.endkey = [setSubId, LastKey, {}];
            } else {
                options.startkey = [setSubId, LastKey, {}];
                options.endkey = [setSubId, FirstKey];
            }



            localDb.query('eccoz/allMeterReadingGraph', options, function (error, response) {
                $rootScope.$apply(function () {
                    if (error) {
                        console.log('eccozDB.allMeterReadingGraph failed -> '
                            + " | " + JSON.stringify(setSubId)
                            + " | " + JSON.stringify(NoDays)
                            + " | " + JSON.stringify(options) );
                        console.log('eccozDB.allMeterReadingGraph failed <- ' + JSON.stringify(error));
                        delay.reject(error);
                    } else {
                     //   console.log('eccozDB.allMeterReadingGraph succeeded -> '
                     //                                      + " | " + JSON.stringify(setSubId)
                     //                                      + " | " + JSON.stringify(NoDays)
                     //                                      + " | " + JSON.stringify(options) );
                     //   console.log('eccozDB.allMeterReadingGraph succeeded <- ' + JSON.stringify(response));
                     //   console.log('eccozDB.allMeterReadingGraph retrieved ' + response.rows.length + ' rows');
                        var data = response.rows;
                        var plotData = [];
                        for (var j = data.length - 1; j >= 0; j--) {
                            var currentDate = new Date(data[j].doc.inputDateTime);
                            var dateInPlotFormat = $filter('date')(currentDate, 'yyyy-MM-dd_HH:mm:ss');
                            plotData.push(
                                { 'inputDateTime': dateInPlotFormat,
                                    'readingValue': data[j].doc.readingValue}
                            );
                        }
                        delay.resolve(plotData);
                    }
                });
            });
            return delay.promise;
        }

        /**
         * Synchronization of the local and the remote pouch databases.
         */
        function syncDB() {
            var delay = $q.defer();

            // stop clock, to avoid loops.
            if (Settings.getDbSync() === true) {
                stopClock();
            }

            var localDbName = Settings.getDbName();
            var remoteDbName = Settings.getDbServerUrl() + Settings.getDbName();

            var options = {live: false};

            PouchDB.sync(localDbName, remoteDbName, options)
                .on('change', function (info) {
                    console.log('eccozDB.syncDB - change <- ' + JSON.stringify(info));
                    delay.resolve('eccozDB.syncDB - change <- ' + JSON.stringify(info));
                    if (Settings.getDbSync() === true) {
                        startClock();
                    }
                }).on('complete', function (info) {
                    console.log('eccozDB.syncDB - complete <- ' + JSON.stringify(info));
                    delay.resolve('eccozDB.syncDB - complete <- ' + JSON.stringify(info));
                    if (Settings.getDbSync() === true) {
                        startClock();
                    }
                }).on('paused', function (info) {
                    console.log('eccozDB.syncDB - paused <- ' + JSON.stringify(info));
                    delay.resolve('eccozDB.syncDB - paused <- ' + JSON.stringify(info));
                    if (Settings.getDbSync() === true) {
                        startClock();
                    }
                }).on('active', function (info) {
                    console.log('eccozDB.syncDB - active <- ' + JSON.stringify(info));
                    delay.resolve('eccozDB.syncDB - active <- ' + JSON.stringify(info));
                    if (Settings.getDbSync() === true) {
                        startClock();
                    }
                }).on('denied', function (info) {
                    console.log('eccozDB.syncDB - denied <- ' + JSON.stringify(info));
                    delay.resolve('eccozDB.syncDB - denied <- ' + JSON.stringify(info));
                    if (Settings.getDbSync() === true) {
                        startClock();
                    }
                }).on('error', function (error) {
                    console.log('eccozDB.syncDB - error <- ' + JSON.stringify(error));
                    delay.resolve('eccozDB.syncDB - error <- ' + JSON.stringify(error));
                    if (Settings.getDbSync() === true) {
                        startClock();
                    }
                });

            return delay.promise;
        }
        return service;
    }]);
