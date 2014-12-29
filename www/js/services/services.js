/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

var _service = angular.module('eccoz.services', []);

/**
 * Set some constant values.
 */
_service.constant('dbConfig', {
    dbName: 'eccozdb15',
    dbServer: 'http://localhost:5984/',
    dbDesign: '_design/eccoz',
    dbSync: true
});

/**
 * Make PouchDB available in AngularJS.
 */
_service.factory('db', ['dbConfig', function (dbConfig) {
    PouchDB.enableAllDbs = true;
    //PouchDB.debug.enable('*');
    // for release:
    PouchDB.debug.disable();

    var localDb = new PouchDB(dbConfig.dbName, {adapter: 'websql'});
    if (!localDb.adapter) {
        localDb = new PouchDB(dbConfig.dbName);
    }

    var remoteDb = dbConfig.dbServer + dbConfig.dbName;
    var options = {live: true};
    var syncError = function () {
        console.log('Problem encountered during database synchronisation');
    };

    if (dbConfig.dbSync == true) {
        console.log('Replicating from local to server');
        localDb.replicate.to(remoteDb, options, syncError);

        console.log('Replicating from server back to local');
        localDb.replicate.from(remoteDb, options, syncError);

    }


    // check database design
    localDb.get(dbConfig.dbDesign, {}, function (error, response) {
            if (error) {
                console.log(error);
                var DesignDocument = {
                    _id: dbConfig.dbDesign,
                    language: 'javascript',
                    views: { all: { map: 'function(doc) {  emit([doc.type, doc.EnergyMeter_id, doc._id])}' } }
                };
                localDb.put(DesignDocument, function (error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(response);
                    };
                });
            } else {
                console.log(response);
            }

        });


    return localDb;

}]);


_service.factory('eccozDB', ['$q', 'db', '$rootScope', 'dbConfig',
    function ($q, db, $rootScope, dbConfig) {
        return {
            updateOne: function (database) {
                var delay = $q.defer();
                db.put(database, function (error, response) {
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
            },
            deleteOne: function (item) {                                                                                                    //
                var delay = $q.defer();

                db.remove(item.doc._id, item.doc._rev, function (error, response) {
                    $rootScope.$apply(function () {
                        if (error) {
                            delay.reject(error);
                        } else {
                            delay.resolve(response);
                        }

                    });
                });

                return delay.promise;
            },
            getOne: function (item_id) {
                var delay = $q.defer();
                var options = {};

                db.get(item_id, options, function (error, response) {
                    $rootScope.$apply(function () {
                        if (error) {
                            delay.reject(error);
                        } else {
                            delay.resolve(response);
                        }

                    });
                });

                return delay.promise;
            },
            getAll: function (setTypeName, setSubId, setLimit, lastKeyFetched) {
                var delay = $q.defer();
                var options = {};
                var map = null;

                options.include_docs = true;

                if (setLimit != 0) {
                    options.limit = setLimit;
                }

                //map = function (doc) {
                //    emit([doc.type, doc.EnergyMeter_id, doc._id]);
                //};


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


                // db.query({map: map}, options, function(error, response) {
                db.query('eccoz/all', options, function (error, response) {
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
            },
            sync: function () {
                if (dbConfig.dbSync == true) {
                    var remoteDb = dbConfig.dbServer + dbConfig.dbName;
                    var options = {live: true};
                    var syncError = function (error, changes) {
                        console.log('Problem encountered during database synchronisation');
                        console.log(error);
                        console.log(changes);
                    };
                    var syncSuccess = function (error, changes) {
                        console.log('Sync success');
                        console.log(error);
                        console.log(changes);
                    };

                    console.log('Replicating from local to server');
                    db.replicate.to(remoteDb, options, syncError).
                        on('error', syncError).
                        on('complete', syncSuccess);

                    console.log('Replicating from server back to local');
                    db.replicate.from(remoteDb, options, syncError);
                }
            }
        };
    }]);

