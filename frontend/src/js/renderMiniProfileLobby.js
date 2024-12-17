// --- Rendering player mini profile blocks for home page lobby ---

// Function that renders player panels in the lobby depending on the number of logged in users
const handleProfileButton = (index) => {
	const players = document.getElementById("friends");
	players.innerHTML = "";
	const nameElement = document.getElementById("person-name");
	nameElement.innerHTML = "";
	const matches = document.getElementById("person-stats");
	matches.innerHTML = "";
	document.getElementById("person-avatar").src = "";
	goToProfile();
	updateToProfile(index);
	updateHistory('profile');
}

function renderPlayerPanels() {
  const container = document.getElementById("player-panels-container");
  container.innerHTML = "";
  console.log(window.state.loggedInUsers);
  const users = window.state.loggedInUsers.map((user, index) => {
    let panelContent = `
			<div class="player-brief-info-panel">
				<div class="profile-avatar">
				<img
				  loading="lazy"
				  src="${user.avatarUrl || "../assets/default_avatar.png"}"
				  alt="User profile avatar"
				/>
				</div>
				<h2 class="username">${user.displayName || user.username}</h2>
				<button class="profile-button" tabindex="0" onclick="handleProfileButton(${index})">Profile</button>
				<button class="logout-button" tabindex="0" onclick="logoutPlayer(${index})">Log out</button>
			</div>
		`;
    container.innerHTML += panelContent;
  });

  for (let i = users.length; i < 4; i++) {
    const addPlayerPanel = `
		<div class="player-brief-info-panel">
			<h1 class="auth-title">Add player</h1>
			<button onclick="goToSignup(); updateHistory('signup')" class="auth-button" type="button">
				Sign up
			</button>
			<button onclick="goToSignin(); updateHistory('signin')" class="auth-button" type="button">
				Sign in
			</button>
		</div>
	`;
    container.innerHTML += addPlayerPanel;
  }
}
