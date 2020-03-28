# connect-square

A very simple, yet-to-be-solved, two-player game.

The goal of this game is to be the first to connect two opposite corners of the board by drawing over edges of a 4x4 grid.

## Installation

Clone this repository if you wish to run it as-is, or otherwise include it with `npm`.

### Standalone installation

```sh
git clone https://github.com/adri326/connect-square
```

Edit `settings.json` to match your setup and run the server with `node .`

### Including the module

```sh
npm i https://github.com/adri326/connect-square
```

```js
// Prerequisites
let app = new Express();
let server = http.createServer();

// Before any app.use():
require("express-ws")(app, server);

// All of your things...

require("connect-square")(app, {
  port: 80,
  path: "/connect-square/",
  url: "localhost",
  websocket_protocol: "ws",
  secret: "my secret" // used for sessions
});
```
