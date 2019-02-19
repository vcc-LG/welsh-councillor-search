const cheerio = require('cheerio')
var request = require('request');
var crypto = require('crypto');
var base_url = 'https://www.valeofglamorgan.gov.uk/en/our_council/Council-Structure/councillors/Councillors.aspx';
var base_domain = 'https://www.valeofglamorgan.gov.uk';
const council = 'Vale of Glamorgan';
var options = {
    headers: { 'user-agent': 'node.js' }
}
var appbase_url = 'https://{credentials}@scalr.api.appbase.io/{appname}/{type}/';

const Bottleneck = require("bottleneck");
const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 200
});

request(base_url, options, function(error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var listOfUrls = [];
        $('.councillor-item').find('a').each(function(i, el) {
            listOfUrls.push($(this).attr('href'));
        });
        listOfUrls.forEach(function(url) {
            request(url, options, function(error, response, html) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);
                    var tempdict = {};

                    var councillor_name = $('h1')[2].children[0].data;
                    tempdict['COUNCILLOR_ID'] = crypto.createHash('md5').update(councillor_name).digest("hex");
                    tempdict['COUNCILLOR_NAME'] = councillor_name;

                    try {
                        tempdict['WARD'] = $('h3').filter(":contains('Ward')").text().match(/:(.*)/)[1].trim();
                    }
                    catch (error) {
                        try {
                            tempdict['WARD'] = $('p').filter(":contains('Ward')").text().match(/:(.*)/)[1].trim();
                        }
                        catch (error) {
                            console.log(url);
                            console.error(error);
                        }
                    }

                    var keyposts = $('h3').filter(":contains('Council Roles')").next().find('p').map(function(i, el) {
                        return el.children[0].data;
                    }).get().join(',');

                    tempdict['KEY_POSTS'] = (keyposts.length > 0 ? keyposts : " ");
                    tempdict['COUNCIL'] = council;

                    var email = $('#S4_EmailPlaceholder').find('a').text();
                    if (email.length == 0) {
                        email = $('.sys_Contact-icons-email').find('a').text();
                    }
                    if (email.length == 0) {
                        email = $('#S6_EmailPlaceholder').find('a').text();
                    }
                    tempdict['EMAIL_ADDRESS'] = email;

                    var party_p = $('p').filter(":contains('Party details')").next().text();
                    var party_h3 = $('h3').filter(":contains('Party details')").next().text();
                    var is_stupid_party = (party_p.length == 0 && party_h3.length == 0);
                    if ((party_p.length == 0 && party_h3.length == 0)) {
                        tempdict['PARTY'] = "Welsh Conservatives";
                    }
                    else {
                        tempdict['PARTY'] = (party_p.length > 0) ? party_p : party_h3;
                    }

                    tempdict['IMAGE_URL'] = base_domain + $('img').filter("[src*='/Images/People/Councillors']").first()[0].attribs.src;

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
