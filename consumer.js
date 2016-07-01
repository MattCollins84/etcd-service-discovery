/******************************
	
	Consumer
	Requires: API
	
	This app will attempt to discover an API service, 
	set config appropriately. Meanwhile it will attempt to
	make a request to the API every few seconds.

	The app should be able to detect when the API service:
	- Appears
	- Changes
	- Disappears

	And handle it appropriately.

******************************/

const etcd = require('./lib/connect.js');
const apiServiceKey = "/services/api";
const request = require('request');
const chalk = require('chalk');

// Set some message themes
const fatalMsg = chalk.blue.bgRed.bold;
const errorMsg = chalk.red;
const successMsg = chalk.green;
const infoMsg = chalk.bgYellow.bold;

// This is the config used to talk to the
// Fortune Cookie API
var config = {
	api: {
		host: null,
		port: null
	}
}

// Set the new config
const setAPIConfig = function(n) {

	const c = JSON.parse(n.node.value);

	if (c.port != config.api.port) {
		config.api = c;
		console.log(infoMsg(`API service detected - ${config.api.host}:${config.api.port}`));
	}

}

// Reset the config
const resetAPIConfig = function() {

	config.api.host = null;
	config.api.port = null;
	console.log(infoMsg(`API service vanished`));

}

// Get this key - waiting for changes
// We know that the API app will update every 5 seconds
etcd.get(apiServiceKey, {wait: true}, function getKey(err, node) {

	// if we get an error, bomb out
	if (err) {
		console.error(fatalMsg(err.message));
    process.exit(1);
	}

	// set our config value the first time we receive it
	setAPIConfig(node);

	// watch for further updatse to this key
	etcd.watcher(apiServiceKey)
	
	// if the key expires - reset the config
	.on('expire', resetAPIConfig)

	// if the key is deleted - reset the config
	.on('delete', resetAPIConfig)

	// if the key is set - update the config
	.on('set', setAPIConfig)

});

// Get our fortune from the API
// Every 5 seconds
const getFortune = function() {

	// no config
	if (config.api.host === null || config.api.port === null) {
		return console.log(errorMsg("API configuration unknown"))
	}

	// Make the request
	request(`${config.api.host}:${config.api.port}/fortune`, function(err, res, body) {

		// The request failed
		if (err) {
			return console.error(errorMsg(err))
		}

		// Success
		console.log(successMsg(body));

	})

}
const getFortuneInterval = setInterval(getFortune, 5000);