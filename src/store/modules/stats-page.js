import axios from "axios";
import {
	notifySuccess,
	notifyInfo,
	notifyError,
	notifyUnknownError,
} from "./notify";

const urlParams = new URLSearchParams( location.search );

const BURPEE_YEAR = urlParams.get( "year" ) || "2022";
const BURPEE_MONTH = urlParams.get( "month" ) || "01";
const BURPEE_DAY = urlParams.get( "day" ) || ( new Date() ).getDate().toString();

const pristineState = () => {
	return {
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
		storeInitialized( state, { globalCountrywideCount, globalDailyCount, regionCounts, paxCounts, } ) {
			Object.assign( state, pristineState() );
			state.globalCountrywideCount = globalCountrywideCount;
			state.globalDailyCount = globalDailyCount;
			state.regionCounts = regionCounts;
			state.paxCounts = paxCounts;
		},
	},
	actions: {
		async initializeStore( { commit } ) {
			try {

				const statsResults = await Promise.all( [
					axios.get( `/api/stats/${ BURPEE_YEAR }/${ BURPEE_MONTH }/${ BURPEE_DAY }/global` ),
					axios.get( `/api/stats/${ BURPEE_YEAR }/${ BURPEE_MONTH }/${ BURPEE_DAY }/regions` ),
					axios.get( `/api/stats/${ BURPEE_YEAR }/${ BURPEE_MONTH }/${ BURPEE_DAY }/pax` ),
				] );

				const globalCounts = statsResults[ 0 ].data;
				const regionCounts = statsResults[ 1 ].data;
				const paxCounts = statsResults[ 2 ].data;

				commit( "storeInitialized", {
					globalCountrywideCount: globalCounts.cumulative_burpee_count,
					globalDailyCount: globalCounts.daily_burpee_count,
					regionCounts,
					paxCounts,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
		resetStore( { commit } ) {
			try {
				commit( "storeInitialized", pristineState() );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
	},
};
