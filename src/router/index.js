import {createRouter, createWebHistory} from "vue-router";
import SignupForm from "@/components/SignupForm.vue";
import SubmitForm from "@/components/SubmitForm.vue";

export default function ({ store }) {
	const routes = [
		{
			path: "/",
			name: "root",
			redirect: { name: "signup", }
		},
		{
			path: "/signup",
			name: "signup",
			component: SignupForm,
			beforeEnter(to, from, next) {
				document.title = "MABA - Signup";
				store.dispatch("signupForm/initializeStore");
				next();
			}
		},
		{
			path: "/submit",
			name: "submit",
			component: SubmitForm,
			beforeEnter(to, from, next) {
				document.title = "MABA - Submit Burpees";
				store.dispatch("submitForm/initializeStore");
				next();
			}
		}
	];

	return createRouter({
		history: createWebHistory(),
		routes,
	});
}
