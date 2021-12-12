import { createRouter, createWebHistory } from "vue-router";
import SignupPage from "@/components/SignupPage";
import StatsPage from "@/components/StatsPage";

export default function ( { store } ) {
	const routes = [
		{
			path: "/",
			redirect: "/signup/2022",
		},
		//
		// signup
		//
		{
			path: "/signup",
			redirect: "/signup/2022",
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
			redirect: "/stats/2022",
		},
		{
			path: "/stats/:year",
			name: "stats",
			component: StatsPage,
			beforeEnter( to, from, next ) {
				const { params } = to;
				const { year } = params;
				document.title = `MABA - Stats - ${ year }`;
				store.dispatch( "statsPage/initializeStore", { year, } );
				next();
			}
		}
	];

	return createRouter( {
		history: createWebHistory(),
		routes,
	} );
}
