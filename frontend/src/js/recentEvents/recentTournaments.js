async function renderRecentTournaments() {
  window.state.tournaments = await fetchRecentTournaments();
  const data = window.state.tournaments;
  //   const tournamentField = document.querySelector(".tournament-details");
  const tournamentField = document.querySelector(".tournament-content");
  tournamentField.innerHTML = "";

  if (!data || !tournamentField) {
    return;
  }

  data?.tournaments?.forEach((tournament, index) => {
    const tournamentContainer = document.createElement("div");
    tournamentContainer.id = "tournament-" + tournament.id;
    tournamentContainer.classList.add("tournament-block");
    tournamentContainer.classList.add("carousel-item");
    if (index == 0) tournamentContainer.classList.add("active");

    tournamentContainer.addEventListener("click", () => {
      goToLoadedTournament(tournament.id);
      history.pushState(
        { view: "loadedtournament", index: tournament.id },
        null,
        ""
      );
    });

    const title = document.createTextNode(
      tournament.name || "Unknown Tournament"
    );
    tournamentContainer.appendChild(title);

    tournamentContainer.appendChild(document.createElement("br"));

    tournamentContainer.appendChild(document.createTextNode("Status: "));
    const status = document.createElement("span");
    status.classList.add(
      tournament.winner === null ? "status-pending" : "status-completed"
    );
    status.textContent = tournament.winner ? "completed" : "in progress";
    tournamentContainer.appendChild(status);

    tournamentContainer.appendChild(document.createElement("br"));

    tournamentContainer.appendChild(
      document.createTextNode(
        `Winner: ${
          tournament?.winner?.displayName ||
          tournament?.winner?.username ||
          "N/A"
        }`
      )
    );

    tournamentContainer.appendChild(document.createElement("br"));

    const runnerUp = !tournament.winner
      ? "N/A"
      : Number(tournament.matches[2]?.score?.[0]) >
        Number(tournament.matches[2]?.score?.[1])
      ? tournament.matches[2]?.players[1]?.displayName ||
        tournament.matches[2]?.players[1]?.username
      : tournament.matches[2]?.players[0]?.displayName ||
        tournament.matches[2]?.players[0]?.username;
    tournamentContainer.appendChild(
      document.createTextNode(`Runner-up: ${runnerUp}`)
    );

    tournamentContainer.appendChild(document.createElement("br"));

    tournamentContainer.appendChild(document.createTextNode(`Created: `));
    const createdDate = document.createElement("span");
    createdDate.classList.add("date-text");
    createdDate.textContent = (tournament.createdAt || "N/A").substring(0, 10);
    tournamentContainer.appendChild(createdDate);

    tournamentContainer.appendChild(document.createElement("br"));

    tournamentContainer.appendChild(document.createTextNode(`Ended: `));
    const endedDate = document.createElement("span");
    endedDate.classList.add("date-text");
    endedDate.textContent = (
      tournament.matches[2]?.createdAt || "N/A"
    ).substring(0, 10);
    tournamentContainer.appendChild(endedDate);

    tournamentContainer.appendChild(document.createElement("br"));
    tournamentField.appendChild(tournamentContainer);
  });
}

async function fetchRecentTournaments() {
  try {
    const response = await fetch("/api/tournaments/?last=5", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    if (!data) {
      throw new Error("No data");
    }
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
