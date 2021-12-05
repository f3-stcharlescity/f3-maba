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
		errors: {},

		regions: [],
		aos: {},
		aoHims: [],

		himStatus: HIM_STATUS.NEW,
		hasEnteredName: false,
		name: "",
		hasEnteredEmail: false,
		email: "",

		selectedRegion: NONE_REGION,
		selectedAO: NONE_AO,
		selectedHimId: "",
		burpees: pristineBurpees(),
		modifiedBurpees: {},
	};
};

export default {
	namespaced: true,

	state: pristineState(),
	getters: {
		errors: key => state => state.errors[ key ] || "",
		validation: ( state, getters ) => {
			const validation = {};
			if ( !getters.canSelectHim ) {
				if ( !state.name ) {
					validation.name = "Name is required.";
				}
				if ( !isEmailValid( state.email ) ) {
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
		aos: state => state.aos,
		regionAOs: state => {
			if ( !state.selectedRegion ) {
				return [];
			}

			return state.aos[ state.selectedRegion ] || [];
		},
		aoHims: state => state.aoHims,
		selectedRegion: state => state.selectedRegion,
		selectedAO: state => state.selectedAO,
		burpees: state => state.burpees,
		totalBurpees: ( state, getters ) => {
			return getters.mergedBurpees.reduce( ( total, burpee ) => {
				return total + burpee.count;
			}, 0 );
		},
		mergedBurpees: state => {
			return state.burpees.map( burpee => {
				const modifiedCount = state.modifiedBurpees[ burpee.date ] || 0;
				return {
					...burpee,
					count: modifiedCount || burpee.count,
				};
			} );
		},
		canSelectAO: state => ( state.selectedRegion && state.selectedRegion !== NONE_REGION ),
		realAOSelected: state => ( state.selectedAO && state.selectedAO !== NONE_AO ),
		selectedHimId: state => state.selectedHimId,
		himStatus: state => state.himStatus,
		canSelectHim: state => state.himStatus === HIM_STATUS.EXISTING,
		canCreateHim: state => state.himStatus === HIM_STATUS.NEW,
		hasEnteredName: state => state.hasEnteredName,
		hasEnteredEmail: state => state.hasEnteredEmail,
	},
	mutations: {
		storeInitialized( state, { regions, selectedRegion, aos, selectedAO, hims, selectedHimId, burpees, } ) {
			Object.assign( state, pristineState() );
			state.regions = regions;
			state.selectedRegion = selectedRegion;
			state.aos = aos;
			state.selectedAO = selectedAO;
			state.aoHims = hims;
			state.selectedHimId = selectedHimId;
			state.burpees = burpees;
		},
		aoHimsFetched( state, hims ) {
			state.aoHims = orderBy( hims, [ "f3_name", ], [ "asc", ] );
		},
		changeName( state, name ) {
			state.hasEnteredName = true;
			state.name = name;
		},
		changeEmail( state, email ) {
			state.hasEnteredEmail = true;
			state.email = email;
		},
		regionChanged( state, { selectedRegion, selectedAO, hims, selectedHimId, burpees, } ) {
			state.selectedRegion = selectedRegion;
			state.selectedAO = selectedAO;
			state.aoHims = hims;
			state.selectedHimId = selectedHimId;
			state.burpees = burpees;

			if ( hims.length === 0 ) {
				state.himStatus = HIM_STATUS.NEW;
			}
		},
		aoChanged( state, { selectedAO, hims, selectedHimId, burpees, } ) {
			state.selectedAO = selectedAO;
			state.aoHims = hims;
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
					...state.aoHims.filter( oldHim => oldHim.him_id !== him.him_id ),
					him,
				];
				state.aoHims = orderBy( hims, [ "f3_name", ], [ "asc", ] );
			}
		}
	},
	actions: {
		async initializeStore( { commit } ) {
			try {
				let selectedRegion = NONE_REGION;
				let selectedAO = NONE_AO;
				let selectedHimId = "";
				let burpees = pristineBurpees();

				const [ regions, aos, ] = await Promise.all( [
					axios.get( "/api/regions" ),
					axios.get( "/api/aos" ),
				] ).then( responses => {
					return [
						responses[ 0 ].data,
						responses[ 1 ].data
					];
				} );

				selectedRegion = regions[ 0 ] || NONE_REGION;
				selectedAO = aos[ selectedRegion ][ 0 ] || NONE_AO;

				const himUrl = `/api/hims?region=${ selectedRegion }&ao=${ selectedAO }`;
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
					aos,
					selectedAO,
					hims,
					selectedHimId,
					burpees,
				} );
			} catch ( e ) {
				console.error( e );
			}
		},
		async refreshAOHims( { state, commit } ) {
			try {
				const { selectedRegion: region, selectedAO: ao } = state;
				const params = [];
				if ( region ) params.push( `region=${ region }` );
				if ( ao ) params.push( `ao=${ ao }` );
				const url = `/api/hims?${ params.join( "&" ) }`;
				const result = await axios.get( url );
				commit( "aoHimsFetched", result.data );
			} catch ( e ) {
				console.error( e );
			}
		},
		async changeRegion( { state, commit }, region ) {
			try {
				let selectedRegion = region;
				let selectedAO = state.aos[ region ][ 0 ];
				let selectedHimId = "";
				let burpees = pristineBurpees();

				const himUrl = `/api/hims?region=${ selectedRegion }&ao=${ selectedAO }`;
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
					selectedAO,
					hims,
					selectedHimId,
					burpees,
				} );
			} catch ( e ) {
				console.error( e );
			}
		},
		async changeAO( { state, commit }, ao ) {
			try {
				const { selectedRegion, } = state;
				let selectedAO = ao;
				let selectedHimId = "";
				let burpees = pristineBurpees();

				const himUrl = `/api/hims?region=${ selectedRegion }&ao=${ selectedAO }`;
				const himResult = await axios.get( himUrl );
				const hims = himResult.data;

				if ( hims.length ) {
					selectedHimId = hims[ 0 ].him_id;
					const burpeeUrl = `/api/hims/${ selectedHimId }/burpees?year=${ BURPEE_YEAR }`;
					const burpeesResult = await axios.get( burpeeUrl );
					burpees = burpeesResult.data;
				}

				commit( "aoChanged", {
					selectedAO,
					hims,
					selectedHimId,
					burpees,
				} );
			} catch ( e ) {
				console.error( e );
			}
		},
		async changeHim( { commit }, himId ) {
			try {
				const url = `/api/hims/${ himId }/burpees?year=${ BURPEE_YEAR }`;
				const result = await axios.get( url );
				const burpees = result.data;
				commit( "himChanged", { himId, burpees, } );
			} catch ( e ) {
				console.error( e );
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
				console.error( e );
			}
		},
		async save( { state, getters, commit, } ) {
			const isNewUser = !getters.canSelectHim;
			let { selectedHimId } = state;
			let him = null;

			try {
				if ( isNewUser ) {
					const { name, email, selectedRegion, selectedAO, } = state;
					const body = { f3_name: name, email, region: selectedRegion, ao: selectedAO };
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
				console.error( e );
			}
		},
	},
};
