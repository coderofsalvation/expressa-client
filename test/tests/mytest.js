#!/usr/bin/env node

//var t = require('./../lib/util.js')

var expressaClient = require('./../../.').client
var api = new expressaClient('http://localhost:3000/api')
api.init("foo@bar.com", "mypassword")                        // pass token or credentials
.then( function(){                                       // HINT: token is in api.headers after auth 

  api.post.all()                        // fetch 'post' collection 
  .then(function(posts){                // (performs GET /api/post)
    console.dir(posts)
  })
  .catch(console.error)                 // error function

})
.catch(console.error)
