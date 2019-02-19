"use strict";

const request = require('request');
var crypto = require('crypto');
var councilhashtables = require('./council_list.json');
var parseString = require('xml2js').parseString;
var appbase_url = 'https://{credential}@scalr.api.appbase.io/{appname}/{type}/';

exports.handler = (event, context, callback) => {
    councilhashtables.council_list.forEach(function(council) {
        var url = council.url;
        var council_name = council.council_name;
        console.log('processing: ', council_name);

        request(url, function(error, response, body) {
            if (error) {
                console.log('error processing ', council_name);
                console.log('error:', error);
                callback(error);
            }
            if (response.statusCode != 200) {
                console.log('statusCode:', response && response.statusCode); 
                callback(response.statusCode + ' ' + response.statusText)
            }
            if (response.statusCode == 200) {
                console.log('status 200 for ', council_name);
                parseString(body, function(err, result) {
                    if (err) console.log('xml err:', err);
                    var listOfDicts = [];
                    result.councillorsbyward.wards.forEach(
                        function(x) {
                            x.ward.forEach(function(y) {
                                for (var i = 0; i < y.councillors[0].councillor.length; i++) {
                                    try {
                                        var tempdict = {};
                                        var councillor = y.councillors[0].councillor[i];
                                        var councillor_name = councillor.fullusername[0];
                                        tempdict['COUNCILLOR_NAME'] = councillor_name;
                                        var councillor_name_hash = crypto.createHash('md5').update(councillor_name).digest("hex");
                                        tempdict['COUNCILLOR_ID'] = councillor_name_hash;
                                        tempdict['WARD'] = (isValid(y.wardtitle) ? y.wardtitle[0] : " ");
                                        tempdict['KEY_POSTS'] = (isValid(councillor.keyposts) ?
                                            (councillor.keyposts[0] == '\r\n          ' ? " " : councillor.keyposts[0]) : " ");
                                        tempdict['COUNCIL'] = council_name;
                                        tempdict['EMAIL_ADDRESS'] = (isValid(councillor.workaddress[0].email) ? councillor.workaddress[0].email[0] : " ");
                                        tempdict['PARTY'] = councillor.politicalpartytitle[0];
                                        tempdict['IMAGE_URL'] = councillor.photosmallurl[0];
                                        listOfDicts.push(tempdict);
                                    }
                                    catch (err) {
                                        console.log("error creatin dict: ", err);
                                    }
                                }

                            })
                        }
                    );
                    
                    listOfDicts.forEach(function(record, index) {
                        setTimeout(function() {
                            var options = {
                                url: appbase_url + record['COUNCILLOR_ID'],
                                method: 'PUT',
                                body: JSON.stringify(record)
                            };
                            request(options, function callback(error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    console.log(body);
                                }
                                else {
                                    console.log("error: ", body);
                                }
                            });
                        }, (index +1)* 500);
                    });
                });
            }
            console.log('completed ', council_name);
        });
    })

    let response = {
        statusCode: '200',
        body: 'OK',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    callback(null, response);
};
