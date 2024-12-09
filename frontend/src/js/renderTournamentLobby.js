// --- Creating tournament lobby ---

// Function that renders the tournament lobby section with player cards
function createTournament() {
  const tournamentGrid = document.querySelector(".tournament-grid");
  const firstSemifinalContent = document.getElementById(
    "firstSemifinalContent"
  );
  const secondSemifinalContent = document.getElementById(
    "secondSemifinalContent"
  );
  const tournamentTitle = document.getElementById("tournamentTitle");

  function getPlayers() {
    const players = window.state.loggedInUsers;
    if (players.length < 3) {
      console.error(
        "Error: At least three users must be logged in to start the tournament."
      );
      alert(
        "Error: At least three users must be logged in to start the tournament."
      );
      goToLobby();
      return [];
    }
    return players;
  }

  function getTournamentName() {
    const tournamentNameInput = document.getElementById("tournamentName");
    return tournamentNameInput.value.trim();
  }

  function generatePlayerCards(players) {
    tournamentGrid.innerHTML = "";

    const filledPlayers = [...players];
    if (filledPlayers.length < 4) {
      filledPlayers.push({
        id: 1,
        username: `AI`,
        winRate: "75%",
        avatar: "./assets/ai_profile.png",
      });
    }

    filledPlayers.forEach((player, index) => {
      const playerCard = document.createElement("div");
      playerCard.className = "game-player-card";
      playerCard.innerHTML = `
          <article class="tournament-game-player-card-inner">
            <h2 class="game-player-number">Player ${index + 1}</h2>
            <img
              loading="lazy"
              src="${player.avatar || "./assets/default_avatar.png"}"
              alt="Player avatar"
              class="game-player-avatar"
            />
            <h3 class="game-player-name">${player.username}</h3>
            <div class="game-player-win-rate-container">
              <p class="game-player-statistics-param">Win rate</p>
              <p class="game-player-statistics-param-number last">${
                player.winRate ?? 0
              }</p>
            </div>
          </article>
        `;
      tournamentGrid.appendChild(playerCard);
    });
    return filledPlayers;
  }

  function addLabelsToPlayers(players) {
    players.forEach((player, index) => {
      player.label = `Player ${index + 1}`;
    });
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
  }

  function generateMatchContent(player1, player2) {
    return `
        <div class="tournament-match-players">
          <div class="tournament-match-player-info-left">
            <img loading="lazy" src="${
              player1.avatar || "./assets/default_avatar.png"
            }" alt="Player avatar" class="tournament-match-avatar" />
            <h3 class="game-player-name tournament">${player1.label}</h3>
          </div>
          <h2 class="tournament-match-left-score">-</h2>
          <img class="tournament-match-vs-logo" src="./assets/vs_logo.png" alt="Versus logo" />
          <h2 class="tournament-match-right-score">-</h2>
          <div class="tournament-match-player-info-right">
            <img loading="lazy" src="${
              player2.avatar || "./assets/default_avatar.png"
            }" alt="Player avatar" class="tournament-match-avatar" />
            <h3 class="game-player-name tournament">${player2.label}</h3>
          </div>
        </div>
      `;
  }

  function generateTitle(title) {
    return `<h1 class="tournament-name-text">${title}</h1>`;
  }

  function generateSemifinals(filledPlayers) {
    shuffle(filledPlayers);
    const [player1, player2, player3, player4] = filledPlayers;

    window.tournamentState.userIds = [];
    window.tournamentState.userIds.push(
      player1.id,
      player2.id,
      player3.id,
      player4.id
    );

    firstSemifinalContent.innerHTML = "";
    secondSemifinalContent.innerHTML = "";

    firstSemifinalContent.innerHTML = `
    <h1 class="tournament-match-title">Semifinal 1</h1>
    ${generateMatchContent(player1, player2)}
    `;

    secondSemifinalContent.innerHTML = `
    <h1 class="tournament-match-title" >Semifinal 2</h1>
    ${generateMatchContent(player3, player4)}
    `;
  }

  const players = getPlayers();

  if (players.length > 0) {
    const filledPlayers = generatePlayerCards(players);
    addLabelsToPlayers(filledPlayers);

    const tournamentName = getTournamentName();

    window.tournamentState.name = tournamentName;
    tournamentTitle.innerHTML = generateTitle(window.tournamentState.name);

    generateSemifinals(filledPlayers);
  }

  // Reset tournament state on "Back to menu"
  function resetTournament() {
    window.tournamentState.name = "";

    firstSemifinalContent.innerHTML =
      '<h2 class="tournament-round h2" id="firstSemifinal">Semifinal 1</h2>';
    secondSemifinalContent.innerHTML =
      '<h2 class="tournament-round h2" id="secondSemifinal">Semifinal 2</h2>';
  }

  const backToMenuButton = document.getElementById("backToMenu");
  backToMenuButton.addEventListener("click", function () {
    resetTournament();
    goToLobby();
  });
}

function loadTournament(tournamentId) {
  const tournaments = window.state.tournaments.tournaments;
  const tournament = tournaments.find((t) => t.id === tournamentId);

  console.log('Tournament IDs:', tournaments.map(t => t.id));
  console.log('Tournament ID to find:', tournamentId);
  console.log(tournaments);
  console.log(tournament);

  const tournamentGrid = document.querySelector(".tournament-grid");
  const firstSemifinalContent = document.getElementById(
    "firstSemifinalContent"
  );
  const secondSemifinalContent = document.getElementById(
    "secondSemifinalContent"
  );
  const tournamentTitle = document.getElementById("tournamentTitle");

  const neededPlayers = getNeededPlayers();
  const tournamentPlayers = getTournamentPlayers();

  ifallLoggedIn(neededPlayers);

  function getNeededPlayers() {
    const players = [];

    const sf1 = tournament?.matches?.[0];
    const sf2 = tournament?.matches?.[1];
    const f = tournament?.winner;

    if (sf1?.score && sf2?.score && !f) {
      players.push(sf1.players?.[0]?.id, sf2.players?.[1]?.id);
    } else if (sf1?.score && !f) {
      players.push(
        sf1.score[0] > sf1.score[1]
          ? sf1.players?.[0]?.id
          : sf1.players?.[1]?.id,
        ...(sf2?.players?.map((player) => player?.id) || [])
      );
    } else {
      players.push(
        ...(sf1?.players?.map((player) => player?.id) || []),
        ...(sf2?.players?.map((player) => player?.id) || [])
      );
    }
    return players;
  }

  function getTournamentPlayers() {
    const players = [];

    const sf1 = tournament?.matches?.[0];
    const sf2 = tournament?.matches?.[1];
    players.push(...(sf1?.players || []), ...(sf2?.players || []));

    return players;
  }

  function ifallLoggedIn(neededPlayers) {
    const loggedInPlayers = window.state.loggedInUsers;
    const loggedInPlayersIds = loggedInPlayers.map((player) => player.id);

    if (!arraysChecker(loggedInPlayersIds, neededPlayers)) {
      console.error(
        "Error: Not enough players are logged in to finish the tournament"
      );
      alert("Error: Not enough players are logged in to finish the tournament");
      goToLobby();
    }
  }

  function arraysChecker(arr1, arr2) {
    const set1 = new Set(arr1);
    return arr2.every((element) => set1.has(element));
  }

  function generatePlayerCards(tournamentPlayers) {
    tournamentGrid.innerHTML = "";

    const filledPlayers = [...tournamentPlayers];

    filledPlayers.forEach((player, index) => {
      const playerCard = document.createElement("div");
      playerCard.className = "game-player-card";
      playerCard.innerHTML = `
          <article class="tournament-game-player-card-inner">
            <h2 class="game-player-number">Player ${index + 1}</h2>
            <img
              loading="lazy"
              src="${player.avatar || "./assets/default_avatar.png"}"
              alt="Player avatar"
              class="game-player-avatar"
            />
            <h3 class="game-player-name">${player.username}</h3>
            <div class="game-player-win-rate-container">
              <p class="game-player-statistics-param">Win rate</p>
              <p class="game-player-statistics-param-number last">${
                player.winRate ?? 0
              }</p>
            </div>
          </article>
        `;
      tournamentGrid.appendChild(playerCard);
    });
    return filledPlayers;
  }

  function addLabelsToPlayers(players) {
    players.forEach((player, index) => {
      player.label = `Player ${index + 1}`;
    });
  }

  function generateMatchContent(player1, player2) {
    return `
        <div class="tournament-match-players">
          <div class="tournament-match-player-info-left">
            <img loading="lazy" src="${
              player1?.avatar || "./assets/default_avatar.png"
            }" alt="Player avatar" class="tournament-match-avatar" />
            <h3 class="game-player-name tournament">${player1?.label}</h3>
          </div>
          <h2 class="tournament-match-left-score">-</h2>
          <img class="tournament-match-vs-logo" src="./assets/vs_logo.png" alt="Versus logo" />
          <h2 class="tournament-match-right-score">-</h2>
          <div class="tournament-match-player-info-right">
            <img loading="lazy" src="${
              player2?.avatar || "./assets/default_avatar.png"
            }" alt="Player avatar" class="tournament-match-avatar" />
            <h3 class="game-player-name tournament">${player2?.label}</h3>
          </div>
        </div>
      `;
  }

  function generateTitle(title) {
    return `<h1 class="tournament-name-text">${title}</h1>`;
  }

  function generateSemifinals(filledPlayers) {
    const [player1, player2, player3, player4] = filledPlayers;

    window.tournamentState.userIds = [];
    window.tournamentState.userIds.push(
      player1?.id,
      player2?.id,
      player3?.id,
      player4?.id
    );

    firstSemifinalContent.innerHTML = "";
    secondSemifinalContent.innerHTML = "";

    firstSemifinalContent.innerHTML = `
    <h1 class="tournament-match-title">Semifinal 1</h1>
    ${generateMatchContent(player1, player2)}
    `;

    secondSemifinalContent.innerHTML = `
    <h1 class="tournament-match-title" >Semifinal 2</h1>
    ${generateMatchContent(player3, player4)}
    `;
  }

  const filledPlayers = generatePlayerCards(tournamentPlayers);
  addLabelsToPlayers(filledPlayers);
  tournamentTitle.innerHTML = generateTitle(tournament?.name);

  generateSemifinals(filledPlayers);

  function resetTournament() {
    window.tournamentState.name = "";

    firstSemifinalContent.innerHTML =
      '<h2 class="tournament-round h2" id="firstSemifinal">Semifinal 1</h2>';
    secondSemifinalContent.innerHTML =
      '<h2 class="tournament-round h2" id="secondSemifinal">Semifinal 2</h2>';
  }

  const backToMenuButton = document.getElementById("backToMenu");
  backToMenuButton.addEventListener("click", function () {
    resetTournament();
    goToLobby();
  });
}
