var fs = require('fs')

var middleware = function (opts) {
  var app = opts.app
  var expressa = opts.expressa
	var customEndpoints = opts.customEndpoint

  app.use( opts.url || '/api/schema', function(req, res, next){
    var schema = {}
    for( var collectionname in expressa.db ) 
      schema[collectionname] = require( process.cwd()+'/data/collection/'+collectionname+".json").schema
    res.send(schema)
    res.end()
  })

  var clientcode = fs.readFileSync( process.cwd()+'/node_modules/restglue/dist/restglue.min.js').toString()+"\n"
	var clientcode = !customEndpoints ? "" : "var customEndpoints = ['" + customEndpoints.join("','") + "']\n"
  clientcode    += fs.readFileSync( __dirname+'/../public/client.js' ).toString()
  app.use( '/api/client.js', function(req, res, next){
    res.setHeader('Content-Type', 'text/javascript')
    res.send(clientcode)
    res.end()
  })
  console.log("serving js-client at /api/client.js")

}

module.exports = {
  client: require( __dirname+'/../public/client.js'), 
  middleware: middleware
}
