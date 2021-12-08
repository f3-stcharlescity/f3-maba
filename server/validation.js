const regions = require( "./data/regions.json" );
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

exports.isEmailValid = ( email ) => {
	return !!( email && email.match( EMAIL_REGEX ) );
};

exports.isRegionValid = ( region ) => regions.includes( region );
