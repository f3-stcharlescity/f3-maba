const express = require("express");
const serveStatic = require("serve-static")
const path = require("path");
const app = express();
app.use(serveStatic(path.join(__dirname, "..", "dist")));
app.get("/dialup", (req, res) => {
	res.send("dialup is not GeekSquad");
});
const port = process.env.PORT || 3000;
app.listen(port);
