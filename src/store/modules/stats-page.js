import axios from "axios";
import { DateTime } from "luxon";
import config from "@/config";
import { padZero } from "@/lib/util";
import {
	notifySuccess,
	notifyInfo,
	notifyError,
	notifyUnknownError,
} from "./notify";

const {
	ENABLE_REGION_STATS,
	ENABLE_PAX_STATS,
	ENABLE_PACING_STATS
} = config;

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
		pacingCounts: [],
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
		pacingCounts: state => state.pacingCounts,
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
			pacingCounts,
			regions,
		} ) {
			Object.assign( state, pristineState( { year, day, } ) );
			state.globalCountrywideCount = globalCountrywideCount;
			state.globalDailyCount = globalDailyCount;
			state.regionCounts = regionCounts;
			state.topPaxCounts = topPaxCounts;
			state.dailyPaxCounts = dailyPaxCounts;
			state.pacingCounts = pacingCounts;
			state.regions = regions;
		},
	},
	actions: {
		async initializeStore( { commit, getters }, { year, day, } ) {
			try {
				const { region } = getters;
				const statsResults = await Promise.all( [
					axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/global?region=${ region }` ),
					ENABLE_REGION_STATS ?
						axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/regions` ) :
						Promise.resolve( { data: [], } ),
					ENABLE_PAX_STATS ?
						axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/pax?region=${ region }` ) :
						Promise.resolve({ data: { top: [], daily: [], } } ),
					ENABLE_PACING_STATS ?
						axios.get( `/api/stats/${ year }/${ BURPEE_MONTH }/${ day }/pacing` ) :
						Promise.resolve( { data: { pacing: [] } } ),
					axios.get("/api/regions" ),
				] );

				const globalCounts = statsResults[ 0 ].data;
				const regionCounts = statsResults[ 1 ].data;
				const topPaxCounts = statsResults[ 2 ].data.top;
				const dailyPaxCounts = statsResults[ 2 ].data.daily;
				const pacingCounts = statsResults[3].data.pacing;
				const regions = statsResults[ 4 ].data;

				commit( "storeInitialized", {
					year,
					day,
					globalCountrywideCount: globalCounts.cumulative_burpee_count,
					globalDailyCount: globalCounts.daily_burpee_count,
					regionCounts,
					topPaxCounts,
					dailyPaxCounts,
					pacingCounts,
					regions,
				} );
			} catch ( e ) {
				notifyUnknownError( e );
			}
		},
	},
};
