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
	const client = db.getClient();
	const dbres = await client.query( "select * from hims;" );
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

	const himQuery = "select count(*) as hits from hims where region = $1, ao = $2, f3name = $3, email = $4;";
	const himResult = await client.query( himQuery );
	if ( himResult.rows[ 0 ].hits > 0 ) {
		return res.status( 409 ).send( "him already exists" );
	}

	const query = "insert into hims(region, ao, f3name, email) values($1, $2, $3, $4) returning *;";
	const values = [ region, ao, name, email ];
	const insertResult = await client.query( query, values );
	return res.status( 201 ).json( insertResult.rows[ 0 ] );
};

const postBurpees = async ( req, res ) => {
	return res.status( 200 ).send( "not implemented, but good for you!" );
};

module.exports = function ( app ) {
	app.get( "/api/aos", getAOs );
	app.get( "/api/regions", getRegions );
	app.get( "/api/hims", getHims );
	app.post( "/api/hims", postHim );
	app.post( "/api/burpees", postBurpees );
};
