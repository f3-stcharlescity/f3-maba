const uniq = require( "lodash/uniq" );
const index = require( "./regions.json" );
const addedRegions = require( "./added-regions.json" );
const renamedRegions = require( "./renamed-regions.json" );

const renameRegions = ( region ) => {
	return renamedRegions[ region ] || region;
};

module.exports = uniq( index.concat( addedRegions ).map( renameRegions ) ).sort();
