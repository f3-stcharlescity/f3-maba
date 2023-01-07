import axios from "axios";
import orderBy from "lodash/orderBy";
import range from "lodash/range";
import config from "@/config";
import { isEmailValid } from "@/lib/validation";
import { NONE_REGION } from "@/lib/enum";
import { padZero, today, } from "@/lib/util";
import { notifyError, notifyInfo, notifySuccess, notifyUnknownError, } from "./notify";

const HIM_STATUS = {
	NEW: "NEW",
	EXISTING: "EXISTING",
};

const pristineBurpees = ( { year = "", } = {} ) => {
	if ( !year ) {
		return [];
	}
	const allBurpees = [];
	const daysInJanuary = 31;
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

const pristineState = ( { year = "" } = {} ) => {
	return {
		isStoreInitialized: false,

		year,
		regions: [],
		hims: [],

		himStatus: HIM_STATUS.NEW,
		hasEnteredName: false,
		name: "",
		hasEnteredEmail: false,
		email: "",

		selectedRegion: NONE_REGION,
		selectedHimId: "",
		burpees: pristineBurpees( { year } ),
		modifiedBurpees: {},
	};
};

export default {
	namespaced: true,
	state: pristineState(),
	getters: {
		isYearClosed: _ => config.IS_YEAR_CLOSED,
		userCanRegister: _ => !config.IS_YEAR_CLOSED,
		userCanRecordBurpees: _ => !config.IS_YEAR_CLOSED,
		validation: ( state, getters ) => {
			const validation = {};
			if ( !getters.canSelectHim ) {
				if ( !state.name.trim() ) {
					validation.name = "Name is required.";
				}
				const trimmedEmail = state.email.trim();
				if ( trimmedEmail && !isEmailValid( trimmedEmail ) ) {
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
		burpeeYear: state => state.year,
		regions: state => state.regions,
		hims: state => {
			return orderBy( state.hims, h => h.f3_name.toLowerCase(), [ "asc" ] );
		},
		selectedRegion: state => state.selectedRegion,
		burpees: state => state.burpees,
		totalBurpees: ( state, getters ) => {
			return getters.mergedBurpees.reduce( ( total, burpee ) => {
				return total + burpee.count;
			}, 0 );
		},
		mtdTargetBurpees: _ => {
			const { day } = today();
			return day * 100;
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
		hasModifiedBurpees: state => !!Object.keys( state.modifiedBurpees ).length,
		selectedHimId: state => state.selectedHimId,
		himName: state => {
			if ( state.himStatus === HIM_STATUS.NEW ) {
				return state.name;
			}
			const selectedHim = state.hims.find( him => him.him_id === state.selectedHimId );
			if ( !selectedHim ) {
				return "";
			}
			return selectedHim.f3_name;
		},
		himStatus: state => state.himStatus,
		canSelectHim: state => {
			if ( config.IS_YEAR_CLOSED ) {
				return true;
			}
			return state.himStatus === HIM_STATUS.EXISTING;
		},
		canCreateHim: state => {
			if ( config.IS_YEAR_CLOSED ) {
				return false;
			}
			return state.himStatus === HIM_STATUS.NEW;
		},
		hasEnteredName: state => state.hasEnteredName,
		hasEnteredEmail: state => state.hasEnteredEmail,
	},
	mutations: {
		storeInitialized( state, { year, regions, selectedRegion, hims, selectedHimId, burpees, himStatus, } ) {
			Object.assign( state, pristineState( { year } ) );
			state.isStoreInitialized = true;
			state.regions = regions;
			state.selectedRegion = selectedRegion;
			state.hims = hims;
			state.selectedHimId = selectedHimId;
			state.burpees = burpees;
			state.himStatus = himStatus;

			localStorage.setItem( "selectedRegion", selectedRegion );
			localStorage.setItem( "selectedHimId", selectedHimId );
		},
		himsFetched( state, hims ) {
			state.hims = hims;
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
			state.himStatus = HIM_STATUS.NEW;
			state.modifiedBurpees = {};

			localStorage.setItem( "selectedRegion", selectedRegion );
			localStorage.setItem( "selectedHimId", selectedHimId );
		},
		himChanged( state, { himId, burpees } ) {
			state.selectedHimId = himId;
			state.modifiedBurpees = {};
			state.burpees = burpees;

			localStorage.setItem( "selectedHimId", himId );
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
				state.hims = hims;
				localStorage.setItem( "selectedHimId", state.selectedHimId );
			}

			notifySuccess( "Burpees updated." );
		},
		resetBurpees( state ) {
			state.modifiedBurpees = {};
		},
	},
	actions: {
		async initializeStore( { commit }, { year, } ) {
			try {
				let selectedRegion = NONE_REGION;
				let selectedHimId = "";
				let himStatus = HIM_STATUS.NEW;
				let burpees = pristineBurpees( { year } );

				const [ regions, ] = await Promise.all( [
					axios.get( "/api/regions" ),
				] ).then( responses => {
					return [
						responses[ 0 ].data,
					];
				} );

				selectedRegion = localStorage.getItem( "selectedRegion" ) || NONE_REGION;

				const himUrl = `/api/hims?region=${ selectedRegion }`;
				const himResult = await axios.get( himUrl );
				const hims = himResult.data;

				if ( hims.length ) {
					const storedHimId = localStorage.getItem( "selectedHimId" );
					selectedHimId = storedHimId || hims[ 0 ].him_id;
					if ( storedHimId ) {
						himStatus = HIM_STATUS.EXISTING;
					}
				}

				if ( himStatus === HIM_STATUS.EXISTING ) {
					const url = `/api/hims/${ selectedHimId }/burpees?year=${ year }`;
					const burpeesResult = await axios.get( url );
					burpees = burpeesResult.data;
				}

				commit( "storeInitialized", {
					year,
					regions,
					selectedRegion,
					hims,
					selectedHimId,
					himStatus,
					burpees,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		async resetStore( { state, commit } ) {
			try {
				const { year } = state;
				let selectedHimId = "";
				let burpees = pristineBurpees( { year } );

				const regions = [
					...state.regions,
				];

				const selectedRegion = NONE_REGION;

				const himUrl = `/api/hims?region=${ selectedRegion }`;
				const himResult = await axios.get( himUrl );
				const hims = himResult.data;

				if ( hims.length ) {
					selectedHimId = hims[ 0 ].him_id;
				}

				const himStatus = HIM_STATUS.NEW;

				commit( "storeInitialized", {
					year,
					regions,
					selectedRegion,
					hims,
					selectedHimId,
					himStatus,
					burpees,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		async changeRegion( { state, commit }, region ) {
			try {
				let selectedRegion = region;
				let selectedHimId = "";
				let burpees = pristineBurpees( { year: state.year } );

				const himUrl = `/api/hims?region=${ selectedRegion }`;
				const himResult = await axios.get( himUrl );
				const hims = himResult.data;

				if ( hims.length ) {
					selectedHimId = hims[ 0 ].him_id;
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
		async changeHim( { state, commit, }, himId ) {
			try {
				const { year } = state;
				const url = `/api/hims/${ himId }/burpees?year=${ year }`;
				const result = await axios.get( url );
				const burpees = result.data;
				commit( "himChanged", { himId, burpees, } );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		async changeHimStatus( { state, commit, }, status ) {
			try {
				let burpees = pristineBurpees( { year: state.year } );
				const { selectedHimId, year, } = state;

				if ( status === HIM_STATUS.EXISTING && selectedHimId ) {
					const url = `/api/hims/${ selectedHimId }/burpees?year=${ year }`;
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
					const { name, email, selectedRegion, } = state;
					const body = { f3_name: name.trim(), email: email.trim(), region: selectedRegion, };
					const himResult = await axios.post( "/api/hims", body );
					him = himResult.data;
					selectedHimId = him.him_id;
					notifyInfo( `Thanks for signing up ${ name }! In the future, choose your F3 name in the drop-down.` );
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
				if ( status >= 400 && status < 500 ) {
					notifyError( `An error occurred saving your Burpee counts: ${ data || "unknown." }`, e );
				} else {
					notifyError( "An error occurred saving your Burpee counts. Please refresh the page and try again.", e );
				}
			}
		},
	},
};
