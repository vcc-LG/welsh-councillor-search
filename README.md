# Introduction

A few weeks ago I was asked on the [Cardiff Sustainibility Slack](https://suscardiffslack.herokuapp.com/) whether there was a central location on which to search for Welsh councillor information. I had a look around and found that while there were individual council pages which listed their councillors (e.g. [here](http://cardiff.moderngov.co.uk/mgMemberIndex.aspx?FN=ALPHA&VW=LIST&PIC=0)), there was no single location where I could search _all_ councillors by, say, party or ward.

I set about asking around if anyone had any information on whether there was a site I'd overlooked and, if not, if there was a specific reason why the data wasn't collated. Presumably there was a database or Excel spreadsheet sitting somewhere just waiting to be opened up to the public.

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

## Available APIs

## Consuming APIs 

## Creating a table in DynamoDB

## Writing to DynamoDB

## Streaming DynamoDB to ElasticSearch

## Creating a front end



