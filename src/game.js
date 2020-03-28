"use strict";

const ulid = require("ulid");

module.exports = class Game {
  constructor(id, color) {
    this.id = id;
    this.player_a_color = color;
    this.player_a = null;
    this.player_b = null;
    this.turn = 1;
    this.board = new Array(7).fill(0).map(x => new Array(4).fill(0));
    this.sockets = [];
    this.active = true;
    this.size = 4;
    this.rematch_url = ulid.ulid();
  }

  play(x, y, player) {
    this.turn = 3 - player;
    this.board[y][x] = player;
    if (this.is_over()) {
      this.active = false;
    }
    this.sockets.forEach((socket) => {
      socket.send(JSON.stringify({
        kind: "update",
        board: this.board,
        turn: this.turn,
        active: this.active
      }));
    });
  }

  is_over() {
    for (let player = 1; player < 3; player++) {
      for (let direction = 0; direction < 2; direction++) {
        let to_visit = [];
        let visited = [];

        if (direction === 0) {
        to_visit.push([0, 0]);
        to_visit.push([0, 1]);
      } else {
        to_visit.push([this.size - 2, 0]);
        to_visit.push([this.size - 1, 1]);
      }

        let current;
        while (current = to_visit.shift()) {
          let [x, y] = current;
          if (visited.find(([x2, y2]) => x2 === x && y2 === y)) continue;
          visited.push(current);
          if (this.board[y][x] === player) {
            if (direction === 0 && y === this.size * 2 - 3 && x === this.size - 1
              || direction === 0 && y === this.size * 2 - 2 && x === this.size - 2
              || direction === 1 && y === this.size * 2 - 3 && x === 0
              || direction === 1 && y === this.size * 2 - 2 && x === 0
            ) return player;
            if (y % 2) {
              if (y !== this.size * 2 - 3) to_visit.push([x, y + 2]);
              if (y !== 1) to_visit.push([x, y - 2]);
              if (x > 0) {
                to_visit.push([x - 1, y + 1]);
                to_visit.push([x - 1, y - 1]);
              }
              if (x !== this.size - 1) {
                to_visit.push([x, y + 1]);
                to_visit.push([x, y - 1]);
              }
            } else {
              if (x !== this.size - 2) to_visit.push([x + 1, y]);
              if (x > 0) to_visit.push([x - 1, y]);
              if (y !== this.size * 2 - 2) {
                to_visit.push([x, y + 1]);
                to_visit.push([x + 1, y + 1]);
              }
              if (y !== 0) {
                to_visit.push([x, y - 1]);
                to_visit.push([x + 1, y - 1]);
              }
            }
          }
        }
      }
    }
    return 0;
  }
}
