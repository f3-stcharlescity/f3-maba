import axios from "axios";

import { isEmailValid } from "@/lib/validation";

const pristineState = () => {
	return {
		regions: [],
		aos: {},

		selectedRegion: "",
		hasEnteredName: false,
		name: "",
		hasEnteredEmail: false,
		email: "",
	}
}

export default {
	namespaced: true,

	state: pristineState(),
	getters: {
		regions: state => state.regions,
		aos: state => state.aos,
		regionAOs: state => {
			if (!state.selectedRegion) {
				return [];
			}

			return state.aos[state.selectedRegion];
		},
		hasEnteredName: state => state.hasEnteredName,
		hasEnteredEmail: state => state.hasEnteredEmail,
		isNameValid: state => !!state.name.trim(),
		isEmailValid: state => {
			return isEmailValid(state.email);
		},
	},
	mutations: {
		storeInitialized(state, { regions, aos, }) {
			state.regions = regions;
			state.aos = aos;
		},
		selectRegion(state, selectedRegion) {
			state.selectedRegion = selectedRegion;
		},
		changeName(state, name) {
			state.hasEnteredName = true;
			state.name = name;
		},
		changeEmail(state, email) {
			state.hasEnteredEmail = true;
			state.email = email;
		}
	},
	actions: {
		async initializeStore({ commit }) {
			try {
				const [regions, aos,] = await Promise.all([
					axios.get("/regions"),
					axios.get("/aos"),
				]).then(responses => {
					return [
						responses[0].data,
						responses[1].data
					];
				});
				commit("storeInitialized", {regions, aos,});
			} catch (e) {
				console.error("initApp", e);
			}
		},
	},
}
