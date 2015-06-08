/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */
_control.controller('ExportCtrl',
    ['$scope', 'Settings', 'eccozDB','$translate','$filter','$sce','$q',
    function ($scope, Settings, eccozDB, $translate, $filter, $sce, $q) {

        $scope.renderHtml = function(html_code)
        {
            return $sce.trustAsHtml(html_code);
        };

        $scope.rainbow = new Rainbow();
        $scope.rainbow.setSpectrum('blue', 'red', 'green');


        $scope.startSync = function(){
            $scope.LogText = ''
            var promiseSync =  eccozDB.syncDB();
            promiseSync.then(
                // resolve - Handler
                function (resolve) {
                    writeLog(0, resolve);
                },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                }
            );
        }



        $scope.startEmail = function() {

            $scope.LogText = '';

            var promiseMakeCSV = readEnergyMeterCSV();
            promiseMakeCSV.then(
                // resolve - Handler
                function (EnergyMeterCSV) {

                    var promiseMakeCSV_1 = readMeterReadingsCSV();
                    promiseMakeCSV_1.then(
                        // resolve - Handler
                        function (resolve) {
                            console.log(resolve);
                        },
                        // reject - Handler
                        function (reason) {
                            console.log(reason);
                        }
                    );
                    // sendEmail(EnergyMeterCSV);
                },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                }
            );
        };

        function readEnergyMeterCSV () {
            var delay = $q.defer();

            writeLog(0,'Read rows from table EnergyMeter');

            var promiseGetAll = eccozDB.getAll('EnergyMeter', '',0,'');
            promiseGetAll.then(
                // resolve
                function (EnergyMeter) {

                    writeLog(0, EnergyMeter.length.toString() + ' rows found');

                    if (EnergyMeter.length > 0 ) {
                        var resultJSON = [];
                        $scope.rainbow.setNumberRange(0, EnergyMeter.length);
                        for (var i=0; i<EnergyMeter.length; i++) {
                            resultJSON.push(EnergyMeter[i].doc);
                        }
                        delay.resolve(EnergyMeterToCSV(0,resultJSON));
                    }

                },
                // reject
                function (reason) {
                    delay.reject(reason);
                }
            );
            return delay.promise;
        }


        function readMeterReadingsCSV () {
            var delay = $q.defer();

            writeLog(0,'Read rows from table EnergyMeter');

            var promiseGetAll = eccozDB.getAll('EnergyMeter', '',0,'');
            promiseGetAll.then(
                // resolve
                function (EnergyMeter) {
                    var promiseList = [];
                    writeLog(0, EnergyMeter.length.toString() + ' rows found');

                    for (var i=0; i<EnergyMeter.length; i++) {
                        writeLog(i + 1, 'Read rows for ' + EnergyMeter[i].id);
                        promiseList.push(eccozDB.getAllMeterReadings(EnergyMeter[i].id, '', '', '', true));
                    }
                    $q.all(promiseList).then(function (data) {
                        delay.resolve(data);
                    });
                },
                // reject
                function (reason) {
                    delay.reject(reason);
                }
            );
            return delay.promise;
        }









                $scope.startExport = function(){
                    $scope.LogText = '';

                    writeLog(0,'Read rows from table EnergyMeter');

                    var promiseGetAll = eccozDB.getAll('EnergyMeter', '',0,'');
                    promiseGetAll.then(
                        // resolve - Handler
                        function (EnergyMeter) {

                            var resultJSON = [];
                            var resultCSV = '';

                            $scope.EnergyMeterList = EnergyMeter;

                            writeLog(0, EnergyMeter.length.toString() + ' rows found');


                            if (EnergyMeter.length > 0 ) {
                                $scope.rainbow.setNumberRange(0, EnergyMeter.length);
                                for (var i=0; i<EnergyMeter.length; i++) {
                                    resultJSON.push(EnergyMeter[i].doc);
                                };
                                var resultCSV = EnergyMeterToCSV(0,resultJSON);
                                sendDataToFile(0,'eccoz_meter',resultCSV);
                            }

                            for (var i=0; i<EnergyMeter.length; i++) {

                                writeLog(i+1, 'Read rows for ' + EnergyMeter[i].id);


                                var promiseGetAllsub = eccozDB.getAllMeterReadings(EnergyMeter[i].id, '', '', '', true);
                                promiseGetAllsub.then(
                                    function (MeterReadings) {
                                        var resultJSON = [];
                                        var resultCSV = '';
                                        var logIndex = 0;
                                        if (MeterReadings.length > 0) {
                                            for (var i = 0; i < $scope.EnergyMeterList.length; i++) {
                                                if ($scope.EnergyMeterList[i].id == MeterReadings[0].doc.EnergyMeter_id) {
                                                    logIndex = i;
                                                }
                                            }
                                        }
                                        writeLog(logIndex+1, MeterReadings.length + ' rows found');

                                        if (MeterReadings.length > 0) {
                                            for (var i=0; i<MeterReadings.length; i++) {
                                                resultJSON.push(MeterReadings[i].doc);
                                            };
                                            var resultCSV = MeterReadingsToCSV(logIndex+2,resultJSON);
                                            sendDataToFile(logIndex+2, MeterReadings[0].doc.EnergyMeter_id,resultCSV);
                                        }
                                    },
                                    function (reason) {
                                        console.log(reason);
                                    });
                            };

                       },
                        // reject - Handler
                        function (reason) {
                            console.log(reason);
                        }
                    );
               };







        function sendDataToFile(logLevel, fileName, csvData) {

            var exportUrl = makeExportURL(logLevel, fileName);

            writeLog(logLevel, 'File transfer started');
            writeLog(logLevel, 'Username: ' + Settings.getWebDavUsername());
            writeLog(logLevel, 'Password: ' + Settings.getWebDavPassword().slice(0,2)+ '...');

            try {
                var customHeaders = {Authorization: "Basic " +
                    btoa(Settings.getWebDavUsername() + ":" + Settings.getWebDavPassword())};
            } catch (e) {
                writeLog(logLevel, e.message);
                writeLog(logLevel, 'File transfer stopped');
                return;
            }

            var clientWith3Param = {
                'host': Settings.getWebDavHost(),
                'useHTTPS': Settings.getWebDavUseHttps(),
                'port': Settings.getWebDavPort(),
                'username': Settings.getWebDavUsername(),
                'password': Settings.getWebDavPassword()};
            var client = new nl.sara.webdav.Client( clientWith3Param );

            client.put(
                exportUrl,
                function(status, content, headers) {
                    writeLog(logLevel, 'Status: ' + status );
                    writeLog(logLevel, 'Message: ' + JSON.stringify(content) );

                    if (status == 201 || status == 204) {
                        writeLog(logLevel, 'File transfer completed' );
                    }
                },
                csvData,
                undefined,
                customHeaders);
        }



        function makeExportURL(logLevel, fileName){
            var exportUrl = Settings.getWebDavExportUrl() + fileName + '.' + Settings.getExFileExtension();

            var logText = '' ;
            logText += 'URL: ';
            logText += 'http://';
            logText += Settings.getWebDavHost();
            logText += ':';
            logText += Settings.getWebDavPort();
            logText += exportUrl;
            writeLog(logLevel, logText );

            return exportUrl;
        }


        /**
         * Write a line to the event log.
         * The color of the text depends on the variable textColor
         *
         * @param {number} textColor The color of the text
         * @param {string} logText The output text
         *
         */
        function writeLog (textColor, logText) {
            $scope.LogText += '<span style="color:#'
                + $scope.rainbow.colourAt(textColor) + '">'
                + logText
                + '</span>'
                + '<br\>';
        };


        /**
         * Convert array of MeterReadings to a CSV string
         *
         * @param {number} textColor The color of the log text
         * @param {object} MeterReadings The Array of the data.
         *
         * @return {string} The CSV string
         *
         */
        function MeterReadingsToCSV(textColor, MeterReadings) {

            var emData = typeof MeterReadings != 'object' ? JSON.parse(MeterReadings) : MeterReadings;
            var CSV = '';
            var columnSeparator = Settings.getExColumnSeparator();
            var decimalSeparator = Settings.getExDecimalSeparator();
            var dataTimeFormat = Settings.getExDateTimeFormat();


            // header of file
            var headerRow = '';

            headerRow += '"ID"';
            headerRow += columnSeparator;
            headerRow += '"'+ $translate.instant('F_LABEL_DATE') + '"';
            headerRow += columnSeparator;
            headerRow += '"'+ $translate.instant('F_LABEL_READING_VALUE') + '"';

            CSV += headerRow + '\r\n';

            // convert each row
            $scope.LogText += '<span style="color:#'+ $scope.rainbow.colourAt(textColor) + '">';
            $scope.LogText += 'Converting: ';

            for (var i = 0; i < emData.length; i++) {
                var row = '';

                if (i%50 == 0) {
                    $scope.LogText += '. ';
                }

                if (emData[i]._id) {
                    row += '"' + emData[i]._id + '"' + columnSeparator;
                } else {
                    row += '"'  + '"' + columnSeparator;
                }
                if (emData[i].inputDateTime) {
                    row += '"' + $filter('date')(emData[i].inputDateTime, dataTimeFormat)  + '"' + columnSeparator;
                } else {
                    row += '"'  + '"' + columnSeparator;
                }
                if (emData[i].readingValue) {
                    row += '"' + emData[i].readingValue.toString().replace('.',decimalSeparator) + '"' ;
                } else {
                    row += '"'  + '"' ;
                }

                CSV += row + '\r\n';
            }
            $scope.LogText += '</span><br\>';

            return CSV;

        }


        /**
         * Convert array of EnergyMeterData to a CSV string
         *
         * @param {number} textColor The color of the log text
         * @param {object} EnergyMeterData The Array of the data.
         *
         * @return {string} The CSV string
         *
         */
        function EnergyMeterToCSV(textColor, EnergyMeterData) {

            var emData = typeof EnergyMeterData != 'object' ? JSON.parse(EnergyMeterData) : EnergyMeterData;
            var CSV = '';
            var columnSeparator = Settings.getExColumnSeparator();
            var decimalSeparator = Settings.getExDecimalSeparator();

            // header of file
            var headerRow = '';

            headerRow += '"ID"';
            headerRow += columnSeparator;
            headerRow += '"'+ $translate.instant('F_LABEL_LOCATION') + '"';
            headerRow += columnSeparator;
            headerRow += '"'+ $translate.instant('F_LABEL_NAME') + '"';
            headerRow += columnSeparator;
            headerRow += '"'+ $translate.instant('F_LABEL_NUMBER') + '"';
            headerRow += columnSeparator;
            headerRow += '"'+ $translate.instant('F_LABEL_COMMENT') + '"';
            headerRow += columnSeparator;
            headerRow += '"'+ $translate.instant('F_LABEL_UNIT') + '"';
            headerRow += columnSeparator;
            headerRow += '"'+ $translate.instant('F_LABEL_NO_DAYS') + '"';

            CSV += headerRow + '\r\n';

            // convert each row
            $scope.LogText += '<span style="color:#'+ $scope.rainbow.colourAt(textColor) + '">';
            $scope.LogText += 'Converting: ';

            for (var i = 0; i < emData.length; i++) {
                var row = '';

                if (i%50 == 0) {
                    $scope.LogText += '. ';
                }

                if (emData[i]._id) {
                    row += '"' + emData[i]._id + '"' + columnSeparator;
                } else {
                    row += '"'  + '"' + columnSeparator;
                }
                if (emData[i].location) {
                    row += '"' + emData[i].location + '"' + columnSeparator;
                } else {
                    row += '"'  + '"' + columnSeparator;
                }
                if (emData[i].name) {
                    row += '"' + emData[i].name + '"' + columnSeparator;
                } else {
                    row += '"'  + '"' + columnSeparator;
                }
                if (emData[i].number) {
                    row += '"' + emData[i].number + '"' + columnSeparator;
                } else {
                    row += '"'  + '"' + columnSeparator;
                }
                if (emData[i].comment) {
                    row += '"' + emData[i].comment + '"' + columnSeparator;
                } else {
                    row += '"'  + '"' + columnSeparator;
                }
                if (emData[i].unit) {
                    row += '"' + emData[i].unit + '"' + columnSeparator;
                } else {
                    row += '"'  + '"' + columnSeparator;
                }
                if (emData[i].nodays) {
                    row += '"' + emData[i].nodays + '"' + columnSeparator;
                } else {
                    row += '"'  + '"' + columnSeparator;
                }

                CSV += row + '\r\n';
            }
            $scope.LogText += '<\span><br\>';

            return CSV;
        }


        /**
         * Send a email with the CSV files as attachments
         *
         * @param {string} EnergyMeterCSV The content of the file
         *
         */
       function sendEmail (EnergyMeterCSV){

            window.cordova.plugins.email.isAvailable(
                function (isAvailable) {
                    //alert('Service is not available') unless isAvailable;
                    console.log(isAvailable);

                    if (isAvailable == true) {

                        var properties = {
                            subject: 'EccoZ - export',
                            attachments: 'base64:icon.csv//' + btoa(EnergyMeterCSV)
                        };

                        window.cordova.plugins.email.open(properties, function () {
                            console.log('email view dismissed');
                        }, this);

                    }


                }
            );

        }




    }]);


