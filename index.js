const express = require("express");
const app = express();
const apiRoutes = require("./api/index");
const frontRoutes = require("./public/index");
const {join} = require("path");

app.use("/js", express.static(join(__dirname, "public", "js")));
app.use("/css", express.static(join(__dirname, "public", "css")));
app.use("/api", apiRoutes);
app.use("/", frontRoutes);

app.set('view engine', 'hbs');
app.set("views", join(__dirname, "public", "views"));

app.listen(3000);