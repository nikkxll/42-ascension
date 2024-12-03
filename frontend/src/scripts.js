window["loggedinUsers"] = {};
window["loggedinUsersIds"] = [];

const requestSignUp = async () => {
  const username = document.getElementById("signUpUsername").value;
  const password = document.getElementById("signUpPassword").value;
  try {
    const response = await fetch("/api/players/", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        displayName: document.getElementById("displayName").value,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to sign up");
    }
    const json = await response.json().then(requestLogin(username, password));
  } catch (error) {
    console.error(error.message);
  }
};

const updateLoggedinUsers = () => {
  console.log(window["loggedinUsers"][window["loggedinUsersIds"][0]]);
};

const requestLoginButton = async () => {
  await requestLogin(
    document.getElementById("signInUsername").value,
    document.getElementById("signInPassword").value
  );
};

const clearAuthInputs = () => {
  document.getElementById('signInUsername').value = '';
  document.getElementById('signInPassword').value = '';
  document.getElementById('displayName').value = '';
  document.getElementById('signUpUsername').value = '';
  document.getElementById('signUpPassword').value = '';
};

const requestLogin = async (_username, _password) => {
  try {
    const response = await fetch("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        username: _username,
        password: _password,
      }),
    });
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to sign in");
    }

    const json = await response.json();
    window["loggedinUsers"][json.data.id] = json.data;
    window["loggedinUsersIds"].push(json.data.id);
    clearAuthInputs();
    updateLoggedinUsers();
    goToLobby();
    renderPlayerPanels();
  } catch (error) {
    console.error(error.message);
    clearAuthInputs();
  }
};

const logoutPlayer = async (index) => {
  const userId = window["loggedinUsersIds"][index];
  try {
    const response = await fetch(`/api/auth/logout/${userId}/`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to log out");
    }

    window["loggedinUsersIds"].splice(index, 1);
    renderPlayerPanels();
  } catch (error) {
    console.error(error.message);
  }
};

function renderPlayerPanels() {
  const users = window["loggedinUsersIds"].map(
    (id) => window["loggedinUsers"][id]
  );

  const container = document.getElementById("player-panels-container");
  container.innerHTML = "";

  users.forEach((user, index) => {
    let panelContent;
    panelContent = `
          <div class="player-brief-info-panel">
              <img
                loading="lazy"
                src="${user.avatar || "./assets/default_avatar.png"}"
                class="profile-avatar"
                alt="User profile avatar"
              />
              <h2 class="username">${user.username || `User${index + 1}`}</h2>
              <button class="profile-button" tabindex="0">Profile</button>
              <button class="logout-button" tabindex="0" onclick="logoutPlayer(${index})">Log out</button>
          </div>
      `;
    container.innerHTML += panelContent;
  });

  for (let i = users.length; i < 4; i++) {
    const addPlayerPanel = `
      <div class="player-brief-info-panel">
          <h1 class="auth-title">Add player</h1>
          <button onclick="goToSignup()" class="auth-button" type="button">
              Sign up
          </button>
          <button onclick="goToSignin()" class="auth-button" type="button">
              Sign in
          </button>
      </div>
  `;
    container.innerHTML += addPlayerPanel;
  }
}

function renderGameStart() {
  const players = window["loggedinUsersIds"].map(
    (id) => window["loggedinUsers"][id]
  );

  if (players.length < 1) {
    console.error(
      "Error: At least one user must be logged in to start the game."
    );
    alert("At least one user must be logged in to start the game.");
    goToLobby();
    return;
  }

  if (players.length < 4) {
    players.push({
      username: "AI",
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
                        src="${player.avatar || "./assets/default_avatar.png"}"
                        alt="Player avatar"
                        class="game-player-avatar"
                    />
                    <h3 class="game-player-name">${player.username}</h3>
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

  players.forEach((player, index) => {
    const cardHTML = createPlayerCard(player, index);
    // if (index % 2 === 0) {
      leftGrid.innerHTML += cardHTML;
    // } else {
      rightGrid.innerHTML += cardHTML;
    // }
  });

  gameStartSection.style.display = "block";
}

renderPlayerPanels();