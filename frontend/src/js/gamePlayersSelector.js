/* Single and 2v2 game players pick */

window.singleGame = {
  reset: () => {},
  randomize: () => {}
};

window.doubleGame = {
  reset: () => {},
  randomize: () => {}
};

function resetGameSelections(mode = "1v1") {
  const leftGrid = document.querySelector(".single-game-grid-left");
  const rightGrid = document.querySelector(".single-game-grid-right");
  const leftGrid2v2 = document.querySelector("#double-game-grid-left");
  const rightGrid2v2 = document.querySelector("#double-game-grid-right");
  const startButton = document.querySelector(".single-game-buttons.start");
  const startButton2v2 = document.querySelector("#start2v2");

  const state = {
    playersSelected: 0,
    leftSelectedIndex: null,
    leftPlayersSelected: 0,
    leftSelected: []
  };

  if (mode === "2v2") {
    const currentLeftPlayers = Array.from(
      leftGrid2v2.querySelectorAll(".game-player-card-inner-single")
    );
    const currentRightPlayers = Array.from(
      rightGrid2v2.querySelectorAll(".game-player-card-inner-single")
    );

    currentLeftPlayers.forEach((p) => {
      p.classList.remove("player-disabled", "player-selected");
      p.classList.add("player-selectable");
    });
    
    currentRightPlayers.forEach((p) => {
      p.classList.remove(
        "player-disabled",
        "player-selected",
        "player-selectable"
      );
    });

    startButton2v2.disabled = true;
    startButton2v2.style.opacity = "0.5";
    startButton2v2.style.cursor = "not-allowed";
  } else {
    const currentLeftPlayers = Array.from(
      leftGrid.querySelectorAll(".game-player-card-inner-single")
    );
    const currentRightPlayers = Array.from(
      rightGrid.querySelectorAll(".game-player-card-inner-single")
    );

    currentLeftPlayers.forEach((p) => {
      p.classList.remove("player-disabled", "player-selected");
      p.classList.add("player-selectable");
    });
    
    currentRightPlayers.forEach((p) => {
      p.classList.remove(
        "player-disabled",
        "player-selected",
        "player-selectable"
      );
    });

    startButton.disabled = true;
    startButton.style.opacity = "0.5";
    startButton.style.cursor = "not-allowed";
  }

  window.singleGameState["userIds"] = [];

  return state;
}

function initializeGameSelector() {
  const leftGrid = document.querySelector(".single-game-grid-left");
  const rightGrid = document.querySelector(".single-game-grid-right");
  const leftGrid2v2 = document.querySelector("#double-game-grid-left");
  const rightGrid2v2 = document.querySelector("#double-game-grid-right");
  const startButton = document.querySelector(".single-game-buttons.start");
  const startButton2v2 = document.querySelector("#start2v2");

  let state = {
    playersSelected: 0,
    leftSelectedIndex: null,
    leftPlayersSelected: 0,
    leftSelected: []
  };

  function updateStartButton() {
    startButton.disabled = state.playersSelected !== 2;
    startButton.style.opacity = state.playersSelected === 2 ? "1" : "0.5";
    startButton.style.cursor =
      state.playersSelected === 2 ? "pointer" : "not-allowed";
  }

  function randomizeChoice(leftPlayers, rightPlayers) {
    state = resetGameSelections("1v1");

    const randomLeftIndex = Math.floor(Math.random() * leftPlayers.length);
    leftPlayers[randomLeftIndex].click();

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

  function attachLeftPlayerListeners(leftPlayers, rightPlayers) {
    leftPlayers.forEach((player, index) => {
      player.classList.add("player-selectable");

      player.addEventListener("click", () => {
        if (state.playersSelected >= 2) return;

        leftPlayers.forEach((p) => {
          p.classList.add("player-disabled");
          p.classList.remove("player-selected");
        });

        player.classList.remove("player-disabled");
        player.classList.add("player-selected");
        state.leftSelectedIndex = index;
        if (state.playersSelected === 0) state.playersSelected++;

        rightPlayers.forEach((rightPlayer, rightIndex) => {
          rightPlayer.classList.remove(
            "player-disabled",
            "player-selectable",
            "player-selected"
          );

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

  function attachRightPlayerListeners(rightPlayers) {
    rightPlayers.forEach((player, index) => {
      player.addEventListener("click", () => {
        if (
          state.leftSelectedIndex !== null &&
          player.classList.contains("player-selectable") &&
          state.playersSelected < 2
        ) {
          state.playersSelected++;
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

  function randomizeChoice2v2(leftPlayers, rightPlayers) {
    state = resetGameSelections("2v2");

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
        if (state.leftSelected.includes(index)) {
        } else if (state.leftPlayersSelected < 2) {
          state.leftSelected.push(index);
          state.leftPlayersSelected++;
          player.classList.add("player-selected");
          player.classList.remove("player-selectable");
        }
        if (state.leftPlayersSelected == 2) {
          const allIds = window.state.loggedInUsers.map((p) => p.id);
          state.leftSelected.sort();
          window.singleGameState["userIds"] = [
            allIds[state.leftSelected[0]],
            allIds[state.leftSelected[1]],
          ];
          for (let i = 0; i < 4; i++) {
            if (!state.leftSelected.includes(i))
              window.singleGameState["userIds"].push(allIds[i]);
          }
        }

        rightPlayers.forEach((rightPlayer, rightIndex) => {
          rightPlayer.classList.remove(
            "player-disabled",
            "player-selectable",
            "player-selected"
          );

          if (!state.leftSelected.includes(rightIndex)) {
            rightPlayer.classList.add("player-selectable");
            if (state.leftPlayersSelected === 2) {
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
    startButton2v2.disabled = state.leftPlayersSelected !== 2;
    startButton2v2.style.opacity = state.leftPlayersSelected === 2 ? "1" : "0.5";
    startButton2v2.style.cursor =
      state.leftPlayersSelected === 2 ? "pointer" : "not-allowed";
  }

  const observer = new MutationObserver(() => {
    const leftPlayers = Array.from(
      leftGrid.querySelectorAll(".game-player-card-inner-single")
    );
    const rightPlayers = Array.from(
      rightGrid.querySelectorAll(".game-player-card-inner-single")
    );

    if (leftPlayers.length > 0 && rightPlayers.length > 0) {
      attachLeftPlayerListeners(leftPlayers, rightPlayers);
      attachRightPlayerListeners(rightPlayers);

      window.singleGame = {
        reset: () => state = resetGameSelections("1v1"),
        randomize: () => randomizeChoice(leftPlayers, rightPlayers)
      };

      updateStartButton();
    }
  });

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
        reset: () =>  state = resetGameSelections("2v2"),
        randomize: () => randomizeChoice2v2(leftPlayers, rightPlayers)
      };

      updateStartButton2v2();
    }
  });

  observer.observe(leftGrid, { childList: true, subtree: true });
  observer.observe(rightGrid, { childList: true, subtree: true });
  observer2v2.observe(leftGrid2v2, { childList: true, subtree: true });
  observer2v2.observe(rightGrid2v2, { childList: true, subtree: true });

  return { observer, observer2v2 };
}

window.gameInit = {
  observers: null,
  initialize() {
    // Clean up any existing observers
    if (this.observers) {
      this.observers.observer.disconnect();
      this.observers.observer2v2.disconnect();
    }

    // Initialize new game and store observers
    this.observers = initializeGameSelector();
  },
  cleanup() {
    if (this.observers) {
      this.observers.observer.disconnect();
      this.observers.observer2v2.disconnect();
      this.observers = null;
    }
  }
};