// Check we have the ETCD_URL environment varible set
if (typeof process.env.ETCD_URL !== 'string') {
	throw new Error("ETCD_URL not set")
}

const argv = require('optimist').argv
const fs = require('fs');
const Etcd = require('node-etcd');

// do we have a certificate that we need to use?
var options = {}
if (argv.cert) {
	options.ca = fs.readFileSync(argv.cert);
}

// Connect!
const etcd = new Etcd(process.env.ETCD_URL, options);

// Export
module.exports = etcd;