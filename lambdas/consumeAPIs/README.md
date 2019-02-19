# Usage

1. Create an [appbase.io](https://appbase.io/) app and create a new ElasticSearch cluster with a type like 'records' or 'councillors' etc.
2. Grab the write credentials and modify `index.js`:
```
var appbase_url = 'https://{credential}@scalr.api.appbase.io/{appname}/{type}/';
```

3. Run `npm init` in the `consumeAPIs` directory and install these dependencies:

```
npm i -S request crypto xml2js
```

4. Run using `npm start`.
