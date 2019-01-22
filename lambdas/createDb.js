// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: 'us-east-2' });

// Create the DynamoDB service object
ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

var params = {
    AttributeDefinitions: [{
            AttributeName: 'COUNCILLOR_NAME',
            AttributeType: 'S'
        },
        {
            AttributeName: 'COUNCILLOR_ID',
            AttributeType: 'N'
        }
    ],
    KeySchema: [{
            AttributeName: 'COUNCILLOR_ID',
            KeyType: 'HASH'
        },
        {
            AttributeName: 'COUNCILLOR_NAME',
            KeyType: 'RANGE'
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    },
    TableName: 'COUNCILLOR_LIST',
    StreamSpecification: {
        StreamEnabled: false
    }
};

// Call DynamoDB to create the table
ddb.createTable(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    }
    else {
        console.log("Success", data);
    }
});

exports.handler = (event, context, callback) => {
    let response = {
        statusCode: '200',
        body: 'OK',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    callback(null, response);
}
