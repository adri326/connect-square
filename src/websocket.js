module.exports = function(ws, req) {
  const game_id = req.params.id;

  if (!(/^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.exec(game_id))) {
    // console.error("Malformed ID");
    ws.send("Malformed ID");
    ws.terminate();
    return;
  }

  let game = games[game_id];

  if (!game) {
    // console.error("Game not found");
    ws.send("Game not found");
    ws.terminate();
    return;
  }

  if (!req.session) {
    // console.error("No session");
    ws.send("No session");
    ws.terminate();
    return;
  };

  let player = 0;

  if (req.session.games && req.session.games.find(([id]) => id === game.id)) {
    let reg = req.session.games.find(([id]) => id === game.id);
    console.log(reg);
    if (!game.player_a && reg[1] === 0) {
      game.player_a = req.session;
      player = reg[1] = game.player_a_color;
      ws.send(JSON.stringify({kind: "joined_as", color: player}));
      req.session.save(console.error);
    } else if (!game.player_b && reg[1] === 0) {
      game.player_b = req.session;
      player = reg[1] = 3 - game.player_a_color;
      ws.send(JSON.stringify({kind: "joined_as", color: player}));
      req.session.save(console.error);
    } else {
      player = reg[1];
    }
    console.log(reg);
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
    // console.log(`Goodbye player ${player} on game ${game_id}`);
    let index = game.sockets.findIndex((x) => x === ws);
    game.sockets.splice(index, 1);
  });

  ws.send(JSON.stringify({kind: "update", board: game.board, turn: game.turn, active: game.active}));

  // console.log(`Hello player ${player} on game ${game_id}`);
}
