module.exports = function(ws, req) {
  const game_id = req.params.id;

  if (!(/^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.exec(game_id))) {
    console.error("Malformed ID");
    ws.send("Malformed ID");
    ws.terminate();
    return;
  }

  let game = games[game_id];

  if (!game) {
    console.error("Game not found");
    ws.send("Game not found");
    ws.terminate();
    return;
  }

  if (!req.session) {
    console.error("No session");
    ws.send("No session");
    ws.terminate();
    return;
  };

  let player = 0;

  if (req.session.games && req.session.games.find(([id]) => id === game.id)) {
    player = req.session.games.find(([id]) => id === game.id)[1];
  }

  game.sockets.push(ws);

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      ws.send(e.toString());
      ws.terminate();
      return;
    }
    if (!data || !data.kind) return;
    if (data.kind === "turn" && player) {
      if (
        game.turn === player
        && Array.isArray(data.pos)
        && data.pos.length == 2
        && !isNaN(+data.pos[0])
        && ~~data.pos[0] === data.pos[0]
        && data.pos[0] >= 0
        && data.pos[0] < 4
        && !isNaN(+data.pos[1])
        && ~~data.pos[1] === data.pos[1]
        && data.pos[1] >= 0
        && data.pos[1] < 7
        && game.board[data.pos[1]][data.pos[0]] === 0
        && game.active
      ) {
        game.play(...data.pos, player);
      } else {
        ws.send(JSON.stringify({kind: "update", board: game.board, turn: game.turn, active: game.active}));
      }
    }
    if (data.kind === "sync") {
      ws.send(JSON.stringify({kind: "update", board: game.board, turn: game.turn, active: game.active}));
    }
  });

  ws.on("close", (msg) => {
    console.log(`Goodbye player ${player} on game ${game_id}`);
    let index = game.sockets.findIndex((x) => x === ws);
    game.sockets.splice(index, 1);
  });

  ws.send(JSON.stringify({kind: "update", board: game.board, turn: game.turn, active: game.active}));

  console.log(`Hello player ${player} on game ${game_id}`);
}
