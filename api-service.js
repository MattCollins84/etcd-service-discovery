/******************************
	
	Fortune Cookie API service
	
	This API will register it's details with etcd.
	A random port will be selected each time the service starts.

	The GET /fortune endpoint will return some wise words
	from a fortune cookie.

******************************/

const etcd = require('./lib/connect.js');
const apiServiceKey = "/services/api";
const _ = require('underscore');
const express = require('express');
const quotes = require('./lib/quotes.json')

// These are the details other services need
// to communicate with the Fortune Cookie API
const config = {
	host: "http://127.0.0.1",
	port: _.shuffle([3000, 4000, 5000, 6000, 7000])[0]
}

// initiate our app
var app = express();

// Fortune cookie
app.get('/fortune', function (req, res) {
  
	return res.send(_.shuffle(quotes)[0])

});

// start server on the specified port and binding host
app.listen(config.port, function() {
	return console.log(`server starting on ${config.host}:${config.port}`);
});

// function to register this service with Etcd
const register = function() {
	
	etcd.set(apiServiceKey, JSON.stringify(config), { ttl: 10 }, function(err, data) {

		if (err) {
			return console.log(`Failed to register @ ${apiServiceKey}`)
		}

		return console.log(`Registered @ ${apiServiceKey} - ${config.host}:${config.port}`)

	});

}

// Register the API service on startup, and then every 5 seconds
// Keys will expire after 10 seconds
register();
const registerInterval = setInterval(register, 5000);