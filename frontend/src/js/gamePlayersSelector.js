/* Single and 2v2 game players pick */

document.addEventListener("DOMContentLoaded", function () {
  const leftGrid = document.querySelector(".single-game-grid-left");
  const rightGrid = document.querySelector(".single-game-grid-right");
  const leftGrid2v2 = document.querySelector("#double-game-grid-left");
  const rightGrid2v2 = document.querySelector("#double-game-grid-right");
  const startButton = document.querySelector(".single-game-buttons.start");
  const startButton2v2 = document.querySelector("#start2v2");
  let leftSelectedIndex = null;
  let leftSelected = [];
  let leftPlayersSelected = 0;
  let playersSelected = 0;

  function updateStartButton() {
    startButton.disabled = playersSelected !== 2;
    startButton.style.opacity = playersSelected === 2 ? "1" : "0.5";
    startButton.style.cursor =
      playersSelected === 2 ? "pointer" : "not-allowed";
  }

  // Reset all selections
  function resetAll(leftPlayers, rightPlayers, mode) {
    playersSelected = 0;
    leftSelectedIndex = null;
    leftPlayersSelected = 0;
    leftSelected = [];
    leftPlayers.forEach((p) => {
      p.classList.remove("player-disabled", "player-selected");
      p.classList.add("player-selectable");
    });
    rightPlayers.forEach((p) => {
      p.classList.remove(
        "player-disabled",
        "player-selected",
        "player-selectable"
      );
    });
    if (mode === "2v2") {
      updateStartButton2v2();
      return;
    }
    updateStartButton();
  }

  function randomizeChoice(leftPlayers, rightPlayers) {
    resetAll(leftPlayers, rightPlayers, "1v1");

    // Randomly select a left player
    const randomLeftIndex = Math.floor(Math.random() * leftPlayers.length);
    leftPlayers[randomLeftIndex].click();

    // Randomly select an available right player
    const availableRightPlayers = rightPlayers.filter((p) =>
      p.classList.contains("player-selectable")
    );
    if (availableRightPlayers.length > 0) {
      const randomRightIndex = Math.floor(
        Math.random() * availableRightPlayers.length
      );
      availableRightPlayers[randomRightIndex].click();
    }
  }

  // Add event listeners for left players
  function attachLeftPlayerListeners(leftPlayers, rightPlayers) {
    leftPlayers.forEach((player, index) => {
      player.classList.add("player-selectable");

      player.addEventListener("click", () => {
        if (playersSelected >= 2) return;

        // Disable all left players initially
        leftPlayers.forEach((p) => {
          p.classList.add("player-disabled");
          p.classList.remove("player-selected");
        });

        // Select the clicked player
        player.classList.remove("player-disabled");
        player.classList.add("player-selected");
        leftSelectedIndex = index;
        if (playersSelected === 0) playersSelected++;

        // Enable or disable right players based on selection
        rightPlayers.forEach((rightPlayer, rightIndex) => {
          rightPlayer.classList.remove(
            "player-disabled",
            "player-selectable",
            "player-selected"
          );

          // Enable only appropriate right players
          if (rightIndex !== index) {
            rightPlayer.classList.add("player-selectable");
          } else {
            rightPlayer.classList.add("player-disabled");
          }

          window.singleGameState["userIds"] = [];

        });
        if (window.singleGameState.userIds) {
          if (index > window.state["loggedInUsers"].length - 1)
            window.singleGameState["userIds"][0] = 1;
          else
            window.singleGameState["userIds"][0] =
              window.state["loggedInUsers"][index].id;
        } else {
          if (index > window.state["loggedInUsers"].length - 1)
            window.singleGameState["userIds"] = [1, -1];
          else
            window.singleGameState["userIds"] = [
              window.state["loggedInUsers"][index].id,
              -1,
            ];
        }

        updateStartButton();
      });
    });
  }

  // Add event listeners for right players
  function attachRightPlayerListeners(rightPlayers) {
    rightPlayers.forEach((player, index) => {
      player.addEventListener("click", () => {
        if (
          leftSelectedIndex !== null &&
          player.classList.contains("player-selectable") &&
          playersSelected < 2
        ) {
          playersSelected++;
          rightPlayers.forEach((p) => {
            p.classList.remove("player-selectable");
            p.classList.add("player-disabled");
          });

          player.classList.remove("player-disabled");
          player.classList.add("player-selected");

          if (window.singleGameState.userIds) {
            if (index > window.state["loggedInUsers"].length - 1)
              window.singleGameState["userIds"][1] = 1;
            else
              window.singleGameState["userIds"][1] =
                window.state["loggedInUsers"][index].id;
          } else {
            if (index > window.state["loggedInUsers"].length - 1)
              window.singleGameState["userIds"] = [-1, 1];
            else
              window.singleGameState["userIds"] = [
                -1,
                window.state["loggedInUsers"][index].id,
              ];
          }

          updateStartButton();
        }
      });
    });
  }

  // Observe for changes in player cards dynamically
  const observer = new MutationObserver(() => {
    const leftPlayers = Array.from(
      leftGrid.querySelectorAll(".game-player-card-inner-single")
    );
    const rightPlayers = Array.from(
      rightGrid.querySelectorAll(".game-player-card-inner-single")
    );

    if (leftPlayers.length > 0 && rightPlayers.length > 0) {
      // observer.disconnect();
      attachLeftPlayerListeners(leftPlayers, rightPlayers);
      attachRightPlayerListeners(rightPlayers);

      // Allow external reset/randomization to function
      window.resetAll = () => resetAll(leftPlayers, rightPlayers, "1v1");
      window.randomizeChoice = () => randomizeChoice(leftPlayers, rightPlayers);

      // Initialize the start button state
      updateStartButton();
    }
  });

  function randomizeChoice2v2(leftPlayers, rightPlayers) {
    resetAll(leftPlayers, rightPlayers, "2v2");

    // Randomly select a left player
    const randomLeftIndex = Math.floor(Math.random() * leftPlayers.length);
    leftPlayers[randomLeftIndex].click();

    const randomLeftOtherIndex = Math.floor(
      (randomLeftIndex + Math.random() * (leftPlayers.length - 1) + 1) %
        leftPlayers.length
    );
    leftPlayers[randomLeftOtherIndex].click();
  }

  function attachLeftPlayerListeners2v2(leftPlayers, rightPlayers) {
    window.singleGameState["userIds"] = [];
    
    leftPlayers.forEach((player, index) => {
      player.classList.add("player-selectable");

      player.addEventListener("click", () => {
        if (leftSelected.includes(index)) {
        } else if (leftPlayersSelected < 2) {
          leftSelected.push(index);
          leftPlayersSelected++;
          player.classList.add("player-selected");
          player.classList.remove("player-selectable");
        }
        if (leftPlayersSelected == 2) {
          const allIds = window.state.loggedInUsers.map((p) => p.id);
          leftSelected.sort();
          window.singleGameState["userIds"] = [
            allIds[leftSelected[0]],
            allIds[leftSelected[1]],
          ];
          for (let i = 0; i < 4; i++) {
            if (!leftSelected.includes(i))
              window.singleGameState["userIds"].push(allIds[i]);
          }
        }

        // Enable or disable right players based on selection
        rightPlayers.forEach((rightPlayer, rightIndex) => {
          rightPlayer.classList.remove(
            "player-disabled",
            "player-selectable",
            "player-selected"
          );

          // Enable only appropriate right players
          if (!leftSelected.includes(rightIndex)) {
            rightPlayer.classList.add("player-selectable");
            if (leftPlayersSelected === 2) {
              leftPlayers[rightIndex].classList.add("player-disabled");
              rightPlayer.classList.add("player-selected");
            }
          } else {
            rightPlayer.classList.add("player-disabled");
          }
        });
        updateStartButton2v2();
      });
    });
  }

  function updateStartButton2v2() {
    startButton2v2.disabled = leftPlayersSelected !== 2;
    startButton2v2.style.opacity = leftPlayersSelected === 2 ? "1" : "0.5";
    startButton2v2.style.cursor =
      leftPlayersSelected === 2 ? "pointer" : "not-allowed";
  }
  // Observe for changes in player cards dynamically
  const observer2v2 = new MutationObserver(() => {
    const leftPlayers = Array.from(
      leftGrid2v2.querySelectorAll(".game-player-card-inner-single")
    );
    const rightPlayers = Array.from(
      rightGrid2v2.querySelectorAll(".game-player-card-inner-single")
    );

    if (leftPlayers.length > 0 && rightPlayers.length > 0) {
      // observer.disconnect();
      attachLeftPlayerListeners2v2(leftPlayers, rightPlayers);

      // Allow external reset/randomization to function
      window.resetAll = () => resetAll(leftPlayers, rightPlayers, "2v2");
      window.randomizeChoice2v2 = () =>
        randomizeChoice2v2(leftPlayers, rightPlayers);

      // Initialize the start button state
      updateStartButton2v2();
    }
  });

  // Start observing the grids for changes
  observer.observe(leftGrid, { childList: true, subtree: true });
  observer.observe(rightGrid, { childList: true, subtree: true });
  observer2v2.observe(leftGrid2v2, { childList: true, subtree: true });
  observer2v2.observe(rightGrid2v2, { childList: true, subtree: true });
});
