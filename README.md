# etcd-service-discovery
Simple Service Discovery with [Etcd](https://github.com/coreos/etcd) and Node.js 

## Install
`npm install` will get you the dependencies you need.

Create an environment variable that points to your Etcd server:

```bash
export ETCD_URL='https://<user>:<password>@<hostname>:<port>'
```

This example was created using the [Etcd offering from Compose.io](https://www.compose.io/etcd/) and uses SSH - if you need to supply a SSH certificate use the `--cert` parameter:

```bash
node consumer.js --cert /path/to/cert.ca
```

## The Example

`api-service.js` is a simple Node.js Express app that exposes one endpoint - `GET /fortune`. When hit, this will return you some wisdom from a fortune cookie - because we can all do with a little wisdom every now and again!

On startup, the API Service will be assigned a random port number and register itself with Etcd in the `/services/api` key. This key will expire after 10 seconds, but will get re-set every 5 seconds as long as the app is running.

`consumer.js` is another simple Node.js app that attempts to make calls to `GET /fortune` repeatedly.

To do this, it attempts to discover the location of the Fortune Cookie API from Etcd and uses these details to make its requests. It will monitor the `/services/api` key for any changes - such as key expiry or alterations - and apply these changes as they happen.

This means that you should be able to do the following:

* Start the API, then start the consumer - The consumer should detect the API and start making requests
* Stop the API - The consumer should detect that the API has vanished, and handle it
* Start the API again - The consumer should detect the new details for the API, and start making requests
* Stop the API, stop the consumer
* Start the consumer - It should acknowledge that it has no configuration for the API
* Start the API - The consumer should detect the new API details and start making requests