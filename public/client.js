if (typeof window === 'undefined' ){
  restglue = require('restglue') 
}

var expressaClient = expressaClient = function(apiurl){
  this.url = apiurl || "/api"
  this.sandbox = {}
  this.headers = { 'Content-Type': 'application/json' }
  this.requestPre  = []
  this.requestPost = []
  this.addEndpoint("user/login")
  this.addEndpoint("user/me")
  this.addEndpoint("user/register")
  this.addEndpoint("schema")
  this.addEndpoint("swagger")
  return this
}

expressaClient.prototype = restglue.prototype 

// monkeypatch addEndpoint() to mimic expressa database adapter functions
var addEndpoint = expressaClient.prototype.addEndpoint
expressaClient.prototype.addEndpoint = function(endpoint){
  addEndpoint = addEndpoint.bind(this)
  addEndpoint(endpoint)
  this.all = this[endpoint].getAll
  this.find = this[endpoint].getAll
  this.get = this[endpoint].get
  this.create = this[endpoint].post
  this.update = this[endpoint].put
}

expressaClient.prototype.initSchema = function(cb){
  var me = this
  this.schema.getAll()
  .then(function(data){
    delete data.getResponse
    for( var endpoint in data )
      me.addEndpoint(endpoint)
    cb()
  })
}

expressaClient.prototype.login = function(email, password){
  var me = this
  return new Promise(function(resolve, reject){
    me['user/login'].post({email:email, password:password})
    .then(function(data){
      if( data.token ) me.headers['x-access-token'] = data.token 
      else reject("no token found in expressa response")
      me.initSchema(resolve.bind(this, data))
    })
    .catch(reject)
  })
}

if (typeof window === 'undefined') {
    module.exports = expressaClient
} else {
    window.expressaClient = expressaClient 
}
