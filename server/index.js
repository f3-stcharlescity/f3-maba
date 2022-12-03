const config = require( "./config" );
const express = require( "express" );
const bodyParser = require( "body-parser" );
const path = require( "path" );
const mountAPI = require( "./api" );
const db = require( "./data/db" );

const isProductionEnvironment = config.NODE_ENV === "production";

if ( !isProductionEnvironment ) {
	console.info( config );
}

const app = express();

// @see https://jaketrent.com/post/https-redirect-node-heroku
if ( isProductionEnvironment ) {
	app.use( ( req, res, next ) => {
		if ( req.header( "x-forwarded-proto" ) !== "https" ) {
			res.redirect( `https://${ req.header( "host" ) }${ req.url }` );
		} else {
			next();
		}
	} );
}

// parse the request body
app.use( bodyParser.urlencoded( {
	extended: true
} ) );
app.use( bodyParser.json() );

// first, set up the API routes
mountAPI( app );

// second, set up the static resolver for assets
const distPath = path.join( __dirname, "..", "dist" );
app.use( express.static( distPath ) );

// finally, set up the fall-through to return the index for all requests,
// because this is an SPA
app.get( "*", ( req, res ) => {
	res.sendFile( path.join( distPath, "index.html" ) );
} );

// set up the global request error handler
app.use( ( err, req, res, next ) => {
	if ( req.xhr ) {
		return res.status( 500 ).send( { error: "Something failed!" } );
	}
	next( err );
} );

process.on( "SIGINT", async () => {
	console.info( "server is shutting down..." );
	await db.teardownDB();
	process.exit( 0 );
} );

// start the app
( async () => {
	await db.setupDB();
	app.listen( config.PORT );
} )();
