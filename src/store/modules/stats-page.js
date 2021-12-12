const pristineState = () => {
	return {};
};

export default {
	namespaced: true,
	state: pristineState(),
	getters: {},
	mutations: {
		storeInitialized( state, {} ) {
		},
	},
	actions: {
		initializeStore( { commit } ) {
			try {
				commit( "storeInitialized", {} );
			} catch ( e ) {
				console.error( e );
			}
		},
		resetStore({commit}) {
			try {
				commit( "storeInitialized", {} );
			} catch ( e ) {
				console.error( e );
			}
		},
	},
};
