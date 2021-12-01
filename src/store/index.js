import { createStore, createLogger } from "vuex";
import signupForm from "./modules/signup-form";
import submitForm from "./modules/submit-form";

const isDevEnvironment = process.env.NODE_ENV !== "production";

const store = createStore({
	modules: {
		signupForm,
		submitForm,
	},
	strict: isDevEnvironment,
	plugins: isDevEnvironment ? [ createLogger() ] : [],
});

export default store;
