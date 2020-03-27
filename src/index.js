const Express = require("express");
const http = require("http");

let settings = global.settings = require("../settings.json");

if (typeof module !== 'undefined' && !module.parent) {
  const PORT = global.PORT = 8000;
  let app = new Express();
  let server = http.createServer(app);

  require("./include")(app, server);

  server.listen(PORT);
} else {
  module.exports = require("./include");
}
