const { Client } = require( "pg" );
let client = null;

const isProduction = process.env.NODE_ENV === "production";

const configuration = () => {
	if (isProduction) {
		return {
			connectionString: process.env.DATABASE_URL,
			ssl: {
				rejectUnauthorized: false,
			},
		};
	}
	return {
		connectionString: process.env.DATABASE_URL,
		ssl: false,
	};
}

exports.setupDB = () => {
	client = new Client( configuration() );
	client.connect();
};

exports.teardownDB = () => {
	if ( client ) {
		client.end();
		client = null;
	}
};

exports.getClient = () => {
	return client;
};
