const Express = require("express");
const http = require("http");

let settings = global.settings = require("../settings.json");

if (typeof module !== 'undefined' && !module.parent) {
  let settings = require("../settings.json");
  let app = new Express();
  let server = http.createServer(app);

  let express_ws = require("express-ws")(app, server);

  require("./include")(app, settings);

  server.listen(settings.port);
} else {
  module.exports = require("./include");
}
