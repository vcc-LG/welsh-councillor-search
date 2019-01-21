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

So, a little disheartening and quite surprising. The WLGA had page scrapers to periodically collect data, but it was probably out of date? And the data itself didn't even collect the ward name, without which the data is almost unusable? 

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


## Available APIs

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
Email sent 16/1/19, no response as of 21/1/19. 

* Vale of Glamorgan
Email sent on 21/1/19.

Still, writing page scrapers for 4 councils (assuming Rhondda Cynon Taf and Vale of Glamorgan councils aren't hiding an API somewhere) is significantly less arduous than for 22.

## Consuming APIs into (more) useful data

Each of the APIs above seems to use the same framework despite variety in domains (moderngov.\*, democracy.\*, democratiaeth.\*, democratic.\*). The API is SOAP and we can consume it in any number of ways, but I chose a Node.js app using the [request](https://www.npmjs.com/package/request) and [xml2js](https://www.npmjs.com/package/xml2js) npm packages. The end goal here is to make a site where I can browse and search through all of the Welsh councillor data, so collating the data from all of the council's APIs into a searchable database is the core of the application. 

I also wanted to use some tools I'd heard about but never used, namely AWS Lambda and ElasticSearch. Seeing as that was all AWS-based I decided to do the whole thing within the AWS ecosystem:

- Code hosted in CodeCommit
- Development in Cloud9 IDE
- DynamoDb to store transformed data
- ElasticSearch for searching the data
- Lambda functions to consume APIs, create and write documents into the Db, and syncing data with ElasticSearch



## Creating a table in DynamoDB

## Writing to DynamoDB

## Streaming DynamoDB to ElasticSearch

## Creating a front end



