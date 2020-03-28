const Express = require("express");
const api = require("./api");
const homepage = require("./homepage");
const websocket = require("./websocket");
const session = require("express-session");
const path = require("path");
const ulid = require("ulid");

module.exports = function include(app, settings) {
  app.use(session({
    secret: settings.secret,
    genid: ulid.ulid,
    resave: false,
    saveUninitialized: false,
  }));

  app.use(path.join(settings.path, "/static/"), new Express.static(path.join(__dirname, "../static")));
  app.get(path.join(settings.path, "/api/:node"), api(settings));
  app.ws(path.join(settings.path, "/ws/:id"), websocket(settings));
  app.get(path.join(settings.path, "/"), homepage(settings));
  app.get(path.join(settings.path, "/:id"), homepage(settings));

  global.games = {};
}
