import axios from "axios";
import orderBy from "lodash/orderBy";

import { isEmailValid } from "@/lib/validation";
import { NONE_REGION, NONE_AO } from "@/lib/enum";
import range from "lodash/range";

const pristineBurpees = ( ) => {
	const allBurpees = [];
	const daysInJanuary = 31;
	const year = 2022;
	const padZero = n => n < 10 ? `0${ n }` : `${ n }`;
	for ( const day of range( 1, daysInJanuary + 1 ) ) {
		const date = `${ year }-01-${ padZero( day ) }`;
		const row = {
			date,
			count: 0,
		};
		allBurpees.push( row );
	}
	return allBurpees;
};

const pristineState = () => {
	return {
		globalError: "",

		regions: [],
		aos: {},
		aoHims: [],

		hasEnteredName: false,
		name: "",
		hasEnteredEmail: false,
		email: "",

		selectedRegion: NONE_REGION,
		selectedAO: NONE_AO,
		selectedHimId: "",
		burpees: pristineBurpees(),
	};
};

export default {
	namespaced: true,

	state: pristineState(),
	getters: {
		regions: state => state.regions,
		aos: state => state.aos,
		regionAOs: state => {
			if ( !state.selectedRegion ) {
				return [];
			}

			return state.aos[ state.selectedRegion ];
		},
		aoHims: state => state.aoHims,
		selectedRegion: state => state.selectedRegion,
		selectedAO: state => state.selectedAO,
		burpees: state => state.burpees,
		canSelectAO: state => ( state.selectedRegion && state.selectedRegion !== NONE_REGION ),
		canSelectHim: state => ( state.selectedAO && state.selectedAO !== NONE_AO ),
		hasEnteredName: state => state.hasEnteredName,
		hasEnteredEmail: state => state.hasEnteredEmail,
		isNameValid: state => !!state.name.trim(),
		isEmailValid: state => {
			return isEmailValid( state.email );
		},
	},
	mutations: {
		setGlobalError( state, error ) {
			state.globalError = error;
		},
		clearGlobalError( state ) {
			state.globalError = "";
		},
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
		},
		aoChanged( state, { selectedAO, hims, selectedHimId, burpees, } ) {
			state.selectedAO = selectedAO;
			state.aoHims = hims;
			state.selectedHimId = selectedHimId;
			state.burpees = burpees;
		},
		himSelected( state, { himId, burpees } ) {
			state.selectedHimId = himId;
			state.burpees = burpees;
		},
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

				let hims = [];
				if ( selectedAO !== NONE_AO ) {
					const himUrl = `/api/hims?region=${ selectedRegion }&ao=${ selectedAO }`;
					const himResult = await axios.get( himUrl );
					hims = himResult.data;
				}

				if ( hims.length ) {
					selectedHimId = hims[ 0 ].him_id;
					const burpeeUrl = `/api/hims/${ selectedHimId }/burpees?year=2022`;
					const burpeesResult = await axios.get( burpeeUrl );
					burpees = burpeesResult.data;
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

				let hims = [];
				if ( selectedAO !== NONE_AO ) {
					const himUrl = `/api/hims?region=${ selectedRegion }&ao=${ selectedAO }`;
					const himResult = await axios.get( himUrl );
					hims = himResult.data;
				}

				if ( hims.length ) {
					selectedHimId = hims[ 0 ].him_id;
					const burpeeUrl = `/api/hims/${ selectedHimId }/burpees?year=2022`;
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

				let hims = [];
				if ( selectedAO !== NONE_AO ) {
					const himUrl = `/api/hims?region=${ selectedRegion }&ao=${ selectedAO }`;
					const himResult = await axios.get( himUrl );
					hims = himResult.data;
				}

				if ( hims.length ) {
					selectedHimId = hims[ 0 ].him_id;
					const burpeeUrl = `/api/hims/${ selectedHimId }/burpees?year=2022`;
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
				const url = `/api/hims/${ himId }/burpees?year=2022`;
				const result = await axios.get( url );
				const burpees = result.data;
				commit( "himSelected", { himId, burpees, } );
			} catch ( e ) {
				console.error( e );
			}
		},
	},
};
