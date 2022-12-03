import axios from "axios";
import { DateTime } from "luxon";
import { padZero } from "@/lib/util";
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
		topPaxCounts: [],
		dailyPaxCounts: [],
		regions: [],
	};
};

export default {
	namespaced: true,
	state: pristineState(),
	getters: {
		region: _ => {
			const windowURL = new URL( window.location.toString() );
			return ( windowURL.searchParams.get( "region" ) || "" ).trim();
		},
		formattedShortDate: _ => {
			const { pathname } = window.location;
			const pathParts = pathname.split( "/" );
			const year = pathParts[ 2 ];
			const day = pathParts[ 3 ];
			const date = `${ year }-01-${ padZero( day ) }`;
			return DateTime.fromFormat( date, "yyyy-MM-dd" )
				.toFormat("DD" ); // Jan 3, 2022
		},
		globalCountrywideCount: state => state.globalCountrywideCount,
		globalDailyCount: state => state.globalDailyCount,
		regionCounts: state => state.regionCounts,
		topPaxCounts: state => state.topPaxCounts,
		dailyPaxCounts: state => state.dailyPaxCounts,
		regions: state => state.regions,
	},
	mutations: {
		storeInitialized( state, {
			year,
			day,
			globalCountrywideCount,
			globalDailyCount,
			regionCounts,
			topPaxCounts,
			dailyPaxCounts,
			regions,
		} ) {
			Object.assign( state, pristineState( { year, day, } ) );
			state.globalCountrywideCount = globalCountrywideCount;
			state.globalDailyCount = globalDailyCount;
			state.regionCounts = regionCounts;
			state.topPaxCounts = topPaxCounts;
			state.dailyPaxCounts = dailyPaxCounts;
			state.regions = regions;
		},
	},
	actions: {
		async initializeStore( { commit, getters }, { year, day, } ) {
			try {
				const { region } = getters;
				const statsResults = await Promise.all( [
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/global?region=${ region }` ),
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/regions` ),
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/pax?region=${ region }` ),
					axios.get("/api/regions" ),
				] );

				const globalCounts = statsResults[ 0 ].data;
				const regionCounts = statsResults[ 1 ].data;
				const topPaxCounts = statsResults[ 2 ].data.top;
				const dailyPaxCounts = statsResults[ 2 ].data.daily;
				const regions = statsResults[ 3 ].data;

				commit( "storeInitialized", {
					year,
					day,
					globalCountrywideCount: globalCounts.cumulative_burpee_count,
					globalDailyCount: globalCounts.daily_burpee_count,
					regionCounts,
					topPaxCounts,
					dailyPaxCounts,
					regions,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
	},
};
