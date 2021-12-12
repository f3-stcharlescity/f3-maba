import { createStore, createLogger } from "vuex";
import signupPage from "./modules/signup-page";
import statsPage from "./modules/stats-page";

const isDevEnvironment = process.env.NODE_ENV !== "production";

const store = createStore({
	modules: {
		signupPage,
		statsPage,
	},
	strict: isDevEnvironment,
	plugins: isDevEnvironment ? [ createLogger() ] : [],
});

export default store;
