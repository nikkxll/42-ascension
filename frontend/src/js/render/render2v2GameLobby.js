async function render2v2GameStart() {
  const players = window.state.loggedInUsers;

  const filledPlayers = [...players];

  if (filledPlayers.length < 4) {
    console.error("Error: 4 people needed for this mode");
    alert("Error: 4 people needed for this mode");
    goToLobby();
    updateHistory('lobby');
    return;
  }

  const gameStartSection = document.getElementById("gameStart2v2");
  const leftGrid = gameStartSection.querySelector("#double-game-grid-left");
  const rightGrid = gameStartSection.querySelector("#double-game-grid-right");

  leftGrid.innerHTML = "";
  rightGrid.innerHTML = "";

  function createPlayerCard(player, playerIndex, gamesPlayed, winRate) {
    return `
      <div class="game-player-card">
          <article class="game-player-card-inner-single">
              <h2 class="game-player-number">Player ${
                playerIndex + 1
              }</h2>
              <img
                  loading="lazy"
                  src="${
                    player.avatarUrl
                  }"
                  alt="Player avatar"
                  class="common-lobby-avatar"
              />
              <h3 class="game-player-name">${player.displayName || player.username}</h3>
              <div class="game-player-stats-container">
                  <p class="game-player-statistics-param">Games played</p>
                  <p class="game-player-statistics-param-number">${
                    gamesPlayed ?? 0
                  }</p>
              </div>
              <div class="game-player-win-rate-container">
                  <p class="game-player-statistics-param">Win rate</p>
                  <p class="game-player-statistics-param-number last">${
                    winRate ?? 0
                  }%</p>
              </div>
          </article>
      </div>
  `;
  }

  const playerCards = await Promise.all(
    filledPlayers.map(async (player, index) => {
      const playerStats =
        player.username === "AI"
          ? { gamesPlayed: player.gamesPlayed, winRate: player.winRate }
          : await getPlayersStatsGame(player.id);

      const { gamesPlayed, winRate } = playerStats;

      return createPlayerCard(player, index, gamesPlayed, winRate);
    })
  );

  playerCards.forEach((cardHTML) => {
    leftGrid.innerHTML += cardHTML;
    rightGrid.innerHTML += cardHTML;
  });

  gameStartSection.style.display = "block";
  updateHistory('gamestart2v2');
}