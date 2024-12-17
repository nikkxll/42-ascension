// --- Rendering single game lobby ---

// Function that renders the game lobby section with player cards
function renderGameStart() {
  const players = window.state.loggedInUsers;

  const filledPlayers = [...players];

  if (filledPlayers.length < 1) {
    console.error(
      "Error: At least one user must be logged in to start the game."
    );
    alert("At least one user must be logged in to start the game.");
    goToLobby();
    return;
  }

  if (filledPlayers.length < 4) {
    filledPlayers.push({
      username: "AI",
      displayName: "AI Player",
      avatar: "./assets/ai_profile.png",
      gamesPlayed: 999,
      winRate: 75,
    });
  }

  const gameStartSection = document.getElementById("gameStart");
  const leftGrid = gameStartSection.querySelector(".single-game-grid-left");
  const rightGrid = gameStartSection.querySelector(".single-game-grid-right");

  leftGrid.innerHTML = "";
  rightGrid.innerHTML = "";

  function createPlayerCard(player, playerIndex) {
    return `
              <div class="game-player-card">
                  <article class="game-player-card-inner-single">
                      <h2 class="game-player-number">Player ${
                        playerIndex + 1
                      }</h2>
                      <img
                          loading="lazy"
                          src="${
                            player.avatar || "./assets/default_avatar.png"
                          }"
                          alt="Player avatar"
                          class="game-player-avatar"
                      />
                      <h3 class="game-player-name">${player.displayName}</h3>
                      <div class="game-player-stats-container">
                          <p class="game-player-statistics-param">Games played</p>
                          <p class="game-player-statistics-param-number">${
                            player.gamesPlayed ?? 0
                          }</p>
                      </div>
                      <div class="game-player-win-rate-container">
                          <p class="game-player-statistics-param">Win rate</p>
                          <p class="game-player-statistics-param-number last">${
                            player.winRate ?? 0
                          }%</p>
                      </div>
                  </article>
              </div>
          `;
  }

  filledPlayers.forEach((player, index) => {
    const cardHTML = createPlayerCard(player, index);
    leftGrid.innerHTML += cardHTML;
    rightGrid.innerHTML += cardHTML;
  });

  gameStartSection.style.display = "block";
}
