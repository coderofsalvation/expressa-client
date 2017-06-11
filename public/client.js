var notbrowser = typeof window === 'undefined'
var hasLocalstorage = ( !notbrowser && window.localStorage )
var restglue

if ( notbrowser ) restglue = require('restglue') 

var expressaClient = expressaClient = function(apiurl, customEndpoints){
	var me = this
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
	// add custom endpoints
	customEndpoints = customEndpoints || []
	if( typeof window !== 'undefined' && window.customEndpoints ) customEndpoints = window.customEndpoints
	customEndpoints.map( function(path){ me.addEndpoint(path) } )
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
	if( this.headers['x-access-token'] && this.headers['x-access-token'].length ) return true 
	if( hasLocalstorage && window.localStorage.getItem("expressa_token") ){
		this.headers['x-access-token'] = window.localStorage.getItem("expressa_token")
		return true
	}
	return false
}

expressaClient.prototype.init = function(email_or_token, password){
	console.dir(arguments)
	var hascredentials = arguments.length != 0 && typeof email_or_token == "string"
	var me = this

	var postLogin = function(resolve,reject){
		me.initSchema()
			.then( function(){
				if( me.isLoggedIn() ) return me['user/me'].all()
			})
			.then( function(user){
				if( user && user._id ){
					console.log({user:user})
					return resolve(user)
				}else resolve() 
			})
			.catch(resolve)
	}

	return new Promise(function(resolve, reject){
		var credentials
		if( !hascredentials ){
			return postLogin(resolve, reject)
		}else{
		  if( !me.isLoggedIn() ) me.logout() // relogin
			if( !password ) credentials = email_or_token
			else credentials = {email:email_or_token, password:password}
		}

		me['user/login'].post(credentials)
			.then(function(data){
				if( !data.token){
					console.error("no token found in expressa response")
					return postLogin(resolve, reject )
				} else me.user = data
				me.headers['x-access-token'] = data.token 
				if( hasLocalstorage ) window.localStorage.setItem("expressa_token", data.token)
				return postLogin(resolve, reject)
			})
			.catch( postLogin.bind(this, resolve, reject) )
	})
}
if (typeof window === 'undefined') {
	module.exports = expressaClient
} else {
	window.expressaClient = expressaClient 
	console.error = console.error ? console.error : console.log
}
