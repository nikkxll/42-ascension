function initializeGameSelectorDoubles() {
  const leftGrid2v2 = document.querySelector("#double-game-grid-left");
  const rightGrid2v2 = document.querySelector("#double-game-grid-right");
  const startButton2v2 = document.querySelector("#start2v2");

  let state = {
    playersSelected: 0,
    leftSelectedIndex: null,
    leftPlayersSelected: 0,
    leftSelected: [],
  };

  function updateStartButton2v2() {
    startButton2v2.disabled = state.leftPlayersSelected !== 2;
    startButton2v2.style.opacity =
      state.leftPlayersSelected === 2 ? "1" : "0.5";
    startButton2v2.style.cursor =
      state.leftPlayersSelected === 2 ? "pointer" : "not-allowed";
  }

  function randomizeChoice2v2(leftPlayers, rightPlayers) {
    state = resetGameSelections();

    // Select two random unique players from left side
    const availableIndices = Array.from(
      { length: leftPlayers.length },
      (_, i) => i
    );

    // First random selection
    const firstIndex = Math.floor(Math.random() * availableIndices.length);
    const firstPlayer = availableIndices[firstIndex];
    availableIndices.splice(firstIndex, 1);

    // Second random selection
    const secondIndex = Math.floor(Math.random() * availableIndices.length);
    const secondPlayer = availableIndices[secondIndex];

    // Click the selected players
    if (leftPlayers[firstPlayer]) leftPlayers[firstPlayer].click();
    if (leftPlayers[secondPlayer]) leftPlayers[secondPlayer].click();
  }

  function attachLeftPlayerListeners2v2(leftPlayers, rightPlayers) {
    if (!window.singleGameState) {
      window.singleGameState = {};
    }
    window.singleGameState.userIds = [];

    leftPlayers.forEach((player, index) => {
      player.classList.add("player-selectable");

      player.addEventListener("click", () => {
        // If already selected, do nothing
        if (state.leftSelected.includes(index)) {
          return;
        }

        // Select up to 2 players on left side
        if (state.leftPlayersSelected < 2) {
          state.leftSelected.push(index);
          state.leftPlayersSelected++;
          player.classList.add("player-selected");
          player.classList.remove("player-selectable");
          player.classList.remove("player-disabled");
        }

        // When 2 players are selected, set up the userIds
        if (state.leftPlayersSelected === 2) {
          const allIds = window.state?.loggedInUsers?.map((p) => p.id) || [];
          state.leftSelected.sort();

          // Set the first two players (team 1)
          window.singleGameState.userIds = [
            allIds[state.leftSelected[0]] || -1,
            allIds[state.leftSelected[1]] || -1,
          ];

          // Add remaining players (team 2)
          for (let i = 0; i < 4; i++) {
            if (!state.leftSelected.includes(i)) {
              window.singleGameState.userIds.push(allIds[i] || -1);
            }
          }
        }

        // Update right side display
        rightPlayers.forEach((rightPlayer, rightIndex) => {
          rightPlayer.classList.remove(
            "player-disabled",
            "player-selectable",
            "player-selected"
          );

          if (!state.leftSelected.includes(rightIndex)) {
            rightPlayer.classList.add("player-selectable");
            if (state.leftPlayersSelected === 2) {
                console.log("rightIndex", rightIndex);
              // Disable unselected players on left
              if (leftPlayers[rightIndex]) {
                leftPlayers[rightIndex].classList.add("player-disabled");
              }
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

  const observer2v2 = new MutationObserver(() => {
    const leftPlayers = Array.from(
      leftGrid2v2.querySelectorAll(".game-player-card-inner-single")
    );
    const rightPlayers = Array.from(
      rightGrid2v2.querySelectorAll(".game-player-card-inner-single")
    );

    if (leftPlayers.length > 0 && rightPlayers.length > 0) {
      attachLeftPlayerListeners2v2(leftPlayers, rightPlayers);

      window.doubleGame = {
        reset: () => (state = resetGameSelections()),
        randomize: () => randomizeChoice2v2(leftPlayers, rightPlayers),
      };

      updateStartButton2v2();
    }
  });

  observer2v2.observe(leftGrid2v2, { childList: true, subtree: true });
  observer2v2.observe(rightGrid2v2, { childList: true, subtree: true });

  return { observer2v2 };
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeGameSelectorDoubles);
