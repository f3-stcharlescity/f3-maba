import { createRouter, createWebHistory } from "vue-router";
import config from "@/config";
import { today } from "@/lib/util";
import SignupPage from "@/components/SignupPage";
import StatsPage from "@/components/StatsPage";

const { TARGET_YEAR, TARGET_MONTH, } = config;

export default function ( { store } ) {
	const routes = [
		{
			path: "/",
			redirect: `/signup/${ TARGET_YEAR }`,
		},
		//
		// signup
		//
		{
			path: "/signup",
			redirect: `/signup/${ TARGET_YEAR }`,
		},
		{
			path: "/signup/:year",
			name: "signup",
			component: SignupPage,
			beforeEnter( to, from, next ) {
				const { params } = to;
				const { year } = params;
				document.title = `MABA - Signup - ${ year }`;
				store.dispatch( "signupPage/initializeStore", { year, } );
				next();
			}
		},
		//
		// stats
		//
		{
			path: "/stats",
			beforeEnter( to, from, next ) {
				// got to stats for the FIRST of the month
				let url = `/stats/${ TARGET_YEAR }/01`;
				const { year, month, day } = today();
				if ( year === TARGET_YEAR && month === TARGET_MONTH ) {
					// go to stats for TODAY
					url = `/stats/${ TARGET_YEAR }/${ day }`;
				}
				next( url );
			}
		},
		{
			path: "/stats/:year/:day",
			name: "stats",
			component: StatsPage,
			beforeEnter( to, from, next ) {
				const { params } = to;
				const { year, day, } = params;
				document.title = `MABA - Stats - ${ year }`;
				store.dispatch( "statsPage/initializeStore", { year, day, } );
				next();
			}
		}
	];

	return createRouter( {
		history: createWebHistory(),
		routes,
	} );
}
