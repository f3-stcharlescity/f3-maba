import {createRouter, createWebHistory} from "vue-router";
import SignupForm from "@/components/SignupForm.vue";

export default function ({ store }) {
	const routes = [
		{
			path: "/",
			name: "MABA - Signup",
			component: SignupForm,
			beforeEnter(to, from, next) {
				store.dispatch("signupForm/initializeStore");
				next();
			}
		},
	];

	return createRouter({
		history: createWebHistory(),
		routes,
	});
}
