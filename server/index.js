const express = require( "express" );
const serveStatic = require( "serve-static" );
const path = require( "path" );
const mountAPI = require( "./api" );

const app = express();

app.use( function ( err, req, res, next ) {
	console.error( err.stack );
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

const port = process.env.PORT || 3000;
app.listen( port );
