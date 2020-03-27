const fs = require("fs");
const path = require("path");
const Game = require("./game");

let index_src = fs.readFileSync(path.join(__dirname, "../html/index.html"), "utf8");
let game_src = fs.readFileSync(path.join(__dirname, "../html/game.html"), "utf8");

module.exports = function homepage(req, res, next) {
  if (req.params.id) {
    let color = +req.query.color === 1 || +req.query.color === 2 ? +req.query.color : (Math.random() < 0.5) ? 1 : 2;
    if (!(/^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.exec(req.params.id))) {
      res.write("Malformed ID");
      res.status(404);
      res.send();
      return;
    }

    let game = games[req.params.id];
    if (!game) {
      game = games[req.params.id] = new Game(req.params.id, color, req.session);
    } else {
      if (req.session.games) {
        console.log(req.session.games);
        let reg = req.session.games.find(([id]) => id === game.id);
        if (!reg) color = 0;
        else color = reg[1];
      } else color = 0;

      if (!game.player_b && (!req.session.games || !req.session.games.find(([id]) => id === game.id))) {
        color = 3 - game.player_a_color;
        game.player_b = req.session;
        if (req.session.games) {
          req.session.games.push([game.id, color]);
        } else {
          req.session.games = [[game.id, color]];
        }
      }
    }

    let rematch_url = game.rematch_url;
    if (+req.query.color === 1) rematch_url += "?color=1"
    else if (+req.query.color === 2) rematch_url += "?color=2"

    res.write(game_src
      .replace(/{ID}/g, req.params.id)
      .replace(/{COLOR}/g, color)
      .replace(/{COLOR_NAME}/g, color == 1 ? "blue" : color == 2 ? "red" : "spectating")
      .replace(/{WS_URL}/g, `ws://${settings.url}:${PORT}/ws/${req.params.id}`)
      .replace(/{REMATCH_URL}/g, color ? rematch_url : "")
    );
  } else {
    res.write(index_src);
  }
  res.end();
}
