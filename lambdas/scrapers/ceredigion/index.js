const cheerio = require('cheerio')
var request = require('request');
var crypto = require('crypto');
var base_url = 'https://www.ceredigion.gov.uk/your-council/councillors-committees/councillors/';
var base_domain = 'https://www.ceredigion.gov.uk/';
var appbase_url = 'https://{credentials}@scalr.api.appbase.io/{appname}/{type}/';

const Bottleneck = require("bottleneck");
const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 200
});

request(base_url, function(error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var listOfUrls = [];
        $('.councillor-box').each(function(i, el) {
            $(this).find('a').map(function() {
                listOfUrls.push($(this).attr('href'));
            });
        })
        listOfUrls.forEach(function(url) {
            request(base_domain + url, function(error, response, html) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);
                    var tempdict = {};
                    var councillor_name = $('#mainPageTitle').text()
                    tempdict['COUNCILLOR_ID'] = crypto.createHash('md5').update(councillor_name).digest("hex");
                    tempdict['COUNCILLOR_NAME'] = councillor_name;
                    tempdict['WARD'] = $('td').filter(function() {
                        return $(this).text() === 'Ward';
                    }).next().text();
                    var keypostsSideBar = $('h3').filter(function() {
                        return $(this).text() === 'Additional Information';
                    });
                    var keyposts = [];
                    keypostsSideBar.closest('div').find('li').each(function(el) {
                        keyposts.push($(this).text());
                    });
                    var keyposts_string = keyposts.join(',');
                    tempdict['KEY_POSTS'] = keyposts_string.length > 0 ? keyposts_string : " ";
                    tempdict['COUNCIL'] = "Ceredigion";
                    var email = $('td').filter(function() {
                        return $(this).text() === 'Email';
                    }).next().text();
                    tempdict['EMAIL_ADDRESS'] = email.length > 0 ? email : " ";
                    tempdict['PARTY'] = $('td').filter(function() {
                        return $(this).text() === 'Group';
                    }).next().text();
                    tempdict['IMAGE_URL'] = base_domain + $('.main-content').find('img').first().attr('src');
                    
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
