let basePG = "https://api.rawg.io/api/games?key=68a0332c24494c5d9367221d470f397b";
let nextpage;
let isFetching = false;
let seenGameIds = new Set();

const getFilteredUrl = () => {
  let url = basePG;
  const genreValue = document.getElementById("genre")?.value;
  const sortValue = document.getElementById("sort")?.value;
  const searchTerm = document.getElementById("search-bar")?.value;

  if (genreValue && genreValue !== "default") {
    url += `&genres=${genreValue}`;
  }

  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }

  if (sortValue && sortValue !== "default") {
    let order = "";
    if (sortValue === "ascending") order = "name";
    else if (sortValue === "descending") order = "-name";
    else if (sortValue === "highest") order = "-rating";
    else if (sortValue === "lowest") order = "rating";
    else if (sortValue === "newest") order = "-released";
    else if (sortValue === "oldest") order = "released";

    if (order) url += `&ordering=${order}`;
  }
  return url;
};

const fetchGames = async (url, isNewReset = false) => {
  if (!url || (isFetching && !isNewReset)) return;

  isFetching = true;

  if (isNewReset) {
    const gamesGrid = document.getElementById("games-grid");
    if (gamesGrid) gamesGrid.innerHTML = "";
    seenGameIds.clear();
    nextpage = null;
  }

  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "block";

  try {
    const res = await fetch(url);
    const data = await res.json();
    let results = data.results || [];
    nextpage = data.next;

    const gamesgrid = document.getElementById("games-grid");
    if (!gamesgrid) return;

    const gamecard = (x) => `
      <div class="game-card">
        <button class="wishlist-btn">♡</button>
        <img src="${x.background_image || "https://via.placeholder.com/400x225?text=No+Image"}" alt="${x.name}">
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
    if (loading) loading.style.display = "none";
  }
};

const sortElement = document.getElementById("sort");
if (sortElement) {
  sortElement.addEventListener("change", () => {
    fetchGames(getFilteredUrl(), true);
  });
}

const genreElement = document.getElementById("genre");
if (genreElement) {
  genreElement.addEventListener("change", () => {
    fetchGames(getFilteredUrl(), true);
  });
}

const searchBar = document.getElementById("search-bar");
let searchTimeout;
if (searchBar) {
  searchBar.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchGames(getFilteredUrl(), true);
    }, 500);
  });
}

// Initial fetch
fetchGames(getFilteredUrl());

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("wishlist-btn")) {
    e.target.classList.toggle("active");
  }
});

window.addEventListener("scroll", () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomThreshold = document.body.offsetHeight - 800;

  if (scrollPosition >= bottomThreshold && !isFetching && nextpage) {
    fetchGames(nextpage);
  }
});
