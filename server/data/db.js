const { Pool } = require( "pg" );
let pool = null;

const isProduction = process.env.NODE_ENV === "production";

const configuration = () => {
	if ( isProduction ) {
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
};

exports.setupDB = async () => {
	if ( pool ) {
		const _pool = pool;
		pool = null;
		_pool.end();
	}

	// @see https://node-postgres.com/api/client
	// @see https://node-postgres.com/api/pool
	pool = new Pool( configuration() );

	if ( !isProduction ) {
		pool.on( "acquire", () => {
			const { totalCount, idleCount, waitingCount } = pool;
			console.info( "postgress pool ACQUIRE", { totalCount, idleCount, waitingCount } );
		} );

		pool.on( "remove", () => {
			const { totalCount, idleCount, waitingCount } = pool;
			console.info( "postgress pool REMOVE", { totalCount, idleCount, waitingCount } );
		} );

		pool.on( "error", ( err ) => {
			console.error( "postgress pool ERROR", err );
		} );
	}
};

exports.teardownDB = async () => {
	if ( pool ) {
		const _pool = pool;
		pool = null;
		_pool.end();
	}
};

exports.getClient = async () => {
	return await pool.connect();
};
