Hasslefree Expressa (REST) client for nodejs & the browser, which automatically maps endpoints to functions.

![](https://github.com/coderofsalvation/expressa-client/raw/master/expressa.png)

## Features

* works in the browser 
* works in nodejs 
* sandboxable responses
* serves schemas of all collections at `/api/schema`
* based on restglue: [see docs](https://npmjs.org/package/restglue), so it also supports:
  * add middleware using `beforeRequest` and `afterRequest` to perform datamapping 
  * Chained endpoints
  * aggregating multiple api's
  * global and per-request response headers

## Usage

    npm install expressa-client --save

Add this snippet into your application-file *above* your expressa lines:

    require('expressa-client').middleware({expressa:expressa,   app:app})
    // enable CORS *you dont need this line if you already have CORS setup*
    app.use(function(req, res, next) {
        var oneof = false      
        if(req.headers.origin) {                                                                                                                                                                                                   
            res.header('Access-Control-Allow-Origin', req.headers.origin)
            oneof = true       
        }
        if(req.headers['access-control-request-method']) {
            res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method'])
            oneof = true
        }
        if(req.headers['access-control-request-headers']) {
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'])
            oneof = true
        }
        if(oneof) res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365)
        // intercept OPTIONS method     
        if (oneof && req.method == 'OPTIONS') res.send(200)
        else next()
    })  

Add this in your browser:

    <script type="text/javascript" src="/api/client.js"></script>
    <script type="text/javascript">

      var api = new expressaClient()                    // to connect to other host, or add extra andpoints use: new expressaClient("http://foo.com/api", ["foo/bar"]) 
      api.init("foo@bar.com", "mypassword")             // use api.init() to login as anonymous user or login as last-loggedin user (token is cached in localstorage)
      .then( function(user){                            // 
																												//
				console.dir(api.schemas)                        // dump schemas of endpoints
                                                        //
        api.mycollection.all()                          // fetch mycollection collection
        .then(function(item){                           // (performs GET /api/mycollection)
          console.dir(item)                             //
        })                                              //
        .catch(alert)                                   // error function
        api.logout(console.log)                         //
                                                        //
      })                                                //
      .catch(alert)                                     // not logged in

    </script>

Voila! All collections are available in the `api` object, and expose all expressa [database adapter functions](https://github.com/thomas4019/expressa/blob/master/doc/database.md) as promises.

> For more advanced REST requests see [restglue docs](https://npmjs.org/package/restglue)

## Examples

Lets say we have an expressa collection named 'post':

| api function                          | performs                                | explanation                                                                                                                                                                       |
|---------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| api.mycollection.create({foo:"bar"})          | `POST   /api/mycollection                     ` | adds `{"foo":"bar"}`-item to collection                                                                                                                                           |
| api.mycollection.all()                        | `GET    /api/mycollection                     ` | returns array of all mycollection-items                                                                                                                                                   |
| api.mycollection.find({name:"foo"})           | `GET    /api/mycollection?query={"name":"foo"}` | returns array of all mycollection-items which contain a key named `name` with value `foo`. [see mongo-query for more options](https://github.com/Turistforeningen/node-mongo-querystring) |
| api.mycollection.get("ef3fe")                 | `GET    /api/mycollection/ef3fe               ` | returns object of mycollection-item with id 'ef3fe'                                                                                                                                       |
| api.mycollection.update("ef3f3", {foo:"foo"}) | `PUT    /api/mycollection/ef3fe               ` | updates mycollection-item with id 'ef3f3' from `{foo:"bar"}` to `{foo:"foo"}`                                                                                                             |
| api.mycollection.delete("ef3f3")              | `DELETE /api/mycollection/ef3fe               ` | deletes mycollection-item with id 'ef3f3' from collection                                                                                                                                 |

## Adding custom endpoints

Easily add custom express endpoints (`/foo/bar` e.g.) like so:

    api.doFooBar = expressaClient.prototype.request.bind('post', '/foo/bar')
    api.doFooBar({foo:"bar"}).then(console.log)  
    
    api.doRemoteFoo = expressaClient.prototype.request.bind('post', 'http://foo.com/foo' )
    api.doRemoteFoo({foo:"bar"}, {myqueryvar:"foo"}, {"Content-Type":"application/xml"})
    .then(console.log)  

## Sandboxing 

In order to speed up frontend- and backend-development, sandboxing endpoints can enable parallel development:

    api.addEndpoint("somenewendpoint", {
    api.sandboxUrl("somenewendpoint", {
      data:{
        "foo":"bar"                        // mock 
        "flop":[1, 2, 3]                   // payload
      }
    })

Now the browser won't do a request to the server, but returns the mock instead.

> As soon as frontend- and backend-developer agree on the payload-mock, parallel development can start. For more info see [restglue docs](https://npmjs.org/package/restglue)

## Node.js client

If you want to connect in node.js to an expressa-app microservices-style: 

    npm install expressa-client superagent --save

then in your microservice put:

    var expressaClient = require('expressa-client').client
    var api = new expressaClient('http://localhost:3000/api', ["foo/bar"]) // init, and pass some custom endpoints as well
    api.init("foo@bar.com", "mypassword")                                  // pass token or credentials
    .then( function(user){                                                 // HINT: token is in api.headers after auth 

      api.mycollection.all()                // fetch 'mycollection' collection 
      .then(function(items){                // (performs GET /api/mycollection)
        console.dir(items)
      })
      .catch(console.error)                 // error function
    })
    .catch(console.error)                   // error: not logged in

## Todo 

* need tests    
