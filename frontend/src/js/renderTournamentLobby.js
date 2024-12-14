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
          <article class="tournament-game-player-card-inner normal">
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
  window.tournamentState.data = tournament;

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
  const startFirstSemifinalButton = document.getElementById("startFirstSF");
  const startSecondSemifinalButton = document.getElementById("startSecondSF");
  const startFinalButton = document.getElementById("startFinal");
  const tournamentResults = document.getElementById("tournamentResults");
  const finalContent = document.getElementById("finalContent");
  const finalDummy = document.getElementById("final");

  if (!tournament?.matches[0]?.score && !tournament?.matches[1]?.score)
    startFirstSemifinalButton.style.display = "block";
  else if (tournament?.matches[0]?.score && !tournament?.matches[1]?.score)
    startSecondSemifinalButton.style.display = "block";
  else if (
    tournament?.matches[0]?.score &&
    tournament?.matches[1]?.score &&
    !tournament?.winner
  )
  startFinalButton.style.display = "block";

  if (tournament?.winner) {
    tournamentResults.style.display = "block";
  }

  const neededPlayers = getNeededPlayers();
  const tournamentPlayers = getTournamentPlayers();

  ifallLoggedIn(neededPlayers);

  function getNeededPlayers() {
    const players = [];
    
    const semiFinal1 = tournament?.matches?.[0];
    const semiFinal2 = tournament?.matches?.[1];
    const finalWinner = tournament?.winner;
  
    const getWinningPlayerId = (match) => {
      const [score1, score2] = match.score.map((score) => parseInt(score, 10));
      return score1 > score2 ? match.players?.[0]?.id : match.players?.[1]?.id;
    };
  
    if (semiFinal1?.score && semiFinal2?.score && !finalWinner) {
      players.push(getWinningPlayerId(semiFinal1));
      players.push(getWinningPlayerId(semiFinal2));
    }
    else if (semiFinal1?.score && !finalWinner) {
      players.push(
        getWinningPlayerId(semiFinal1),
        ...(semiFinal2?.players?.map((player) => player?.id) || [])
      );
    }
    else if (semiFinal1?.score && semiFinal2?.score && finalWinner) {
      return players;
    }
    else {
      players.push(
        ...(semiFinal1?.players?.map((player) => player?.id) || []),
        ...(semiFinal2?.players?.map((player) => player?.id) || [])
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
    loggedInPlayersIds.push(1);

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
    console.log(arr1, arr2);
    return arr2.every((element) => set1.has(element));
  }

  function generatePlayerCards(tournamentPlayers) {
    tournamentGrid.innerHTML = "";

    const filledPlayers = [...tournamentPlayers];

    filledPlayers.forEach((player, index) => {
      const isWinner = player.id === tournament?.winner?.id;
      const playerCard = document.createElement("div");
      playerCard.className = "game-player-card";

      playerCard.innerHTML = `
        <article class="tournament-game-player-card-inner ${
          isWinner ? "winner" : "normal"
        }">
          <h2 class="game-player-number">${
            isWinner ? "Winner" : `Player ${index + 1}`
          }</h2>
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

  function generateMatchContent(player1, player2, sfCount) {
    const getScore = (matchIndex, scoreIndex) => {
      const match = tournament?.matches?.[matchIndex]?.score;
      return match ? parseInt(match[scoreIndex]) : 0;
    };

    const sfScores = {
      sfOneScoreOne: getScore(0, 0),
      sfOneScoreTwo: getScore(0, 1),
      sfTwoScoreOne: getScore(1, 0),
      sfTwoScoreTwo: getScore(1, 1),
    };

    const leftScore =
      sfCount === 1 ? sfScores.sfOneScoreOne : sfScores.sfTwoScoreOne;
    const rightScore =
      sfCount === 1 ? sfScores.sfOneScoreTwo : sfScores.sfTwoScoreTwo;

    const playerAvatar = (player) =>
      player?.avatar || "./assets/default_avatar.png";
    const playerLabel = (player) => player?.label || "Unknown Player";

    return `
      <div class="tournament-match-players">
        <div class="tournament-match-player-info-left">
          <img loading="lazy" src="${playerAvatar(
            player1
          )}" alt="Player avatar" class="tournament-match-avatar" />
          <h3 class="game-player-name tournament">${playerLabel(player1)}</h3>
        </div>
        <h2 class="tournament-match-left-score ${
          leftScore > rightScore
            ? "match-winner-text"
            : leftScore < rightScore
            ? "match-loser-text"
            : ""
        }">${leftScore}</h2>
        <img class="tournament-match-vs-logo" src="./assets/vs_logo.png" alt="Versus logo" />
        <h2 class="tournament-match-right-score ${
          rightScore > leftScore
            ? "match-winner-text"
            : rightScore < leftScore
            ? "match-loser-text"
            : ""
        }"">${rightScore}</h2>
        <div class="tournament-match-player-info-right">
          <img loading="lazy" src="${playerAvatar(
            player2
          )}" alt="Player avatar" class="tournament-match-avatar" />
          <h3 class="game-player-name tournament">${playerLabel(player2)}</h3>
        </div>
      </div>
    `;
  }

  function generateFinalContent(player1, player2) {
    const leftScore = parseInt(tournament?.matches[2]?.score?.[0] ?? 0);
    const rightScore = parseInt(tournament?.matches[2]?.score?.[1] ?? 0);

    return `
        <div class="tournament-match-players">
          <div class="tournament-match-player-info-left">
            <img loading="lazy" src="${
              player1?.avatar || "./assets/default_avatar.png"
            }" alt="Player avatar" class="tournament-match-avatar" />
            <h3 class="game-player-name tournament">${player1?.label}</h3>
          </div>
          <h2 class="tournament-match-left-score ${
            leftScore > rightScore
              ? "match-winner-text"
              : leftScore < rightScore
              ? "match-loser-text"
              : ""
          }">${leftScore ?? 0}</h2>
          <img class="tournament-match-vs-logo" src="./assets/vs_logo.png" alt="Versus logo" />
          <h2 class="tournament-match-right-score ${
            rightScore > leftScore
              ? "match-winner-text"
              : rightScore < leftScore
              ? "match-loser-text"
              : ""
          }">${rightScore ?? 0}</h2>
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

    const sf1 = tournament?.matches?.[0];
    const sf2 = tournament?.matches?.[1];

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
    ${generateMatchContent(player1, player2, 1)}
    `;

    secondSemifinalContent.innerHTML = `
    <h1 class="tournament-match-title" >Semifinal 2</h1>
    ${generateMatchContent(player3, player4, 2)}
    `;

    if (tournament?.matches[1]?.score) {
      finalContent.style.display = "flex";
      finalDummy.style.display = "none";
      finalContent.innerHTML = `
    <h1 class="tournament-match-title" >Final</h1>
    ${generateFinalContent(
      parseInt(sf1?.score[0]) > parseInt(sf1?.score[1])
        ? sf1.players?.[0]
        : sf1.players?.[1],
      parseInt(sf2?.score[0]) > parseInt(sf2?.score[1])
        ? sf2.players?.[0]
        : sf2.players?.[1]
    )}`;
    }
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
