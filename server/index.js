const express = require("express");
const serveStatic = require("serve-static")
const path = require("path");
const api = require("./api");

const app = express();
app.use(serveStatic(path.join(__dirname, "..", "dist")));
api(app);
const port = process.env.PORT || 3000;
app.listen(port);
