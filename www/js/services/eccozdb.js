/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

/**
 * Make PouchDB available in AngularJS.
 */
_service.factory('db', ['Settings', function (Settings) {

    var localDb = new PouchDB(Settings.getDbName());

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
    }).catch(function(err){
        if (err.status === 404) {
            console.log('Setting document not available -> create it');
            var dbSettingsDocument = Settings.getDbObject();
            localDb.put(dbSettingsDocument).then(function (result) {
                console.log('Setting document created: ' + result.toString());
                Settings.set_rev(result.rev);
            }).catch(function (err) {
                console.error('Setting document not created: ' + err.toString());
            });
        } else {
            console.error(err.toString());
        };
    });

    return localDb;

}]);


_service.factory('eccozDB', ['$q', 'db', '$rootScope', 'Settings',
    function ($q, db, $rootScope, Settings) {
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
                if (Settings.getDbSync() == true) {
                    var remoteDb = Settings.getDbServer() + Settings.getDbName();
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

