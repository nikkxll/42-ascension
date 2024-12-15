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
    const response = await fetch(`/api/players/${userId}/matches`, {
      method: "GET",
    });

    if (!response.ok) {
      goToLobby();
      throw new Error("Failed to get user matches");
    }
    const json = await response.json();
    const matches = document.getElementById("person-stats");
    if (json.data.matches?.length == 0) matches.innerText = "No Matches yet";
    else {
      matches.innerHTML = "";
      console.log(json.data.matches);
      json.data.matches?.slice(0, 5).forEach((match) => {
        let content = `
          <div class='profile-games-list'">
            <div class=${
              Number(match.score[0]) > Number(match.score[1])
                ? "winner-name"
                : ""
            }>${match.players[0].username}</div>
            <div>vs</div>
            <div class=${
              Number(match.score[1]) > Number(match.score[0])
                ? "winner-name"
                : ""
            }>${match.players[1].username}</div>
            <div>[${match.score[0]}:${match.score[1]}]</div>
          </div>
          `;
        matches.innerHTML += content;
      });
    }
  } catch (error) {
    console.error(error.message);
  }

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
      json.data.players.forEach((player, index) => {
        let friend_marker = friends.data.friends.find(
          (friend) => friend.id == player.id
        );
        let status = "";

        if (friend_marker) {
          if (friend_marker.complete) status = friend_marker.status;
          else if (friend_marker.forMe)
            status = `
                <button onclick='approveFriendship(${player.id})'>Approve</button>
                <button onclick='denyFriendship(${player.id})'>Deny</button>
              `;
          else if (friend_marker.forOther)
            status = "Waiting on approval of friendship";
        } else {
          status =
            "<button onclick='requestFriendship(" +
            player.id +
            ")'>Request Friendship</button>";
        }

        console.log(player);

        let content = `
          <div class="carousel-item ${index == 0 ? "active" : ""}">
            <img class="friend-avatar" src="${
              player.avatarUrl || "./assets/default_avatar.png"
            }">
            <h1 class="friend-name">${
              player.displayName || player.username
            }</h1>
            <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 0.5vw;">
              ${
                friend_marker && friend_marker.complete
                  ? `<img class="friend-login-status" src="./assets/${
                      friend_marker.status === "Online"
                        ? "online.png"
                        : "offline.png"
                    }">`
                  : ""
              }
              <div class="friend-status">
                ${status}
              </div>
            </div>
          </div>
          `;
        if (player.id != userId) players.innerHTML += content;
      });
    }
  } catch (error) {
    console.error(error.message);
  }
  goToProfile();
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
  alert("Succesful file upload");
  console.log(window.currentUserID);
  await updateToProfile(window.currentUserID);
};
