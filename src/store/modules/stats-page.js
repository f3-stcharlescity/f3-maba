import axios from "axios";
import {
	notifySuccess,
	notifyInfo,
	notifyError,
	notifyUnknownError,
} from "./notify";

const urlParams = new URLSearchParams( location.search );

const today = new Date();
const BURPEE_YEAR = today.getFullYear().toString();
const BURPEE_MONTH = "01";
const BURPEE_DAY = urlParams.get( "day" ) || today.getDate().toString();

const pristineState = ( { year, } ) => {
	return {
		year,
		globalCountrywideCount: 0,
		globalDailyCount: 0,
		regionCounts: [],
		paxCounts: [],
	};
};

export default {
	namespaced: true,
	state: pristineState( { year: BURPEE_YEAR, } ),
	getters: {
		globalCountrywideCount: state => state.globalCountrywideCount,
		globalDailyCount: state => state.globalDailyCount,
		regionCounts: state => state.regionCounts,
		paxCounts: state => state.paxCounts,
	},
	mutations: {
		storeInitialized( state, { year, globalCountrywideCount, globalDailyCount, regionCounts, paxCounts, } ) {
			Object.assign( state, pristineState( { year } ) );
			state.globalCountrywideCount = globalCountrywideCount;
			state.globalDailyCount = globalDailyCount;
			state.regionCounts = regionCounts;
			state.paxCounts = paxCounts;
		},
	},
	actions: {
		async initializeStore( { commit }, { year, } ) {
			try {

				const statsResults = await Promise.all( [
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ BURPEE_DAY }/global` ),
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ BURPEE_DAY }/regions` ),
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ BURPEE_DAY }/pax` ),
				] );

				const globalCounts = statsResults[ 0 ].data;
				const regionCounts = statsResults[ 1 ].data;
				const paxCounts = statsResults[ 2 ].data;

				commit( "storeInitialized", {
					year,
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
