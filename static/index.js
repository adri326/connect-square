function create_game() {
  let color = 0;
  if (document.getElementById("blue").checked) color = 1;
  else if (document.getElementById("red").checked) color = 2;
  let ulid = ULID.factory();
  let url = `./${ulid()}?color=${color}`;
  window.location.href = url;
}

function join_game() {
  let url = document.getElementById("game-url").value;
  let id = /[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}(\?color=\d)$/.exec(url);
  if (!id) {
    document.getElementById("game-url").className = "invalid";
    window.setTimeout(() => {
      document.getElementById("game-url").className = "";
    }, 100);
  } else {
    window.location.href = `./${id[0]}`;
  }
}
