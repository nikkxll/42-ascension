const renderPlayerGames = async (userId, element) => {
  try {
    const response = await fetch(`/api/players/${userId}/matches?last=5`, {
      method: "GET",
    });

    if (!response.ok) {
      goToLobby();
      throw new Error("Failed to get user matches");
    }
    const json = await response.json();
    const matches = document.getElementById(element);
    console.log(matches);
    if (json.data.matches?.length == 0) matches.innerText = "No Matches yet";
    else {
      matches.innerHTML = "";
      json.data.matches?.forEach((match) => {
        const newDiv = document.createElement("ul");
        newDiv.classList.add("match-results");
        let isWinner1 = undefined;
        if (match.score !== null) {
          isWinner1 = Number(match.score[0]) > Number(match.score[1]);
        }
        const matchScore = match.score
          ? match.score[0] + ":" + match.score[1]
          : "0:0";

        let team1Div = `<div class=${isWinner1 === true ? "winner-name" : ""}>
								${match.players[0]?.displayName ?? match.players[0]?.username}
							</div>`;
        let team2Div = `<div class=${isWinner1 === false ? "winner-name" : ""}>
								${match.players[1]?.displayName ?? match.players[1]?.username}
							</div>`;
        if (match.players.length == 4) {
          team1Div = `<div class=${isWinner1 === true ? "winner-name" : ""}>
								<div class="player-small-text">
								${match.players[0]?.displayName ?? match.players[0]?.username}
								</div>
								<div class="player-small-text">
								${match.players[1]?.displayName ?? match.players[1]?.username}
								</div>
							</div>`;
          team2Div = `<div class=${isWinner1 === false ? "winner-name" : ""}>
								<div class="player-small-text">
								${match.players[2]?.displayName ?? match.players[2]?.username}
								</div>
								<div class="player-small-text">
								${match.players[3]?.displayName ?? match.players[3]?.username}
								</div>
							</div>`;
        }

        const matchScoreDiv = `<div>
						${match.score ? "[" + matchScore + "]" : "[0:0]"}
					</div>`;

        newDiv.innerHTML = `
				<li class="match-result">
				<div class="match-link no-cursor no-hover">
					${team1Div}
					<div class="versus-text">vs</div>
					${team2Div}
					${matchScoreDiv}
					<div>${isoDateToShortDate(match.createdAt)}</div>
				</div>
				</li>`;
        matches.append(newDiv);
      });
    }
  } catch (error) {
    console.error(error.message);
  }
};

const updateToProfile = async (index) => {
  const userId = window.state["loggedInUsers"][index].id;
  window.currentUserID = index;
  try {
    const response = await fetch(`/api/players/${userId}/`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }
    const json = await response.json();
    console.log(json.data.avatarUrl);
    document.getElementById("person-avatar").src =
      json.data.avatarUrl || "./assets/default_avatar.png";
    document.getElementById("person-name").innerText = json.data.displayName;
  } catch (error) {
    console.error(error.message);
  }

  try {
    const response = await fetch(`/api/players/${userId}/stats`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }
    const { data } = await response.json();
    const winsLoses = `
						<div>Wins: </div>
						<div>
						${data.wins || 0}
						</div>
						<div>Loses: </div>
						<div>
						${data.loses || 0}
						</div>
						`;
    const element = document.querySelector(".player-wins-loses");
    element.innerHTML = winsLoses;
  } catch (error) {
    console.error(error.message);
  }

  await renderPlayerGames(userId, "person-stats");

  try {
    const response = await fetch(`/api/players/`, {
      method: "GET",
    });

    if (!response.ok) {
      goToLobby();
      throw new Error("Failed to get potential friends");
    }

    const friendsRequest = await fetch(`/api/players/${userId}/friends/`, {
      method: "GET",
    });

    if (!response.ok) {
      goToLobby();
      throw new Error("Failed to get actual friends");
    }

    const friends = await friendsRequest.json();
    const json = await response.json();
    const players = document.getElementById("friends");

    if (json.data.players.length == 0) matches.innerText = "No one else exists";
    else {
      players.innerHTML = "";

      for (const [index, player] of json.data.players.entries()) {
        if (player.id === userId) continue; // Skip the current user

        let friend_marker = friends.data.friends.find(
          (friend) => friend.id == player.id
        );

        let status = "";
        if (friend_marker) {
          if (friend_marker.complete) {
            status = friend_marker.status;
          } else if (friend_marker.forMe) {
            status = `
				<button onclick='approveFriendship(${player.id})'>Approve</button>
				<button onclick='denyFriendship(${player.id})'>Deny</button>
			  `;
          } else if (friend_marker.forOther) {
            status = "Waiting on approval of friendship";
          }
        } else {
          status = `<button onclick='requestFriendship(${player.id})'>Request Friendship</button>`;
        }

        // Create the friend container first
        const friendContainer = document.createElement("div");
        friendContainer.className = `carousel-item ${
          index == 0 ? "active" : ""
        }`;

        // Create the stats container with a unique ID
        const friendStatsId = `friend-stats-${player.id}`;

        friendContainer.innerHTML = `
			<img class="friend-avatar" src="${
        player.avatarUrl || "./assets/default_avatar.png"
      }">
			<h1 class="friend-name">${player.displayName || player.username}</h1>
			<div class="friend-status-container">
		  	<div class="friend-login-status">
			  ${
          friend_marker && friend_marker.complete
            ? `<img class="friend-login-status-img" src="./assets/${
                friend_marker.status === "Online" ? "online.png" : "offline.png"
              }">`
            : ""
        }
			  <div class="friend-status">
				${status}
			  </div>
			</div>
			  <h1>Recent 5 matches</h1>
			  <div id="${friendStatsId}" class="friend-stats"></div>
			</div>
		  `;

        players.appendChild(friendContainer);

        await renderPlayerGames(player.id, friendStatsId);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
  goToProfile();
  nameUpdate(userId);
};

// Avatar change

document.getElementById("newAvatar").onchange = async (e) => {
  try {
    const response = await fetch(
      `/api/players/${
        window.state["loggedInUsers"][window.currentUserID].id
      }/avatar/`,
      {
        method: "POST",
        body: e.target.files[0],
      }
    );
    if (!response.ok) alert("Failed to upload");
  } catch (error) {
    alert(error);
    return;
  }
  alert("Successful file upload");
  console.log(window.currentUserID);
  await updateToProfile(window.currentUserID);
};

function nameUpdate(userId) {
  const nameElement = document.getElementById("person-name");

  let backupName = nameElement.innerText;
  const buttonElement = document.querySelector(".person-name-edit-button");
  buttonElement.removeEventListener("click", handleClick);
  buttonElement.addEventListener("click", handleClick);

  const inputHandler = () => {
    nameElement.textContent = nameElement.textContent.replace(
      /[^a-zA-Z0-9\s]/g,
      ""
    );
    // Ensure the name element has a text node
    if (!nameElement.childNodes[0]) {
      nameElement.appendChild(document.createTextNode(""));
    }
    // Move the cursor to the end after filtering
    const updatedRange = document.createRange();
    const selection = window.getSelection();

    updatedRange.setStart(
      nameElement.childNodes[0],
      nameElement.textContent.length || 0
    );
    updatedRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(updatedRange);
  };

  const handleEnter = async (event) => {
    if (event.key === "Enter") {
      await saveName();
    }
  };

  const saveName = async () => {
    console.log("saving...", nameElement);
    console.log("saving...", backupName);
	console.log(userId);
    try {
      const response = await fetch(`/api/players/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: nameElement.textContent }),
      });
      if (!response.ok) {
        throw new Error("Failed to update name");
      }
    } catch (error) {
      console.error(error.message);
      nameElement.textContent = backupName;
    } finally {
      nameElement.setAttribute("contenteditable", false);
      backupName = nameElement.innerText;
    }
    try {
      await miniLobbyPlayersRender();
    } catch (error) {
      console.error(error.message);
    }
    nameElement.blur();
    nameElement.setAttribute("contenteditable", false);
  };

  function handleClick() {
    if (!nameElement.childNodes[0]) {
      nameElement.appendChild(document.createTextNode(""));
    }
    const range = document.createRange();
    const selection = window.getSelection();
    // Place the cursor at the end of the content
    range.setStart(
      nameElement.childNodes[0],
      nameElement.textContent.length || 0
    );
    range.collapse(true);

    // Clear any existing selections and set the new range
    selection.removeAllRanges();
    selection.addRange(range);

    nameElement.setAttribute("contenteditable", true);
    nameElement.focus();

    // Remove any existing input listener and re-add it
    nameElement.removeEventListener("input", inputHandler); // Remove previous listener (if exists)
    nameElement.addEventListener("input", inputHandler);

    nameElement.removeEventListener("blur", saveName);
    nameElement.addEventListener("blur", saveName);

    nameElement.removeEventListener("keypress", handleEnter);
    nameElement.addEventListener("keypress", handleEnter);
  }
}
