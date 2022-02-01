import axios from "axios";
import {
	notifySuccess,
	notifyInfo,
	notifyError,
	notifyUnknownError,
} from "./notify";

const BURPEE_MONTH = "01";

const pristineState = () => {
	return {
		globalCountrywideCount: 0,
	};
};

export default {
	namespaced: true,
	state: pristineState(),
	getters: {
		globalCountrywideCount: state => state.globalCountrywideCount,
	},
	mutations: {
		storeInitialized( state, {
			globalCountrywideCount,
		} ) {
			Object.assign( state, pristineState() );
			state.globalCountrywideCount = globalCountrywideCount;
		},
	},
	actions: {
		async initializeStore( { commit, getters }, { year, day, } ) {
			try {
				const statsResults = await Promise.all( [
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/global` ),
				] );

				const globalCounts = statsResults[ 0 ].data;

				commit( "storeInitialized", {
					globalCountrywideCount: globalCounts.cumulative_burpee_count,
					globalDailyCount: globalCounts.daily_burpee_count,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
	},
};
