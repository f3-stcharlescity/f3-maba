import { notify } from "@kyvg/vue3-notification";
import axios from "axios";
import orderBy from "lodash/orderBy";

import { isEmailValid } from "@/lib/validation";
import { NONE_REGION, NONE_AO } from "@/lib/enum";
import range from "lodash/range";

const BURPEE_YEAR = 2022;

const HIM_STATUS = {
	NEW: "NEW",
	EXISTING: "EXISTING",
};

const notifySuccess = ( text ) => {
	notify( {
		text,
		type: "success"
	} );
};

const notifyInfo = ( text ) => {
	notify( {
		text,
		type: "info"
	} );
};

const notifyError = ( text, e = null ) => {
	if ( e ) {
		console.error( e );
	}
	notify( {
		text: text || ( e ? e.message : "" ) || "",
		type: "error"
	} );
};

const notifyUnknownError = ( e ) => {
	notifyError( "An unknown error has occurred. Please refresh the page and try again.", e );
};

const pristineBurpees = () => {
	const allBurpees = [];
	const daysInJanuary = 31;
	const year = BURPEE_YEAR;
	const padZero = n => n < 10 ? `0${ n }` : `${ n }`;
	for ( const day of range( 1, daysInJanuary + 1 ) ) {
		const date = `${ year }-01-${ padZero( day ) }`;
		const burpee = {
			date,
			count: 0,
		};
		allBurpees.push( burpee );
	}
	return allBurpees;
};

const pristineState = () => {
	return {
		regions: [],
		hims: [],

		himStatus: HIM_STATUS.NEW,
		hasEnteredName: false,
		name: "",
		hasEnteredEmail: false,
		email: "",

		selectedRegion: NONE_REGION,
		selectedHimId: "",
		burpees: pristineBurpees(),
		modifiedBurpees: {},
	};
};

export default {
	namespaced: true,

	state: pristineState(),
	getters: {
		validation: ( state, getters ) => {
			const validation = {};
			if ( !getters.canSelectHim ) {
				if ( !state.name.trim() ) {
					validation.name = "Name is required.";
				}
				if ( !isEmailValid( state.email.trim() ) ) {
					validation.email = "A valid email is required.";
				}
			}
			getters.mergedBurpees.forEach( burpee => {
				if ( isNaN( burpee.count ) ) {
					validation[ `burpee.${ burpee.date }` ] = `Burpee count for ${ burpee.date } is invalid.`;
				}
			} );
			return validation;
		},
		regions: state => state.regions,
		hims: state => state.hims,
		selectedRegion: state => state.selectedRegion,
		burpees: state => state.burpees,
		totalBurpees: ( state, getters ) => {
			return getters.mergedBurpees.reduce( ( total, burpee ) => {
				return total + burpee.count;
			}, 0 );
		},
		mergedBurpees: state => {
			return state.burpees.map( burpee => {
				const hasModifiedCount = state.modifiedBurpees.hasOwnProperty( burpee.date );
				const modifiedCount = state.modifiedBurpees[ burpee.date ];
				return {
					...burpee,
					count: hasModifiedCount ? modifiedCount : burpee.count,
					// ignore modifications that are identical
					isModified: hasModifiedCount && modifiedCount !== burpee.count,
				};
			} );
		},
		selectedHimId: state => state.selectedHimId,
		himStatus: state => state.himStatus,
		canSelectHim: state => state.himStatus === HIM_STATUS.EXISTING,
		canCreateHim: state => state.himStatus === HIM_STATUS.NEW,
		hasEnteredName: state => state.hasEnteredName,
		hasEnteredEmail: state => state.hasEnteredEmail,
	},
	mutations: {
		storeInitialized( state, { regions, selectedRegion, hims, selectedHimId, burpees, } ) {
			Object.assign( state, pristineState() );
			state.regions = regions;
			state.selectedRegion = selectedRegion;
			state.hims = hims;
			state.selectedHimId = selectedHimId;
			state.burpees = burpees;
		},
		himsFetched( state, hims ) {
			state.hims = orderBy( hims, [ "f3_name", ], [ "asc", ] );
		},
		changeName( state, name ) {
			state.hasEnteredName = true;
			state.name = name;
		},
		changeEmail( state, email ) {
			state.hasEnteredEmail = true;
			state.email = email;
		},
		regionChanged( state, { selectedRegion, hims, selectedHimId, burpees, } ) {
			state.selectedRegion = selectedRegion;
			state.hims = hims;
			state.selectedHimId = selectedHimId;
			state.burpees = burpees;

			if ( hims.length === 0 ) {
				state.himStatus = HIM_STATUS.NEW;
			}
		},
		aoChanged( state, { hims, selectedHimId, burpees, } ) {
			state.hims = hims;
			state.selectedHimId = selectedHimId;
			state.burpees = burpees;

			if ( hims.length === 0 ) {
				state.himStatus = HIM_STATUS.NEW;
			}
		},
		himChanged( state, { himId, burpees } ) {
			state.selectedHimId = himId;
			state.modifiedBurpees = {};
			state.burpees = burpees;
		},
		himStatusChanged( state, { status, burpees, } ) {
			state.himStatus = status;
			state.modifiedBurpees = {};
			state.burpees = burpees;
		},
		changeBurpeeCount( state, { date, count, } ) {
			state.modifiedBurpees = {
				...state.modifiedBurpees,
				[ date ]: count,
			};
		},
		burpeesSaved( state, { him, burpees, } ) {
			state.modifiedBurpees = {};
			state.burpees = burpees;

			if ( him ) {
				state.himStatus = HIM_STATUS.EXISTING;
				state.selectedHimId = him.him_id;
				const hims = [
					...state.hims.filter( oldHim => oldHim.him_id !== him.him_id ),
					him,
				];
				state.hims = orderBy( hims, [ "f3_name", ], [ "asc", ] );
			}

			notifySuccess( "Burpees updated." );
		},
		resetBurpees( state ) {
			state.modifiedBurpees = {};
		},
	},
	actions: {
		async initializeStore( { commit } ) {
			try {
				let selectedRegion = NONE_REGION;
				let selectedHimId = "";
				let burpees = pristineBurpees();

				const [ regions, ] = await Promise.all( [
					axios.get( "/api/regions" ),
				] ).then( responses => {
					return [
						responses[ 0 ].data,
					];
				} );

				selectedRegion = regions[ 0 ] || NONE_REGION;

				const himUrl = `/api/hims?region=${ selectedRegion }`;
				const himResult = await axios.get( himUrl );
				const hims = himResult.data;

				if ( hims.length ) {
					selectedHimId = hims[ 0 ].him_id;
					// const burpeeUrl = `/api/hims/${ selectedHimId }/burpees?year=${ BURPEE_YEAR }`;
					// const burpeesResult = await axios.get( burpeeUrl );
					// burpees = burpeesResult.data;
				}

				commit( "storeInitialized", {
					regions,
					selectedRegion,
					hims,
					selectedHimId,
					burpees,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		async resetStore( { state, commit } ) {
			try {
				let selectedHimId = "";
				let burpees = pristineBurpees();

				const regions = [
					...state.regions,
				];

				const selectedRegion = regions[ 0 ] || NONE_REGION;

				const himUrl = `/api/hims?region=${ selectedRegion }`;
				const himResult = await axios.get( himUrl );
				const hims = himResult.data;

				if ( hims.length ) {
					selectedHimId = hims[ 0 ].him_id;
					// const burpeeUrl = `/api/hims/${ selectedHimId }/burpees?year=${ BURPEE_YEAR }`;
					// const burpeesResult = await axios.get( burpeeUrl );
					// burpees = burpeesResult.data;
				}

				commit( "storeInitialized", {
					regions,
					selectedRegion,
					hims,
					selectedHimId,
					burpees,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		async refreshHims( { state, commit } ) {
			try {
				const { selectedRegion: region, } = state;
				const params = [];
				if ( region ) params.push( `region=${ region }` );
				const url = `/api/hims?${ params.join( "&" ) }`;
				const result = await axios.get( url );
				commit( "himsFetched", result.data );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		async changeRegion( { state, commit }, region ) {
			try {
				let selectedRegion = region;
				let selectedHimId = "";
				let burpees = pristineBurpees();

				const himUrl = `/api/hims?region=${ selectedRegion }`;
				const himResult = await axios.get( himUrl );
				const hims = himResult.data;

				if ( hims.length ) {
					selectedHimId = hims[ 0 ].him_id;
					const burpeeUrl = `/api/hims/${ selectedHimId }/burpees?year=${ BURPEE_YEAR }`;
					const burpeesResult = await axios.get( burpeeUrl );
					burpees = burpeesResult.data;
				}

				commit( "regionChanged", {
					selectedRegion,
					hims,
					selectedHimId,
					burpees,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		async changeHim( { commit }, himId ) {
			try {
				const url = `/api/hims/${ himId }/burpees?year=${ BURPEE_YEAR }`;
				const result = await axios.get( url );
				const burpees = result.data;
				commit( "himChanged", { himId, burpees, } );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		async changeHimStatus( { state, commit }, status ) {
			try {
				let burpees = pristineBurpees();
				const { selectedHimId, } = state;

				if ( status === HIM_STATUS.EXISTING && selectedHimId ) {
					const url = `/api/hims/${ selectedHimId }/burpees?year=${ BURPEE_YEAR }`;
					const result = await axios.get( url );
					burpees = result.data;
				}

				commit( "himStatusChanged", {
					status,
					burpees,

				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		async save( { state, getters, commit, } ) {
			const isNewUser = !getters.canSelectHim;
			let { selectedHimId } = state;
			let him = null;

			try {
				if ( isNewUser ) {
					const { validation } = getters;
					if ( validation.name ) {
						return notifyInfo( validation.name );
					}
					if ( validation.email ) {
						return notifyInfo( validation.email );
					}
					const { name, email, selectedRegion, selectedAO, } = state;
					const body = { f3_name: name.trim(), email: email.trim(), region: selectedRegion, };
					const himResult = await axios.post( "/api/hims", body );
					him = himResult.data;
					selectedHimId = him.him_id;
				}

				const burpeeURL = `/api/hims/${ selectedHimId }/burpees`;
				const { mergedBurpees } = getters;
				const burpeeResult = await axios.post( burpeeURL, mergedBurpees );

				commit( "burpeesSaved", {
					him,
					burpees: burpeeResult.data,
				} );
			} catch ( e ) {
				const { data, status } = e?.response || { data: "", status: 0, };
				if ( status === 400 ) {
					notifyError( `An error occurred saving your Burpee counts: ${ data || "unknown." }`, e );
				} else {
					notifyError( "An error occurred saving your Burpee counts. Please refresh the page and try again.", e );
				}
			}
		},
	},
};
