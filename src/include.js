const Express = require("express");
const api = require("./api");
const homepage = require("./homepage");
const websocket = require("./websocket");
const session = require("express-session");
const path = require("path");
const ulid = require("ulid");

module.exports = function include(app, server) {
  let settings = global.settings = require("../settings.json");
  let express_ws = require("express-ws")(app, server);

  app.use(session({
    secret: settings.secret,
    genid: ulid.ulid,
    resave: false,
    saveUninitialized: false,
  }));

  app.use(path.join(settings.path, "/static/"), new Express.static(path.join(__dirname, "./static")));
  app.use(path.join(settings.path, "/node_modules/"), new Express.static(path.join(__dirname, "./node_modules")));
  app.get(path.join(settings.path, "/api/:node"), api);
  app.ws(path.join(settings.path, "/ws/:id"), websocket);
  app.get(path.join(settings.path, "/"), homepage);
  app.get(path.join(settings.path, "/:id"), homepage);

  global.games = {};
}
