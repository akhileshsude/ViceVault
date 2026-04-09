let pg = "https://api.rawg.io/api/games?key=68a0332c24494c5d9367221d470f397b";
let nextpage;
let isFetching = false;
let seenGameIds = new Set();
let lastFetchedUrl = "";

const fetchGames = async (url, isNewReset = false) => {
  if (!url || (isFetching && !isNewReset) || (url === lastFetchedUrl && !isNewReset)) return;

  isFetching = true;
  lastFetchedUrl = url;

  if (isNewReset) {
    const gamesGrid = document.getElementById("games-grid");
    if (gamesGrid) gamesGrid.innerHTML = "";
    seenGameIds.clear();
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    let results = data.results || [];
    nextpage = data.next;

    const sortValue = document.getElementById("sort").value;
    if (sortValue === "ascending") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === "descending") {
      results.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortValue === "highest") {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortValue === "lowest") {
      results.sort((a, b) => a.rating - b.rating);
    } else if (sortValue === "newest") {
      results.sort((a, b) => new Date(b.released) - new Date(a.released));
    } else if (sortValue === "oldest") {
      results.sort((a, b) => new Date(a.released) - new Date(b.released));
    }

    const searchTerm = document.getElementById("search-bar").value.toLowerCase();
    if (searchTerm) {
      results = results.filter((game) =>
        game.name.toLowerCase().includes(searchTerm),
      );
    }

    const gamesgrid = document.getElementById("games-grid");
    if (!gamesgrid) return;

    const gamecard = (x) => `
      <div class="game-card">
        <button class="wishlist-btn">♡</button>
        <img src="${x.background_image}" alt="${x.name}">
        <h2>${x.name}</h2>
        <p>Rating: ${x.rating}</p>
      </div>`;

    results.forEach((game) => {
      if (!seenGameIds.has(game.id)) {
        seenGameIds.add(game.id);
        gamesgrid.insertAdjacentHTML("beforeend", gamecard(game));
      }
    });
  } catch (error) {
    console.error("Error fetching games:", error);
  } finally {
    isFetching = false;
    const loading = document.getElementById("loading");
    if (loading) loading.innerHTML = "";
  }
};

const sortSelector = document.getElementById("sort");
if (sortSelector) {
  sortSelector.addEventListener("change", () => {
    fetchGames(pg, true);
  });
}

const searchBar = document.getElementById("search-bar");
let searchTimeout;
if (searchBar) {
  searchBar.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchGames(pg, true);
    }, 300);
  });
}

fetchGames(pg);

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("wishlist-btn")) {
    e.target.classList.toggle("active");
  }
});

window.addEventListener("scroll", () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomThreshold = document.body.offsetHeight - 500;

  if (scrollPosition >= bottomThreshold && !isFetching && nextpage) {
    const loading = document.getElementById("loading");
    if (loading) loading.innerHTML = "<h1>Loading More Games...</h1>";
    fetchGames(nextpage);
  }
});
