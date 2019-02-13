# Introduction

A few weeks ago I was asked on the [Cardiff Sustainibility Slack](https://suscardiffslack.herokuapp.com/) whether there was a central location on which to search for Welsh councillor information. I had a look around and found that while there were individual council pages which listed their councillors (e.g. [here](http://cardiff.moderngov.co.uk/mgMemberIndex.aspx?FN=ALPHA&VW=LIST&PIC=0)), there was no single location where I could search _all_ councillors by, say, party or ward. 

I first considered tackling the problem by writing page scrapers for the individual council sites, but with a total of 22 (I think) councils in Wales this felt like a very time consuming approach. Plus page scrapers are often fragile, with even small layout changes on the page causing erroneous or absent data. 

I then thought that the data could be crowdsourced into a giant Google Sheet: delegating a few wards to lots of people to populate the spreadsheet by hand. However, whenever there was an election or change in council membership the Sheet would need repopulating by hand which would require a level of commitment from its contributors which was probably unrealistic. 

So I set about asking around if anyone had any information on whether there was a site I'd overlooked and, if not, if there was a specific reason why the data wasn't collated. Presumably there was a database or Excel spreadsheet sitting somewhere just waiting to be opened up to the public.

I tweeted the Welsh Assembly ([@AssemblyWales](https://twitter.com/AssemblyWales)) to ask if a central location existed and received this reply:

>I’m afraid we know of no available list of all councillors, however they should all be readily available on each council’s individual website 

I then emailed the [Welsh Local Government Authority](https://www.wlga.gov.uk/) with the same question and, in summary, was told:

* Whilst they do hold a list of the councillors across Wales, this isn’t something they are able to share due to GDPR. Specifically the contact details they hold contain a mixture of work and personal e-mail addresses some of which is not available to the public. As consent has not been given for those details to be shared, they do not have a legal basis for sharing.
* The easiest way to get the information is to e-mail the Democratic Services team in each LA.
* Their list is scraped from the council's websites at the time of the last local elections so may not be 100% accurate.
* They do not hold data broken down by who represents which ward.
* (From the WLGA Data Protection Officer): The only way of collecting this information is for an individual to contact each local authority to ascertain the accurate and up to date information they hold.

So, a little disheartening and quite surprising. The WLGA had page scrapers to periodically collect data, but it was probably out of date, and the data itself didn't even collect the ward name, without which the data is not exactly helpful.

I asked around on the [Cardiff Developer Slack](cardiffdev.herokuapp.com) and was pointed in the direction of the [Democracy Club](https://democracyclub.org.uk/) by a friendly user who worked for [mySociety](https://www.mysociety.org/). On the Democracy Club's [GitHub profile](https://github.com/DemocracyClub) is a repo called [LGSF](https://github.com/DemocracyClub/LGSF) which stands for Local Government Scraper Framework, which is described as a set of scrapers of local government websites, but most of the Python files generally seem to take the format of:

```
from lgsf.scrapers.councillors import ModGovCouncillorScraper

class Scraper(ModGovCouncillorScraper):
    base_url = "http://cardiff.moderngov.co.uk"
```

which clearly wasn't scraping pages from the Cardiff council website but consuming an API. The API framework's [website](https://www.moderngov.co.uk/) doesn't seem to go into detail about the specific case for open government data, but clearly this product is in common usage, and is available on the gov.uk [Digital Marketplace](https://www.digitalmarketplace.service.gov.uk/g-cloud/services/364588144872148). 

A contributor to the repo, [symroe](https://github.com/symroe), had a clearer look at the endpoints of the API in his [CouncillorData repo](https://github.com/symroe/CouncillorData), which included:

* GetCouncillorsByPostcode
* GetCouncillorsByWard
* GetCouncillorsByWardId

found at `[domain]/mgWebService.asmx/[endpoint_name]`, e.g. [http://cardiff.moderngov.co.uk/mgWebService.asmx/GetCouncillorsByWard](http://cardiff.moderngov.co.uk/mgWebService.asmx/GetCouncillorsByWard). 

I was interested in who maintained the API, so I emailed Cardiff Council and learned that:

- Modern.Gov produced the API, however the data it displays is pulled from the Cardiff Council Modern.Gov system which is maintained by the Democratic Services department, ensuring the data is up to date.
- The API itself is not actively maintained. 

I also asked why the API wasn't promoted anywhere on the Council website, to which I didn't receive a direct response but:

>In terms of your suggestion regarding promoting the API on the main Council webpage, I have written to colleagues in FOI/ICT as they have responsibility for this.  Democratic Services have no objection to promoting the API as you suggest.

which was a nice bit of news to end the week.

# Available APIs

So how well covered are the wards within the [eight Welsh counties](https://en.wikipedia.org/wiki/List_of_electoral_wards_in_Wales) by the APIs listed in the [LGSF repo](https://github.com/DemocracyClub/LGSF/tree/master/scrapers) and in the [CouncillorData repo](https://github.com/symroe/CouncillorData/blob/master/urls.txt)? 

| Council        | Has API?           | URL  |
| ------------- |:-------------:| -----:|
| Conwy     | Yes| modgoveng.conwy.gov.uk |
| Denbighshire      | Yes      |   moderngov.denbighshire.gov.uk |
| Flintshire | Yes     |    cyfarfodyddpwyllgor.siryfflint.gov.uk |
| Wrexham     | Yes| moderngov.wrexham.gov.uk |
| Carmarthenshire     | Yes| democracy.carmarthenshire.gov.wales |
| Pembrokeshire     | Yes| mgenglish.pembrokeshire.gov.uk|
| Caerphilly     | Yes| democracy.caerphilly.gov.uk|
| Monmouthshire     | Yes| democracy.monmouthshire.gov.uk|
| Newport     | Yes| democracy.newport.gov.uk |
| Torfaen     | Yes| moderngov.torfaen.gov.uk |
| Gwynedd     | Yes| democracy.cyngor.gwynedd.gov.uk |
| Ynys Mon     | Yes| democratiaeth.ynysmon.gov.uk |
| Bridgend     | Yes| democratic.bridgend.gov.uk |
| Powys     | Yes| powys.moderngov.co.uk|
| Cardiff     | Yes| cardiff.moderngov.co.uk |
| Swansea     | Yes| democracy.swansea.gov.uk |
| Merthyr Tydfil     | Yes| democracy.merthyr.gov.uk |
| Neath Port Talbot     | Yes| democracy.npt.gov.uk |
| Ceredigion    | No| -|
| Blaenau Gwent     | No| -|
| Rhondda Cynon Taf     | No| - |
| Vale of Glamorgan    | No| - |

I contacted the four outstanding councils that seemingly did not use the moderngov.* or democracy.* domains for open data APIs. 

* Ceredigion
>"Ceredigion County Council does not have an API at present.  There are no immediate plans to introduce one for this area but we will be investigating how to supply more of our information via OpenData in the future and this may well be included."

* Blaenau Gwent 
>"I have been advised that unfortunately we do not currently offer this data in relation to Council Members in the required format. However, the authority will be introducing the modern.gov framework at some point in the near future."

* Rhondda Cynon Taf
Email sent 16/1/19, no response as of 6/2/19. 

* Vale of Glamorgan
Contact form sent on 21/1/19, no response as of 6/2/19.  

Still, writing page scrapers for 4 councils (assuming Rhondda Cynon Taf and Vale of Glamorgan councils aren't hiding an API somewhere) is significantly less arduous than for 22.

# Stack

Each of the APIs above seems to use the same framework despite some variety in domains (moderngov.\*, democracy.\*, democratiaeth.\*, democratic.\*). The API is SOAP and we can consume it in any number of ways, but I chose a Node.js app using the [request](https://www.npmjs.com/package/request) and [xml2js](https://www.npmjs.com/package/xml2js) npm packages. 

The end goal here is the site presented here in Glitch where you can browse and search through all of the Welsh councillor data, so collating the data from all of the council's APIs into a searchable database is the core of the application. 

I also wanted to use some tools I'd heard about but never used, namely AWS Lambda and ElasticSearch. Seeing as that was all AWS-based I decided to do the whole thing within the AWS ecosystem:

- Code hosted in CodeCommit
- Development in Cloud9 IDE
- DynamoDb to store transformed data
- ElasticSearch for searching the data
- Lambda functions to consume APIs, create and write documents into the Db, and syncing data with ElasticSearch (ES)
- Front end written in React with Node/Express back end

 wanted to use [ReactiveSearch](https://opensource.appbase.io/reactivesearch/) for the UI components on the search page, but these repeatedly failed to connect directly to my AWS ES cluster. After reading that the issue might be a requirement for a reverse proxy in front of the cluster, I decided instead to try [appbase.io](https://appbase.io/) for my ES hosting, primarily because the [tutorial](https://codeburst.io/how-to-build-an-e-commerce-search-ui-with-react-and-elasticsearch-a581c823b2c3) I was following used it. In the end this approach was successful.

I created an AWS account and I've kept everything within the limits of the Free Tier. I even set up a billing alert for anything over $1 because I've heard some horror stories about PaaS bills accidentally getting out of hand. I also created an IAM user, which is AWS's user administration system, which controls the components of the stack, with a role featuring the appropriate rights needed for the various components of the stack.

## Lambda functions

The first thing I did was create a Cloud9 environment, which is AWS's cloud-based IDE. The only reason I chose this over local development was because I was swapping laptops between daytime (Windows) and evening (Mac) and didn't want the hassle of maintaining two development environments. I've found Cloud9 to be quite cramped but I do enjoy how quickly I can create and deploy new Lambda functions using the UI instead of memorizing commands to do things locally. 

I made separate Lambda functions to:

- Create a DynamoDb table (Node.js)
- Populate the table by hitting each of the above APIs at the `GetCouncillorsByWard` endpoint in turn, restructure the returned data into JSON and write to the table (Node.js)
- When a new record is inserted into the table, trigger a function to PUT the record into an appbase.io (free) app.

# To do

- Set the table populate function to run on a sensible schedule, clearing out all records before writing to account for council members leaving.
- Write some sanity tests to show that the number of records returned from the moderngov API calls is equal to the number of records written into the DynamoDb table and into appbase.io.
- Write page scrapers for the councils which don't use moderngov and include them in the populate table lambda function.
- Improve the front end to include some basic filtering (e.g. by party, council etc.)
- Create some statistics from the data and display in another page (e.g. break down numbers by party, years in post)



