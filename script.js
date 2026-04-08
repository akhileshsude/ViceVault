let pg = "https://api.rawg.io/api/games?key=68a0332c24494c5d9367221d470f397b";
let nextpage;

const fetchGames = async (url) => {
  const res = await fetch(url);
  let { results, next } = await res.json();
  nextpage = next;
  if (document.getElementById("sort").value === "default") {
    document.getElementById("games-grid").innerHTML = "";
  } else if (document.getElementById("sort").value === "ascending") {
    document.getElementById("games-grid").innerHTML = "";
    results = results.sort((a, b) => a.name.localeCompare(b.name));
  } else if (document.getElementById("sort").value === "descending") {
    document.getElementById("games-grid").innerHTML = "";
    results = results.sort((a, b) => b.name.localeCompare(a.name));
  } else if (document.getElementById("sort").value === "highest") {
    document.getElementById("games-grid").innerHTML = "";
    results = results.sort((a, b) => b.rating - a.rating);
  } else if (document.getElementById("sort").value === "lowest") {
    document.getElementById("games-grid").innerHTML = "";
    results = results.sort((a, b) => a.rating - b.rating);
  } else if (document.getElementById("sort").value === "newest") {
    document.getElementById("games-grid").innerHTML = "";

    results = results.sort(
      (a, b) => new Date(b.released) - new Date(a.released),
    );
  } else if (document.getElementById("sort").value === "oldest") {
    document.getElementById("games-grid").innerHTML = "";

    results = results.sort(
      (a, b) => new Date(a.released) - new Date(b.released),
    );
  }

  if (document.getElementById("search-bar").value) {
    results = results.filter((game) =>
      game.name
        .toLowerCase()
        .includes(document.getElementById("search-bar").value.toLowerCase()),
    );
  }

  // console.log(results[0]);

  const gamesgrid = document.getElementById("games-grid");

  let gamecard = (x) => {
    return `<div class="game-card">
      <img src="${x.background_image}" alt="${x.name}">
      <h2>${x.name}</h2>
      <p>Rating: ${x.rating}</p>
    </div>
    `;
  };
  results.forEach((game) => {
    gamesgrid.innerHTML += gamecard(game);
  });
};

let sort = document.getElementById("sort");
sort.addEventListener("change", () => {
  // console.log(sort.value);
  fetchGames(pg);
});

let search = document.getElementById("search-bar");
search.addEventListener("input", () => {
  fetchGames(pg);
});

fetchGames(pg);

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    const loading = document.getElementById("loading");
    loading.innerHTML = "<h1>Loading More Games...</h1>";
    setTimeout(() => {
      fetchGames(nextpage);
      loading.innerHTML = "";
    }, 2000);
  }
});
