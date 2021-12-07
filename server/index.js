const express = require( "express" );
const bodyParser = require( "body-parser" );
const serveStatic = require( "serve-static" );
const path = require( "path" );
const mountAPI = require( "./api" );
const db = require( "./data/db" );

const isProductionEnvironment = process.env.NODE_ENV === "production";

if ( !isProductionEnvironment ) {
	console.info( process.env );
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
app.use( serveStatic( distPath ) );

// finally, set up the fall-through to return the index for all requests,
// because this is an SPA
app.get( "*", ( req, res ) => {
	res.sendFile( path.join( distPath, "index.html" ) );
} );

// set up the global request error handler
// eslint-disable-next-line no-unused-vars
app.use( ( err, req, res, next ) => {
	console.error( err );
	db.teardownDB(); // TODO: for each request
	if ( req.xhr ) {
		return res.status( 500 ).send( { error: "Something failed!" } );
	}
	next( err );
} );

// start the app
( async () => {
	await db.setupDB();
	app.listen( process.env.PORT );
} )();
