const Express = require("express");
const http = require("http");

let settings = global.settings = require("../settings.json");

if (typeof module !== 'undefined' && !module.parent) {
  let app = new Express();
  let server = http.createServer(app);

  require("./include")(app, server, 8000);

  server.listen(PORT);
} else {
  module.exports = require("./include");
}
