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

Add this snippet to your expressa __server__ application:

    require('expressa-client').middleware({expressa:expressa,   app:app})   // <--- here
    app.use('/api',  expressa)      
    app.use('/admin',  expressa.admin())

Add this in your browser:

    <script type="text/javascript" src="/api/client.js"></script>
    <script type="text/javascript">

      var api = new expressaClient()                    // to connect to other host use: new expressaClient("http://foo.com/api") 
      api.init("foo@bar.com", "mypassword")             // use api.init() to login as anonymous user or login as last-loggedin user (token is cached in localstorage)
      .then( function(){                                // 
                                                        //
        api.post.all()                                  // fetch post collection
        .then(function(posts){                          // (performs GET /api/post)
          console.dir(posts)                            //
        })                                              //
        .catch(alert)                                   // error function
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
| api.post.create({foo:"bar"})          | `POST   /api/post                     ` | adds `{"foo":"bar"}`-item to collection                                                                                                                                           |
| api.post.all()                        | `GET    /api/post                     ` | returns array of all post-items                                                                                                                                                   |
| api.post.find({name:"foo"})           | `GET    /api/post?query={"name":"foo"}` | returns array of all post-items which contain a key named `name` with value `foo`. [see mongo-query for more options](https://github.com/Turistforeningen/node-mongo-querystring) |
| api.post.get("ef3fe")                 | `GET    /api/post/ef3fe               ` | returns object of post-item with id 'ef3fe'                                                                                                                                       |
| api.post.update("ef3f3", {foo:"foo"}) | `PUT    /api/post/ef3fe               ` | updates post-item with id 'ef3f3' from `{foo:"bar"}` to `{foo:"foo"}`                                                                                                             |
| api.post.delete("ef3f3")              | `DELETE /api/post/ef3fe               ` | deletes post-item with id 'ef3f3' from collection                                                                                                                                 |

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
    var api = new expressaClient('http://localhost:3000/api')
    api.init("foo@bar.com", "mypassword")                        // pass token or credentials
    .then( function(){                                          // HINT: token is in api.headers after auth 

      api.post.all()                        // fetch 'post' collection 
      .then(function(posts){                // (performs GET /api/post)
        console.dir(posts)
      })
      .catch(console.error)                 // error function
    })
    .catch(console.error)                   // error: not logged in

## Todo 

* need tests    
