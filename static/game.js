let board = new Array(7).fill(0).map(x => new Array(4).fill(0));
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
let turn = 0;
let active = false; // waiting for initial update

const CIRCLE_COLOR = "#404040";
const BOARD_SIZE = 4;
const COLORS = ["#e0e0e0", "#4faff7", "#e8615d", "#96d1ff", "#ff9e9c"];
const COLORS_HOVER = ["#f0f0f0", "#54b4ff", "#eb6562", "#96d1ff", "#ff9e9c"];

let mouse_pos = [0, 0];

function get_pos(x, y) {
  let s = canvas.width - circle_radius * 2;
  return [circle_radius + x * s / (BOARD_SIZE - 1), circle_radius + y * s / (BOARD_SIZE - 1)];
}

function draw_game() {
  if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  circle_radius = canvas.width > (BOARD_SIZE * 100) ? 32 : 16;
  line_width = circle_radius / Math.sqrt(2) * 2;

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (x != BOARD_SIZE - 1) {
        let from = get_pos(x, y);
        let to = get_pos(x + 1, y);
        let mouse_over = mouse_pos[0] >= from[0] && mouse_pos[0] <= to[0]
          && mouse_pos[1] >= from[1] - line_width / 2 && mouse_pos[1] <= from[1] + line_width / 2;
        ctx.fillStyle = (mouse_over && turn === COLOR && active ? COLORS_HOVER : COLORS)[board[y * 2][x]];
        ctx.fillRect(from[0], from[1] - line_width / 2, to[0] - from[0], line_width);
      }
      if (y != BOARD_SIZE - 1) {
        let from = get_pos(x, y);
        let to = get_pos(x, y + 1);
        let mouse_over = mouse_pos[1] >= from[1] && mouse_pos[1] <= to[1]
          && mouse_pos[0] >= from[0] - line_width / 2 && mouse_pos[0] <= from[0] + line_width / 2;
        ctx.fillStyle = (mouse_over && turn === COLOR && active ? COLORS_HOVER : COLORS)[board[y * 2 + 1][x]];
        ctx.fillRect(from[0] - line_width / 2, from[1], line_width, to[1] - from[1]);
      }
    }
  }

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      ctx.beginPath();
      ctx.arc(...get_pos(x, y), circle_radius, 0, Math.PI * 2);
      ctx.fillStyle = CIRCLE_COLOR;
      ctx.fill();
    }
  }

  window.requestAnimationFrame(draw_game);
}

window.onresize = draw_game;

canvas.onmousemove = function onmousemove(event) {
  let mouse_x = event.clientX - canvas.offsetLeft;
  let mouse_y = event.clientY - canvas.offsetTop;
  mouse_pos = [mouse_x, mouse_y];
}

canvas.onclick = function onclick(event) {
  if (!active || turn !== COLOR) return;
  let mouse_x = event.clientX - canvas.offsetLeft;
  let mouse_y = event.clientY - canvas.offsetTop;
  mouse_pos = [mouse_x, mouse_y];

  function put(x, y) {
    turn = 3 - turn;
    board[y][x] = COLOR;
    socket.send(JSON.stringify({
      kind: "turn",
      pos: [x, y]
    }));
    console.log([x, y]);
  }

  if (turn === COLOR) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (x != BOARD_SIZE - 1) {
          let from = get_pos(x, y);
          let to = get_pos(x + 1, y);
          let mouse_over = mouse_pos[0] >= from[0] && mouse_pos[0] <= to[0]
            && mouse_pos[1] >= from[1] - line_width / 2 && mouse_pos[1] <= from[1] + line_width / 2;
          if (mouse_over && board[y * 2][x] === 0) put(x, y * 2);
        }
        if (y != BOARD_SIZE - 1) {
          let from = get_pos(x, y);
          let to = get_pos(x, y + 1);
          let mouse_over = mouse_pos[1] >= from[1] && mouse_pos[1] <= to[1]
            && mouse_pos[0] >= from[0] - line_width / 2 && mouse_pos[0] <= from[0] + line_width / 2;
          if (mouse_over && board[y * 2 + 1][x] === 0) put(x, y * 2 + 1);
        }
      }
    }
  }
}

function check_win() {
  for (let player = 1; player < 3; player++) {
    for (let direction = 0; direction < 2; direction++) {
      let to_visit = [];
      let visited = [];

      if (direction === 0) {
        to_visit.push([0, 0, []]);
        to_visit.push([0, 1, []]);
      } else {
        to_visit.push([BOARD_SIZE - 2, 0, []]);
        to_visit.push([BOARD_SIZE - 1, 1, []]);
      }

      let current;
      while (current = to_visit.shift()) {
        let [x, y, path] = current;
        if (visited.find(([x2, y2]) => x2 === x && y2 === y)) continue;
        visited.push(current);
        if (board[y][x] === player) {
          if (direction === 0 && y === BOARD_SIZE * 2 - 3 && x === BOARD_SIZE - 1
            || direction === 0 && y === BOARD_SIZE * 2 - 2 && x === BOARD_SIZE - 2
            || direction === 1 && y === BOARD_SIZE * 2 - 3 && x === 0
            || direction === 1 && y === BOARD_SIZE * 2 - 2 && x === 0
          ) return [player, ...path, [x, y]];
          if (y % 2) {
            if (y !== BOARD_SIZE * 2 - 3) to_visit.push([x, y + 2, [...path, [x, y]]]);
            if (y !== 1) to_visit.push([x, y - 2, [...path, [x, y]]]);
            if (x > 0) {
              to_visit.push([x - 1, y + 1, [...path, [x, y]]]);
              to_visit.push([x - 1, y - 1, [...path, [x, y]]]);
            }
            if (x !== BOARD_SIZE - 1) {
              to_visit.push([x, y + 1, [...path, [x, y]]]);
              to_visit.push([x, y - 1, [...path, [x, y]]]);
            }
          } else {
            if (x !== BOARD_SIZE - 2) to_visit.push([x + 1, y, [...path, [x, y]]]);
            if (x > 0) to_visit.push([x - 1, y, [...path, [x, y]]]);
            if (y !== BOARD_SIZE * 2 - 2) {
              to_visit.push([x, y + 1, [...path, [x, y]]]);
              to_visit.push([x + 1, y + 1, [...path, [x, y]]]);
            }
            if (y !== 0) {
              to_visit.push([x, y - 1, [...path, [x, y]]]);
              to_visit.push([x + 1, y - 1, [...path, [x, y]]]);
            }
          }
        }
      }
    }
  }
  return [0];
}

draw_game();

let socket = new WebSocket(WS_URL);
socket.addEventListener("open", (event) => {
  console.log("Socket openned.");
});

socket.addEventListener("message", (event) => {
  let msg;
  try {
    msg = JSON.parse(event.data);
  } catch (e) {
    console.log(event.data);
    console.error(e);
  }
  console.log(msg);
  if (!msg || !msg.kind) return; // ignore
  if (msg.kind === "update") {
    board = msg.board;
    turn = msg.turn;
    active = msg.active;
    let win;
    if ((win = check_win())[0]) {
      let [player, ...path] = win;
      console.log(win);
      for (loc of path) {
        board[loc[1]][loc[0]] = player + 2;
      }
    }
    update_gui();
  }
});

function update_gui() {
  if (!active) {
    if (COLOR) {
      let info = document.getElementById("info");
      if (info.className != "rematch") {
        info.className = "rematch";
        info.innerHTML = `<button onclick="rematch()">Rematch</button>`;
      }
    }
  }
}

function rematch() {
  window.location.href = REMATCH_URL;
}

socket.addEventListener("close", () => console.log("Socket closed."));
