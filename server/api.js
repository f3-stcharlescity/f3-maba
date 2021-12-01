const aos = require("./data/aos.json");
const regions = Object.keys(aos).sort();

const getAOs = (req, res) => {
	res.json(aos);
};

const getRegions = (req, res) => {
	res.json(regions);
};

module.exports = function (app) {
	app.get("/dialup", (req, res) => {
		res.send("dialup is not GeekSquad");
	});
	app.get("/aos", getAOs);
	app.get("/regions", getRegions);
}
