var notbrowser = typeof window === 'undefined'
var hasLocalstorage = ( !notbrowser && window.localStorage )
var restglue

if ( notbrowser ) restglue = require('restglue') 

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
  addEndpoint.apply(this, [endpoint])
  this[endpoint].all = this[endpoint].getAll
  this[endpoint].find = this[endpoint].getAll
  this[endpoint].get = this[endpoint].get
  this[endpoint].create = this[endpoint].post
  this[endpoint].update = this[endpoint].put
}

expressaClient.prototype.initSchema = function(){
  var me = this
	return new Promise( function(resolve, reject){
		me.schema.getAll()
		.then(function(data){
			if( !data || !data.getResponse) return reject("no schema data")
			delete data.getResponse
			for( var endpoint in data ) me.addEndpoint(endpoint)
			return resolve()
		})
		.catch(reject)
	})
}

expressaClient.prototype.logout = function(cb){
  if( this.headers['x-access-token'] ) delete this.headers['x-access-token']
  if( hasLocalstorage ) window.localStorage.removeItem("expressa_token")
  if( cb ) cb()
}

expressaClient.prototype.isLoggedIn = function(){
  if( this.headers['x-access-token'] ) return true 
  if( hasLocalstorage && window.localStorage.getItem("expressa_token") ){
    this.headers['x-access-token'] = window.localStorage.getItem("expressa_token")
    return true
  }
  return false
}

expressaClient.prototype.init = function(email_or_token, password){
  var hascredentials = arguments.length != 0
  if( arguments.length == 1 ) this.headers['x-access-token'] = arguments[0]
  var me = this

	var postLogin = function(resolve,reject){
		me.initSchema()
		.then( function(){
			//return me['user/me'].all()
			return {
				"firstname": "Jannes", 
				"lastname":"Janssohn", 
				"email": "penna@harikirimail.com",
				"roles": [
					"Admin"
				],
				"meta": {
					"created": "2017-03-07T14:18:52.775Z",
					"updated": "2017-03-07T14:18:52.775Z"
				},
				"_id": "QFu6Xel6"
			}
		})
		.then( function(user){
			if( user._id ) return resolve(user)
			else reject("could not get user")
		})
		.catch(reject)
	}

  return new Promise(function(resolve, reject){
    if( me.isLoggedIn() || !hascredentials ) return postLogin(resolve, reject)
    me['user/login'].post({email:email_or_token, password:password})
    .then(function(data){
      if( !data.token) return reject("no token found in expressa response")
      me.headers['x-access-token'] = data.token 
      if( hasLocalstorage ) window.localStorage.setItem("expressa_token", data.token)
			postLogin(resolve,reject)
    })
    .catch(reject)
  })
}
if (typeof window === 'undefined') {
    module.exports = expressaClient
} else {
    window.expressaClient = expressaClient 
}
