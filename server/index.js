const express = require( "express" );
const serveStatic = require( "serve-static" );
const path = require( "path" );
const mountAPI = require( "./api" );
const db = require("./data/db");
db.setupDB();

if ( process.env.NODE_ENV !== "production" ) {
	console.info( process.env );
}

const app = express();

// set up the global request error handler
// eslint-disable-next-line no-unused-vars
app.use( function ( err, req, res, next) {
	console.error( err.stack );
	db.teardownDB(); // TODO: need to do this for all requests :/
	res.status( 500 ).send( "Something broke!" );
} );

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

const port = process.env.PORT;
app.listen( port );
