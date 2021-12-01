const { Client } = require( "pg" );
let client = null;

export const setupDB = () => {
	client = new Client( {
		connectionString: process.env.DATABASE_URL,
		ssl: {
			rejectUnauthorized: false
		}
	} );
	client.connect();
};

export const teardownDB = () => {
	if ( client ) {
		client.end();
		client = null;
	}
};

export const getClient = () => {
	return client;
};
