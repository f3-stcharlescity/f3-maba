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
		year: "",
		day: "",
		globalCountrywideCount: 0,
		globalDailyCount: 0,
		regionCounts: [],
		paxCounts: [],
	};
};

export default {
	namespaced: true,
	state: pristineState(),
	getters: {
		globalCountrywideCount: state => state.globalCountrywideCount,
		globalDailyCount: state => state.globalDailyCount,
		regionCounts: state => state.regionCounts,
		paxCounts: state => state.paxCounts,
	},
	mutations: {
		storeInitialized( state, { year, day, globalCountrywideCount, globalDailyCount, regionCounts, paxCounts, } ) {
			Object.assign( state, pristineState( { year, day, } ) );
			state.globalCountrywideCount = globalCountrywideCount;
			state.globalDailyCount = globalDailyCount;
			state.regionCounts = regionCounts;
			state.paxCounts = paxCounts;
		},
	},
	actions: {
		async initializeStore( { commit }, { year, day, } ) {
			try {

				const statsResults = await Promise.all( [
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/global` ),
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/regions` ),
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/pax` ),
				] );

				const globalCounts = statsResults[ 0 ].data;
				const regionCounts = statsResults[ 1 ].data;
				const paxCounts = statsResults[ 2 ].data;

				commit( "storeInitialized", {
					year,
					day,
					globalCountrywideCount: globalCounts.cumulative_burpee_count,
					globalDailyCount: globalCounts.daily_burpee_count,
					regionCounts,
					paxCounts,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
	},
};
