const cheerio = require('cheerio')
var request = require('request');
var crypto = require('crypto');
var base_url = 'https://www.rctcbc.gov.uk/EN/Council/CouncillorsCommitteesandMeetings/Councillors/Councillors.aspx';
var base_domain = 'https://www.rctcbc.gov.uk';
var appbase_url = 'https://{credentials}@scalr.api.appbase.io/{appname}/{type}/';
const Bottleneck = require("bottleneck");
const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 200
});
function capitalize_Words(str)
{
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

request(base_url, function(error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var listOfUrls = [];

        $("a[id*='CouncillorsListingByName_Item']").each(function(i, el) {
            listOfUrls.push($(this).attr('href'));
        })

        listOfUrls.forEach(function(url) {
            request(base_domain + url, function(error, response, html) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);
                    var tempdict = {};

                    var councillor_name = $('h1').first().text();
                    tempdict['COUNCILLOR_NAME'] = councillor_name;

                    tempdict['COUNCILLOR_ID'] = crypto.createHash('md5').update(councillor_name).digest("hex");

                    try {
                        var ward = capitalize_Words($('dd[class=sys_councillor-profile]').text().toLowerCase().match(/representing(.*)ward/)[1].trim().toString());
                    }
                    catch (error) {
                        console.log(url);
                        console.error(error);
                    }

                    tempdict['WARD'] = (ward != undefined && ward.length > 0) ? ward : " ";

                    tempdict['KEY_POSTS'] = $('.sys_record-info-items').find('li').find('a').map(function(i, el) {
                        return el.children[0].data;
                    }).get().join(',');

                    tempdict['COUNCIL'] = "Rhondda Cynon Taf";

                    var email = $('li').find('strong').filter(":contains('Email')").next()[0].children[0].data;
                    tempdict['EMAIL_ADDRESS'] = (email != undefined && email.length > 0) ? email : " ";

                    tempdict['PARTY'] = $('dd[class=sys_councillor-party]')[0].children[0].data;

                    tempdict['IMAGE_URL'] = base_domain + $('img[class=floatImageLeft]')[0].attribs.src;

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
            })
        });
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
