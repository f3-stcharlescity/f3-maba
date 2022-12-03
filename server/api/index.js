const config = require( "../config" );
const { v4: uuidv4 } = require( "uuid" );
const { DateTime } = require( "luxon" );
const range = require( "lodash/range" );
const keyBy = require( "lodash/keyBy" );
const db = require( "../data/db" );
const { isEmailValid, isRegionValid } = require( "../validation" );
const regions = require( "../data/regions" );
const statsAPI = require( "./stats" );
const { TARGET_YEAR } = require( "../config" );

//
// REGIONS
//

const getRegions = ( req, res ) => {
	res.json( regions );
};

//
// HIMS
//

const getHims = async ( req, res ) => {
	const { query, } = req;
	const { region = "", } = query;

	let sql = [ "select him_id, region, ao, f3_name from hims" ];
	const sqlWhere = [];
	const sqlParams = [];

	if ( region ) {
		sqlWhere.push( "region = $1" );
		sqlParams.push( region );
	}

	if ( sqlWhere.length ) {
		sql = sql.concat( [ "where" ], [ sqlWhere.join( " and " ) ] );
	}

	sql = sql.concat( [ "order by region, f3_name" ] );

	const sqlQuery = sql.join( " " );
	const client = await db.getClient();

	try {
		const himsResult = await client.query( sqlQuery, sqlParams );

		return res.json( Array.from( himsResult.rows ) );
	} finally {
		client.release( true );
	}
};

const postHim = async ( req, res ) => {
	const { region, f3_name, email = "" } = req.body;

	if ( !isRegionValid( region ) ) {
		return res.status( 400 ).send( "Invalid region." );
	}
	if ( email && !isEmailValid( email ) ) {
		return res.status( 400 ).send( "Invalid email." );
	}
	if ( !f3_name.trim() ) {
		return res.status( 400 ).send( "Invalid F3 name." );
	}

	const client = await db.getClient();

	try {

		const himQuery = "select count(*) as hits from hims where region = $1 and lower(f3_name) = $2;";
		const himValues = [ region, f3_name.toLowerCase() ];
		const himResult = await client.query( himQuery, himValues );
		if ( himResult.rows[ 0 ].hits > 0 ) {
			return res.status( 409 ).send( `${ f3_name } has already signed up.` );
		}

		const insertQuery = "insert into hims (him_id, region, ao, f3_name, email) values ($1, $2, $3, $4, $5) returning *;";
		const insertValues = [ uuidv4(), region, "", f3_name, email ];
		const insertResult = await client.query( insertQuery, insertValues );

		return res.status( 201 ).json( insertResult.rows[ 0 ] );
	} finally {
		client.release( true );
	}
};

//
// BURPEES
//

const zeroFillBurpees = ( formattedRows, year ) => {
	const rowsByDate = keyBy( formattedRows, "date" );
	const allBurpees = [];
	const daysInJanuary = 31;
	const padZero = n => n < 10 ? `0${ n }` : `${ n }`;
	for ( const day of range( 1, daysInJanuary + 1 ) ) {
		const date = `${ year }-01-${ padZero( day ) }`;
		const row = rowsByDate[ date ] || {
			date,
			count: 0,
		};
		allBurpees.push( row );
	}
	return allBurpees;
};

const getBurpees = async ( req, res ) => {
	const { himId } = req.params;
	let { year = TARGET_YEAR } = req.query;
	year = parseInt( `${ year }`, 10 );
	const query = "select DATE(date), count from burpees where him_id = $1 and date_part('year', date) = $2 order by date asc;";
	const values = [ himId, year ];

	const client = await db.getClient();

	try {
		const result = await client.query( query, values );

		const formattedRows = result.rows.map( row => {
			return {
				...row,
				// @see https://node-postgres.com/features/types#date--timestamp--timestamptz
				date: DateTime.fromJSDate( row.date ).setZone( config.TZ ).toFormat("yyyy-MM-dd" ),
			};
		} );

		const allBurpees = zeroFillBurpees( formattedRows, year );

		return res.status( 200 ).json( allBurpees );
	} finally {
		client.release( true );
	}
};

const postBurpees = async ( req, res ) => {
	const { himId } = req.params;
	let { year = config.TARGET_YEAR } = req.query;
	year = parseInt( `${ year }`, 10 );
	const allBurpees = req.body || [];
	const burpees = allBurpees.filter( burpee => burpee.count !== 0 );

	const sql = [ "insert into burpees (him_id, date, count) values" ];
	const valuesSql = [];
	const values = [];
	for ( const burpee of burpees ) {
		const valueLength = values.length;
		values.push( himId, burpee.date, Math.abs( burpee.count ) );
		valuesSql.push( `($${ valueLength + 1 }, $${ valueLength + 2 }, $${ valueLength + 3 })` );
	}
	sql.push( valuesSql.join( ", " ) );
	sql.push( "on conflict (him_id, date) do update set count = EXCLUDED.count returning *;" );
	const insertQuery = sql.join( " " );

	const client = await db.getClient();

	try {
		let formattedRows = [];

		if (values.length > 0) {
			const insertResult = await client.query( insertQuery, values );

			formattedRows = insertResult.rows.map( row => {
				return {
					...row,
					// @see https://node-postgres.com/features/types#date--timestamp--timestamptz
					date: DateTime.fromJSDate( row.date ).setZone( config.TZ ).toFormat("yyyy-MM-dd" ),
				};
			} );
		}

		const allBurpees = zeroFillBurpees( formattedRows, year );

		return res.status( 201 ).json( allBurpees );
	} finally {
		client.release( true );
	}
};

module.exports = function ( app ) {
	// KEEPME this is the health check route
	app.get("/fistbump", (req, res) => res.status(200).send());
	app.get( "/api/regions", getRegions );
	app.get( "/api/hims", getHims );
	app.post( "/api/hims", ( req, res, next ) => {
		if ( config.IS_YEAR_CLOSED === "true" ) {
			return res.status( 400 ).send( "registration is disabled" );
		}
		next();
	}, postHim );
	app.get( "/api/hims/:himId/burpees", getBurpees );
	app.post( "/api/hims/:himId/burpees", ( req, res, next ) => {
		if ( config.IS_YEAR_CLOSED === "true" ) {
			return res.status( 400 ).send( "burpees can no longer be recorded this year" );
		}
		next();
	}, postBurpees );
	statsAPI( app );
};
