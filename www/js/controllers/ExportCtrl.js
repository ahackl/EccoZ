/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */
_control.controller('ExportCtrl',
    ['$scope', 'Settings', 'eccozDB','$translate','$filter','$sce',
    function ($scope, Settings, eccozDB, $translate, $filter, $sce) {

        $scope.renderHtml = function(html_code)
        {
            return $sce.trustAsHtml(html_code);
        };

        $scope.rainbow = new Rainbow();
        $scope.rainbow.setSpectrum('blue', 'red', 'green');


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


        function writeLog (logLevel, logText) {
            $scope.LogText += '<span style="color:#'+ $scope.rainbow.colourAt(logLevel) + '">'
                            + logText
                            + '</span>'
                            + '<br\>';
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
        };




        
        function MeterReadingsToCSV(logLevel, MeterReadings) {

            var emData = typeof MeterReadings != 'object' ? JSON.parse(MeterReadings) : MeterReadings;
            var CSV = '';
            var delimiter = Settings.getExColumnSeparator();
            var separator = Settings.getExDecimalSeparator();
            var dataTimeFormat = Settings.getExDateTimeFormat();


            // make header of file
            var headerRow = '';

            headerRow += '"ID"';
            headerRow += delimiter;
            headerRow += '"'+ $translate.instant('F_LABEL_DATE') + '"';
            headerRow += delimiter;
            headerRow += '"'+ $translate.instant('F_LABEL_READING_VALUE') + '"';

            CSV += headerRow + '\r\n';

            // convert each row
            $scope.LogText += '<span style="color:#'+ $scope.rainbow.colourAt(logLevel) + '">'
            $scope.LogText += 'Converting: ';
            for (var i = 0; i < emData.length; i++) {
                var row = '';

                if (i%50 == 0) {
                    $scope.LogText += '. ';
                }

                if (emData[i]._id) {
                    row += '"' + emData[i]._id + '"' + delimiter;
                } else {
                    row += '"'  + '"' + delimiter;
                }
                if (emData[i].inputDateTime) {
                    row += '"' + $filter('date')(emData[i].inputDateTime, dataTimeFormat)  + '"' + delimiter;
                } else {
                    row += '"'  + '"' + delimiter;
                }
                if (emData[i].readingValue) {
                    row += '"' + emData[i].readingValue.toString().replace('.',separator) + '"' ;
                } else {
                    row += '"'  + '"' ;
                }

                CSV += row + '\r\n';
            }
            $scope.LogText += '</span><br\>';

            return CSV;

        }


        function EnergyMeterToCSV(logLevel,EnergyMeterData) {

            var emData = typeof EnergyMeterData != 'object' ? JSON.parse(EnergyMeterData) : EnergyMeterData;
            var CSV = '';
            var delimiter = Settings.getExColumnSeparator();
            var separator = Settings.getExDecimalSeparator();

            // make header of file
            var headerRow = '';

            headerRow += '"ID"';
            headerRow += delimiter;
            headerRow += '"'+ $translate.instant('F_LABEL_LOCATION') + '"';
            headerRow += delimiter;
            headerRow += '"'+ $translate.instant('F_LABEL_NAME') + '"';
            headerRow += delimiter;
            headerRow += '"'+ $translate.instant('F_LABEL_NUMBER') + '"';
            headerRow += delimiter;
            headerRow += '"'+ $translate.instant('F_LABEL_COMMENT') + '"';
            headerRow += delimiter;
            headerRow += '"'+ $translate.instant('F_LABEL_UNIT') + '"';
            headerRow += delimiter;
            headerRow += '"'+ $translate.instant('F_LABEL_UNITPRICE') + '"';;

            CSV += headerRow + '\r\n';

            // convert each row
            $scope.LogText += '<span style="color:#'+ $scope.rainbow.colourAt(logLevel) + '">'
            $scope.LogText += 'Converting: ';
            for (var i = 0; i < emData.length; i++) {
                var row = '';

                if (i%50 == 0) {
                    $scope.LogText += '. ';
                }

                if (emData[i]._id) {
                    row += '"' + emData[i]._id + '"' + delimiter;
                } else {
                    row += '"'  + '"' + delimiter;
                }
                if (emData[i].location) {
                    row += '"' + emData[i].location + '"' + delimiter;
                } else {
                    row += '"'  + '"' + delimiter;
                }
                if (emData[i].name) {
                    row += '"' + emData[i].name + '"' + delimiter;
                } else {
                    row += '"'  + '"' + delimiter;
                }
                if (emData[i].number) {
                    row += '"' + emData[i].number + '"' + delimiter;
                } else {
                    row += '"'  + '"' + delimiter;
                }
                if (emData[i].comment) {
                    row += '"' + emData[i].comment + '"' + delimiter;
                } else {
                    row += '"'  + '"' + delimiter;
                }
                if (emData[i].unit) {
                    row += '"' + emData[i].unit + '"' + delimiter;
                } else {
                    row += '"'  + '"' + delimiter;
                }
                if (emData[i].unitPrice) {
                    row += '"' + emData[i].unitPrice.toString().replace('.',separator) + '"';
                } else {
                    row += '"'  + '"';
                }



                CSV += row + '\r\n';
            }
            $scope.LogText += '<\span><br\>';

            return CSV;

        }






    }]);


