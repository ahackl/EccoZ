/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */
_control.controller('ExportCtrl',
    ['$scope', 'Settings', 'eccozDB',
    function ($scope, Settings, eccozDB) {

        $scope.startExport = function(){

            console.log('export started');

            var customHeaders = {Authorization: "Basic "
                + btoa(Settings.getWebDavUsername() + ":"
                    + Settings.getWebDavPassword())};

            var exportUrl = Settings.getWebDavExportUrl() + 'eccoz_meter.csv';

            var ed2 = new twoFish();


            var clientWith3Param = {
                'host': Settings.getWebDavHost(),
                'useHTTPS': Settings.getWebDavUseHttps(),
                'port': Settings.getWebDavPort(),
                'username': Settings.getWebDavUsername(),
                'password': ed2.decryptCBCMode(Settings.getLoginPattern(), Settings.getWebDavPassword(), false)};
            var client = new nl.sara.webdav.Client( clientWith3Param );

            var promiseGetAll = eccozDB.getAll('EnergyMeter', '',0,'');
            promiseGetAll.then(
                // resolve - Handler
                function (reason) {

                    var resultJSON = [];
                    var resultCSV = null;

                    for (var i=0; i<reason.length; i++) {
                        resultJSON.push(reason[i].doc);
                    };

                    var resultCSV = JSONToCSVConvertor(resultJSON,true);

                    client.put(
                        exportUrl,
                        function(status, content, headers) {

                            console.log(status);
                            console.log(content);
                            console.log(headers);

                        },resultCSV, undefined, customHeaders
                    );



                        var promiseGetAllsub = eccozDB.getAll('MeterReading','',0,'');
                        promiseGetAllsub.then(
                            function (reason) {
                                var resultJSON = [];
                                var resultCSV = null;
                                for (var i=0; i<reason.length; i++) {
                                    resultJSON.push(reason[i].doc);
                                };
                                var resultCSV = JSONToCSVConvertor(resultJSON,true);
                                var exportUrl = Settings.getWebDavExportUrl() + 'eccoz_readings.csv';
                                client.put(
                                    exportUrl,
                                    function(status, content, headers) {

                                        console.log(status);
                                        console.log(content);
                                        console.log(headers);

                                    },resultCSV, undefined, customHeaders
                                );


                            }
                        );




               },
                // reject - Handler
                function (reason) {
                    console.log(reason);
                }
            );
       };


        function JSONToCSVConvertor(JSONData, ShowLabel) {
            //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
            var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

            var CSV = '';

            //Set Report title in first row or line
            // CSV += ReportTitle + '\r\n\n';

            //This condition will generate the Label/Header
            if (ShowLabel) {
                var row = "";

                //This loop will extract the label from 1st index of on array
                for (var index in arrData[0]) {

                    //Now convert each value to string and comma-seprated
                    row += index + ',';
                }

                row = row.slice(0, -1);

                //append Label row with line break
                CSV += row + '\r\n';
            }

            //1st loop is to extract each row
            for (var i = 0; i < arrData.length; i++) {
                var row = "";

                //2nd loop will extract each column and convert it in string comma-seprated
                for (var index in arrData[i]) {
                    row += '"' + arrData[i][index] + '",';
                }

                row.slice(0, row.length - 1);

                //add a line break after each row
                CSV += row + '\r\n';
            }

            if (CSV == '') {
                return null;
            } else {
                return CSV;
            }
     }

    }]);


