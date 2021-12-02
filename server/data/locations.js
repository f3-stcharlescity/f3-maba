const aos = require( "./aos.json" );
const regions = Object.keys( aos ).sort();

module.exports = {
	regions,
	aos,
};
