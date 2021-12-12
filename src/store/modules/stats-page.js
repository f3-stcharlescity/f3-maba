const pristineState = () => {
	return {};
};

export default {
	namespaced: true,
	state: pristineState(),
	getters: {
		globalCountrywideCount( state ) {
			return 3650;
		},
		globalDailyCount( state ) {
			return 500;
		},
		regionCounts( state ) {
			return [
				{
					region: "St. Charles",
					cumulativeBurpeeCount: 900,
					todaysBurpeeCount: 100,
				},
				{
					region: "St. Louis",
					cumulativeBurpeeCount: 1002,
					todaysBurpeeCount: 150,
				},
				{
					region: "Jefferson County",
					cumulativeBurpeeCount: 900,
					todaysBurpeeCount: 100,
				},
				{
					region: "Lala Land",
					cumulativeBurpeeCount: 1002,
					todaysBurpeeCount: 150,
				},
			];
		},
		paxCounts( state ) {
			return [
				{
					him: "Banjo",
					region: "St. Charles",
					cumulativeBurpeeCount: 200,
					todaysBurpeeCount: 50,
				},
				{
					him: "dialup",
					region: "St. Charles",
					cumulativeBurpeeCount: 100,
					todaysBurpeeCount: 100,
				},
				{
					him: "Cowbell",
					region: "St. Charles",
					cumulativeBurpeeCount: 150,
					todaysBurpeeCount: 90,
				},
			];
		},
	},
	mutations: {
		storeInitialized( state, {} ) {
		},
	},
	actions: {
		initializeStore( { commit } ) {
			try {
				commit( "storeInitialized", {} );
			} catch ( e ) {
				console.error( e );
			}
		},
		resetStore( { commit } ) {
			try {
				commit( "storeInitialized", {} );
			} catch ( e ) {
				console.error( e );
			}
		},
	},
};
