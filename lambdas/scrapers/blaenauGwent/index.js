const cheerio = require('cheerio')
var request = require('request');
var crypto = require('crypto');
var base_url = 'https://www.blaenau-gwent.gov.uk/en/council/councillors-and-committees/councillor-directory';
var base_domain = 'https://www.blaenau-gwent.gov.uk';
const council = 'Blaenau Gwent';
var appbase_url = 'https://{credentials}@scalr.api.appbase.io/{appname}/{type}/';

var options = {
    headers: { 'user-agent': 'node.js' }
}

const Bottleneck = require("bottleneck");
const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 200
});

request(base_url, options, function(error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var listOfUrls = [];
        $('[role=main]').find('a').each(function(i, el) {
            listOfUrls.push($(this).attr('href'));
        });
        
        listOfUrls.forEach(function(url) {
            request(base_domain + url, options, function(error, response, html) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);
                    var tempdict = {};

                    var councillor_name = $('h1').first().text();
                    tempdict['COUNCILLOR_ID'] = crypto.createHash('md5').update(councillor_name).digest("hex");
                    tempdict['COUNCILLOR_NAME'] = councillor_name;

                    tempdict['WARD'] = $('p').filter(":contains('Ward')").text().match(/:(.*)/)[1].trim();

                    tempdict['KEY_POSTS'] = " ";

                    tempdict['COUNCIL'] = council;

                    tempdict['EMAIL_ADDRESS'] = $('p').filter(":contains('Email')").text().match(/:(.*)/)[1].trim();

                    tempdict['PARTY'] = $('p').filter(":contains('Party')").text().match(/:(.*)/)[1].trim();

                    tempdict['IMAGE_URL'] = base_domain + $('.ce-media').find('img').first()[0].attribs.src;

                    var options = {
                        url: appbase_url + tempdict['COUNCILLOR_ID'],
                        method: 'PUT',
                        body: JSON.stringify(tempdict)
                    };

                    limiter.submit(request, options, function callback(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log(body);
                        }
                        else {
                            console.log("error: ", body);
                        }
                    });
                }
                else {
                    console.log(error);
                }
            })
        });
    }
    else {
        console.log("couldnt reach website");
        console.log(error);
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
