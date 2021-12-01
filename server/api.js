const aos = require("./data/aos.json");
const regions = Object.keys(aos).sort();

const getAOs = (req, res) => {
	res.json(aos);
};

const getRegions = (req, res) => {
	res.json(regions);
};

module.exports = function (app) {
	app.get("/api/dialup", (req, res) => {
		res.send("dialup is not GeekSquad");
	});
	app.get("/api/aos", getAOs);
	app.get("/api/regions", getRegions);
}
