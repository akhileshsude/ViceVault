let pg="https://api.rawg.io/api/games?key=68a0332c24494c5d9367221d470f397b"
let nextpage

const fetchGames = async (url) => {
  const res = await fetch(url);
  const { results,next } = await res.json();
  nextpage = next;

  console.log(results[0]);
  const gamesgrid = document.getElementById("games-grid");

  let gamecard=(x)=>{
    return `<div class="game-card">
      <img src="${x.background_image}" alt="${x.name}">
      <h2>${x.name}</h2>
      <p>Rating: ${x.rating}</p>
    </div>
    `
  }
  results.forEach((game) => {
    gamesgrid.innerHTML += gamecard(game);
  });
  
};

fetchGames(pg);

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    const loading = document.getElementById("loading");
    loading.innerHTML = "<h1>Loading More Games...</h1>";
    setTimeout(() => {
    fetchGames(nextpage);
    loading.innerHTML = "";

  },2000);}
});
