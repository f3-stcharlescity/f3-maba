const { v4: uuidv4 } = require( "uuid" );
const moment = require("moment-timezone");
const range = require("lodash/range");
const keyBy = require("lodash/keyBy");
const db = require( "./data/db" );
const { regions, aos } = require( "./data/locations" );
const { isEmailValid, isRegionValid, isAOValid } = require( "./validation" );

const getAOs = ( req, res ) => {
	res.json( aos );
};

const getRegions = ( req, res ) => {
	res.json( regions );
};

const getHims = async ( req, res ) => {
	const { query, } = req;
	// console.info({ params, body, query });
	const { region = "", ao = "", } = query;

	let sql = [ "select him_id, region, ao, f3_name from hims" ];
	const sqlWhere = [];
	const sqlParams = [];

	if ( region ) {
		sqlWhere.push( "region = $1" );
		sqlParams.push( region );

		// only add ao if there's a region
		if ( ao ) {
			sqlWhere.push( "ao = $2" );
			sqlParams.push( ao );
		}
	}

	if ( sqlWhere.length ) {
		sql = sql.concat( [ "where" ], [ sqlWhere.join( " and " ) ] );
	}

	sql = sql.concat( [ "order by region, ao, f3_name" ] );

	const sqlQuery = sql.join( " " );
	console.info( sqlQuery );
	const client = db.getClient();
	const dbres = await client.query( sqlQuery, sqlParams );
	return res.json( Array.from( dbres.rows ) );
};

const postHim = async ( req, res ) => {
	const { region, ao, name, email } = req.body;

	if ( !isRegionValid( region ) ) {
		return res.status( 400 ).send( "invalid region" );
	}
	if ( !isAOValid( region, ao ) ) {
		return res.status( 400 ).send( "invalid ao" );
	}
	if ( !isEmailValid( email ) ) {
		return res.status( 400 ).send( "invalid email" );
	}
	if ( !name.trim() ) {
		return res.status( 400 ).send( "invalid name" );
	}

	const client = db.getClient();

	const himQuery = "select count(*) as hits from hims where region = $1, ao = $2, f3_name = $3";
	const himResult = await client.query( himQuery );
	if ( himResult.rows[ 0 ].hits > 0 ) {
		return res.status( 409 ).send( "him already exists" );
	}

	const query = "insert into hims(him_id, region, ao, f3_name) values($1, $2, $3) returning *;";
	const values = [ uuidv4(), region, ao, name ];
	const insertResult = await client.query( query, values );
	return res.status( 201 ).json( insertResult.rows[ 0 ] );
};

const getBurpees = async ( req, res ) => {

	const zeroFillBurpees = ( rows ) => {
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
	const client = db.getClient();
	const result = await client.query( query, values );

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

	const client = db.getClient();
	const insertResult = await client.query( insertQuery, values );
	return res.status( 201 ).json( insertResult.rows );
};

module.exports = function ( app ) {
	app.get( "/api/aos", getAOs );
	app.get( "/api/regions", getRegions );
	app.get( "/api/hims", getHims );
	app.post( "/api/hims", postHim );
	// app.post( "/api/burpees", postBurpees );
	app.get( "/api/hims/:himId/burpees", getBurpees );
	app.post( "/api/hims/:himId/burpees", postBurpees );
};