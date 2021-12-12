import { createRouter, createWebHistory } from "vue-router";
import SignupPage from "@/components/SignupPage";
import StatsPage from "@/components/StatsPage";

export default function ( { store } ) {
	const routes = [
		{
			path: "/",
			name: "root",
			redirect: { name: "signup", }
		},
		{
			path: "/signup",
			name: "signup",
			component: SignupPage,
			beforeEnter( to, from, next ) {
				document.title = "MABA - Signup";
				store.dispatch( "signupPage/initializeStore" );
				next();
			}
		},
		{
			path: "/stats",
			name: "stats",
			component: StatsPage,
			beforeEnter( to, from, next ) {
				document.title = "MABA - Stats";
				store.dispatch( "statsPage/initializeStore" );
				next();
			}
		}
	];

	return createRouter( {
		history: createWebHistory(),
		routes,
	} );
}
