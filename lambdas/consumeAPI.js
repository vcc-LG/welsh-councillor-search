"use strict";

const request = require('request');
var parseString = require('xml2js').parseString;
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

var councilhashtables = [{
        url: 'http://democracy.swansea.gov.uk/mgWebService.asmx/GetCouncillorsByWard',
        council_name: 'Swansea'
    },
    {
        url: 'http://cardiff.moderngov.co.uk/mgWebService.asmx/GetCouncillorsByWard',
        council_name: 'Cardiff'
    },
    {
        url: 'http://modgoveng.conwy.gov.uk/mgWebService.asmx/GetCouncillorsByWard',
        council_name: 'Conwy'
    }
    /* TODO: Fill in the remaining APIs and/or move to external .txt file */
];

/* Checks if SOAP body is empty */
function isValid(x) {
    return (Array.isArray(x) && x.length > 0);
}

/* This runs when the Lambda function is triggered */
exports.handler = (event, context, callback) => {
    councilhashtables.forEach(function(council) {
        var url = council.url;
        var council_name = council.council_name;
        request(url, function(error, response, body) {
            if (error) {
                console.log('error:', error);
                callback(error);
            }
            if (response.statusCode != 200) {
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                callback(response.statusCode + ' ' + response.statusText)
            }
            if (response.statusCode == 200) {
                parseString(body, function(err, result) {
                    if (err) console.log('xml err:', err);
                    
                    var listOfDicts = [];
                    var count = 1;

                    result.councillorsbyward.wards.forEach(
                        function(x) {
                            x.ward.forEach(function(y) {
                                var tempdict = {};
                                y.councillors.forEach(function(councillor) {
                                    if (isValid(councillor.councillor[0].fullusername)) {
                                        tempdict['COUNCILLOR_NAME'] = councillor.councillor[0].fullusername[0];
                                        tempdict['COUNCILLOR_ID'] = count.toString();
                                        tempdict['WARD'] = (isValid(y.wardtitle) ? y.wardtitle[0] : " ");
                                        tempdict['KEY_POSTS'] = (isValid(councillor.councillor[0].keyposts) ?
                                            (councillor.councillor[0].keyposts[0] == '\r\n          ' ? " " : councillor.councillor[0].keyposts[0]) : " ");
                                        tempdict['COUNCIL'] = council_name;
                                        tempdict['EMAIL_ADDRESS'] = (isValid(councillor.councillor[0].workaddress[0].email) ? councillor.councillor[0].workaddress[0].email[0] : " ");
                                        tempdict['PARTY'] = councillor.councillor[0].politicalpartytitle[0];
                                        listOfDicts.push(tempdict);
                                        count++;
                                    }
                                })
                            })
                        }
                    );

                    var ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

                    listOfDicts.forEach(function(item) {
                        var params = {
                            TableName: 'COUNCILLOR_LIST',
                            Item: {
                                "COUNCILLOR_ID": { "N": item.COUNCILLOR_ID },
                                "COUNCILLOR_NAME": { "S": item.COUNCILLOR_NAME },
                                "WARD": { "S": item.WARD },
                                "KEY_POSTS": { "S": item.KEY_POSTS },
                                "COUNCIL": { "S": item.COUNCIL },
                                "EMAIL_ADDRESS": { "S": item.EMAIL_ADDRESS },
                                "PARTY": { "S": item.PARTY }

                            }
                        };

                        ddb.putItem(params, function(err, data) {
                            if (err) {
                                console.log("Error", err);
                            }
                            else {
                                console.log("Success", data);
                            }
                        });
                    });


                });
            }
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
