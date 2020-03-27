const Express = require("express");
const api = require("./api");
const homepage = require("./homepage");
const websocket = require("./websocket");
const session = require("express-session");
const http = require("http");
const path = require("path");
const ulid = require("ulid");

const PORT = global.PORT = 8000;
let settings = global.settings = require("../settings.json");

let app = new Express();
let server = http.createServer(app);
let express_ws = require("express-ws")(app, server);

app.use(session({
  secret: "hedge skipper",
  genid: ulid.ulid,
  resave: false,
  saveUninitialized: false,
}));
app.use("/static/", new Express.static("./static"));
app.use("/node_modules/", new Express.static("./node_modules"));
app.get("/api/:node", api);
app.ws("/ws/:id", websocket);
app.get("/", homepage);
app.get("/:id", homepage);

server.listen(PORT);

global.games = {};
