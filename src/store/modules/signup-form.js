import axios from "axios";

const pristineState = () => {
	return {
		regions: [],
		aos: {},

		selectedRegion: "",
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
		}
	},
	mutations: {
		storeInitialized(state, { regions, aos, }) {
			state.regions = regions;
			state.aos = aos;
		},
		selectRegion(state, selectedRegion) {
			state.selectedRegion = selectedRegion;
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
