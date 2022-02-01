import { createStore, createLogger } from "vuex";
import signupPage from "./modules/signup-page";
import statsPage from "./modules/stats-page";
import finishStrongPage from "./modules/finish-strong-page";

const isDevEnvironment = process.env.NODE_ENV !== "production";

const store = createStore({
	modules: {
		signupPage,
		statsPage,
		finishStrongPage,
	},
	strict: isDevEnvironment,
	plugins: isDevEnvironment ? [ createLogger() ] : [],
});

export default store;
