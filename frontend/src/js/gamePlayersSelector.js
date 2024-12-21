/* Single 1v1 game players pick */

playerEventListeners = {
  single: new Map(),
  doubles: new Map()
};

function removeAllEventListeners(listenerMap) {
  const grids = [
    document.querySelector(".single-game-grid-left"),
    document.querySelector(".single-game-grid-right"),
    document.querySelector("#double-game-grid-left"),
    document.querySelector("#double-game-grid-right"),
  ];
  grids.forEach((grid) => {
    const elements = Array.from(
      grid.querySelectorAll(".game-player-card-inner-single")
    );
    elements.forEach((element) => {
      if (listenerMap.has(element)) {
        const listeners = listenerMap.get(element);
        listeners.forEach(({eventType, handler}) => {
          element.removeEventListener(eventType, handler);
        });
        listenerMap.delete(element);
      }
    });
  });
}

function addTrackedEventListener(element, eventType, handler, listenerMap) {
  if (!listenerMap.has(element)) {
    listenerMap.set(element, []);
  }
  listenerMap.get(element).push({eventType, handler});
  element.addEventListener(eventType, handler);
}

function resetGameSelections() {
  const grids = [
    document.querySelector(".single-game-grid-left"),
    document.querySelector(".single-game-grid-right"),
    document.querySelector("#double-game-grid-left"),
    document.querySelector("#double-game-grid-right"),
  ];
  const buttons = [
    document.querySelector(".single-game-buttons.start"),
    document.querySelector("#start2v2"),
  ];

  grids.forEach((grid) => {
    if (grid) {
      const players = Array.from(
        grid.querySelectorAll(".game-player-card-inner-single")
      );
      players.forEach((player) => {
        player.classList.remove(
          "player-disabled",
          "player-selected",
          "player-selectable"
        );
        player.classList.add("player-selectable");
      });
    }
  });

  buttons.forEach((button) => {
    if (button) {
      button.disabled = true;
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
    }
  });

  window.singleGameState["userIds"] = [];

  return {
    playersSelected: 0,
    leftSelectedIndex: null,
    leftPlayersSelected: 0,
    leftSelected: [],
  };
}

function initializeGameSelector() {
  const leftGrid = document.querySelector(".single-game-grid-left");
  const rightGrid = document.querySelector(".single-game-grid-right");
  const startButton = document.querySelector(".single-game-buttons.start");
  let isInitialized = false;

  let state = {
    playersSelected: 0,
    leftSelectedIndex: null,
    leftPlayersSelected: 0,
    leftSelected: [],
  };

  function updateStartButton() {
    startButton.disabled = state.playersSelected !== 2;
    startButton.style.opacity = state.playersSelected === 2 ? "1" : "0.5";
    startButton.style.cursor =
      state.playersSelected === 2 ? "pointer" : "not-allowed";
  }

  function randomizeChoice(leftPlayers, rightPlayers) {

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

      const clickHandler = () => {
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
      };
      addTrackedEventListener(player, 'click', clickHandler, playerEventListeners.single);
    });
  }

  function attachRightPlayerListeners(rightPlayers) {
    rightPlayers.forEach((player, index) => {
      const clickHandler = () => {
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
      };
      addTrackedEventListener(player, 'click', clickHandler, playerEventListeners.single);
    });
  }

  const observer = new MutationObserver(() => {
    const leftPlayers = Array.from(
      leftGrid.querySelectorAll(".game-player-card-inner-single")
    );
    const rightPlayers = Array.from(
      rightGrid.querySelectorAll(".game-player-card-inner-single")
    );

    removeAllEventListeners(playerEventListeners.single);

    if (!isInitialized) {
      attachLeftPlayerListeners(leftPlayers, rightPlayers);
      attachRightPlayerListeners(rightPlayers);
      isInitialized = true;

      window.singleGame = {
        reset: () => {
          isInitialized = false;
          return (state = resetGameSelections());
        },
        randomize: () => randomizeChoice(leftPlayers, rightPlayers),
      };

      updateStartButton();
    }
  });

  observer.observe(leftGrid, { childList: true, subtree: true });
  observer.observe(rightGrid, { childList: true, subtree: true });
}
