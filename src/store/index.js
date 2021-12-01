import { createStore, createLogger } from "vuex";
import signupForm from "./modules/signup-form";

const isDevEnvironment = process.env.NODE_ENV !== "production";

const store = createStore({
	modules: {
		signupForm
	},
	strict: isDevEnvironment,
	plugins: isDevEnvironment ? [ createLogger() ] : [],
});

export default store;
