const { v4: uuidv4 } = require( "uuid" );
const moment = require("moment-timezone");
const range = require("lodash/range");
const keyBy = require("lodash/keyBy");
const db = require( "./data/db" );
const { regions } = require( "./data/locations" );
const { isEmailValid, isRegionValid } = require( "./validation" );

const getRegions = ( req, res ) => {
	res.json( regions );
};

const getHims = async ( req, res ) => {
	const { query, } = req;
	// console.info({ params, body, query });
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
	const himsResult = await client.query( sqlQuery, sqlParams );

	client.release( true );

	return res.json( Array.from( himsResult.rows ) );
};

const postHim = async ( req, res ) => {
	const { region, f3_name, email } = req.body;

	if ( !isRegionValid( region ) ) {
		return res.status( 400 ).send( "Invalid region." );
	}
	if ( !isEmailValid( email ) ) {
		return res.status( 400 ).send( "Invalid email." );
	}
	if ( !f3_name.trim() ) {
		return res.status( 400 ).send( "Invalid F3 name." );
	}

	const client = await db.getClient();

	const himQuery = "select count(*) as hits from hims where region = $1 and lower(f3_name) = $2;";
	const himValues = [ region, f3_name.toLowerCase() ];
	const himResult = await client.query( himQuery, himValues );
	if ( himResult.rows[ 0 ].hits > 0 ) {
		return res.status( 409 ).send( `${ f3_name } has already signed up.` );
	}

	const insertQuery = "insert into hims (him_id, region, ao, f3_name, email) values ($1, $2, $3, $4, $5) returning *;";
	const insertValues = [ uuidv4(), region, "", f3_name, email ];
	const insertResult = await client.query( insertQuery, insertValues );

	client.release( true );

	return res.status( 201 ).json( insertResult.rows[ 0 ] );
};

const getBurpees = async ( req, res ) => {

	const zeroFillBurpees = ( formattedRows ) => {
		const rowsByDate = keyBy( formattedRows, "date" );
		const allBurpees = [];
		const daysInJanuary = 31;
		const padZero = n => n < 10 ? `0${ n }` : `${ n }`;
		for ( const day of range(1, daysInJanuary + 1 )) {
			const date = `${ year }-01-${ padZero( day )}`;
			const row = rowsByDate[date] || {
				date,
				count: 0,
			};
			allBurpees.push(row);
		}
		return allBurpees;
	};

	const { himId } = req.params;
	let { year = moment().year() } = req.query;
	year = parseInt( `${ year }`, 10 );
	const query = "select DATE(date), count from burpees where him_id = $1 and date_part('year', date) = $2 order by date asc;";
	const values = [ himId, year ];
	const client = await db.getClient();
	const result = await client.query( query, values );
	client.release( true );

	const formattedRows = result.rows.map( row => {
		return {
			...row,
			// @see https://node-postgres.com/features/types#date--timestamp--timestamptz
			date: moment.tz( row.date, process.env.TZ ).format("YYYY-MM-DD"),
		};
	} );

	const allBurpees = zeroFillBurpees( formattedRows )

	return res.status( 200 ).json( allBurpees );
};

const postBurpees = async ( req, res ) => {
	const { himId } = req.params;
	const burpees = req.body;

	const sql = [ "insert into burpees (him_id, date, count) values" ];
	const valuesSql = [];
	const values = [];
	for ( const burpee of burpees ) {
		const valueLength = values.length;
		values.push( himId, burpee.date, burpee.count );
		valuesSql.push( `($${ valueLength + 1 }, $${ valueLength + 2 }, $${ valueLength + 3 })` );
	}
	sql.push( valuesSql.join( ", " ) );
	sql.push( "on conflict (him_id, date) do update set count = EXCLUDED.count returning *;" );
	const insertQuery = sql.join( " " );

	const client = await db.getClient();
	const insertResult = await client.query( insertQuery, values );
	client.release( true );

	const formattedRows = insertResult.rows.map( row => {
		return {
			...row,
			// @see https://node-postgres.com/features/types#date--timestamp--timestamptz
			date: moment.tz( row.date, process.env.TZ ).format("YYYY-MM-DD"),
		};
	} );

	return res.status( 201 ).json( formattedRows );
};

module.exports = function ( app ) {
	app.get( "/api/regions", getRegions );
	app.get( "/api/hims", getHims );
	app.post( "/api/hims", postHim );
	app.get( "/api/hims/:himId/burpees", getBurpees );
	app.post( "/api/hims/:himId/burpees", postBurpees );
};
