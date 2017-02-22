#!/usr/bin/env node

//var t = require('./../lib/util.js')

var expressaClient = require('./../../.').client
var api = new expressaClient('http://localhost:3000/api')
api.login("foo@bar.com", "mypassword")
.then( function(){

  console.log("jaaa")  

})
