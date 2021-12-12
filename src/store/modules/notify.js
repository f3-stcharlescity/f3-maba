import { notify } from "@kyvg/vue3-notification";

export const notifySuccess = ( text ) => {
	notify( {
		text,
		type: "success"
	} );
};

export const notifyInfo = ( text ) => {
	notify( {
		text,
		type: "info"
	} );
};

export const notifyError = ( text, e = null ) => {
	if ( e ) {
		console.error( e );
	}
	notify( {
		text: text || ( e ? e.message : "" ) || "",
		type: "error"
	} );
};

export const notifyUnknownError = ( e ) => {
	notifyError( "An unknown error has occurred. Please refresh the page and try again.", e );
};
