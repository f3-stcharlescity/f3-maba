import axios from "axios";

import { isEmailValid } from "@/lib/validation";
import { NONE_REGION, NONE_AO } from "@/lib/enum";

const pristineState = () => {
	return {
		regions: [],
		aos: {},

		hasEnteredName: false,
		name: "",
		hasEnteredEmail: false,
		email: "",

		selectedRegion: NONE_REGION,
		selectedAO: NONE_AO,
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
		selectedRegion: state => state.selectedRegion,
		selectedAO: state => state.selectedAO,
		canSelectAO: state => ( state.selectedRegion && state.selectedRegion !== NONE_REGION ),
		hasEnteredName: state => state.hasEnteredName,
		hasEnteredEmail: state => state.hasEnteredEmail,
		isNameValid: state => !!state.name.trim(),
		isEmailValid: state => {
			return isEmailValid( state.email );
		},
	},
	mutations: {
		storeInitialized( state, { regions, aos, } ) {
			state.regions = regions;
			state.selectedRegion = regions[ 0 ];
			state.aos = aos;
		},
		selectRegion( state, selectedRegion ) {
			state.selectedRegion = selectedRegion;
			if ( selectedRegion === NONE_REGION ) {
				state.selectedAO = NONE_AO;
			}
		},
		selectAO( state, ao ) {
			state.selectedAO = ao;
		},
		changeName( state, name ) {
			state.hasEnteredName = true;
			state.name = name;
		},
		changeEmail( state, email ) {
			state.hasEnteredEmail = true;
			state.email = email;
		}
	},
	actions: {
		async initializeStore( { commit } ) {
			try {
				const [ regions, aos, ] = await Promise.all( [
					axios.get( "/api/regions" ),
					axios.get( "/api/aos" ),
				] ).then( responses => {
					return [
						responses[ 0 ].data,
						responses[ 1 ].data
					];
				} );
				commit( "storeInitialized", { regions, aos, } );
			} catch ( e ) {
				console.error( "initApp", e );
			}
		},
	},
}
