import axios from "axios";

const pristineState = () => {
	return {
		regions: [],
		aos: {},
		hims: [],

		selectedDate: "",
		selectedMember: null,
		burpeeCount: 0,
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
	},
	mutations: {
		storeInitialized( state, { regions, aos, } ) {
			state.regions = regions;
			state.aos = aos;
		},
		changeSelectedDate( state, date ) {
			state.selectedDate = date;
		},
		changeSelectedMember( state, member ) {
			state.selectedMember = member;
		},
		changeBurpeeCount( state, count ) {
			state.burpeeCount = count;
		},
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
};
