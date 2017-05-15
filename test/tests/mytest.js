#!/usr/bin/env node

//var t = require('./../lib/util.js')

var expressaClient = require('./../../.').client
var api = new expressaClient('http://localhost:3001/api')
api.init("penna@harikirimail.com", "penna")                        // pass token or credentials
.then( function(user){                                       // HINT: token is in api.headers after auth 

  //api.post.all()                        // fetch 'post' collection 
  //.then(function(posts){                // (performs GET /api/post)
  //  console.dir(posts)
  //})
  //.catch(console.error)                 // error function

})
.catch(console.error)
