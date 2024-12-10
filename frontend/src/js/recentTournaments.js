async function renderRecentTournaments() {
  window.state.tournaments = await fetchRecentTournaments();
  const data = window.state.tournaments;
  const tournamentField = document.querySelector(".tournament-details");
  tournamentField.innerHTML = "";
  console.log(data);

  if (!data || !tournamentField) {
    return;
  }

  data?.tournaments?.forEach((tournament) => {
    const title = document.createElement("a");
    title.href = "#";
    title.classList.add("tournament-link");
    title.textContent = tournament.name || "Unknown Tournament";
    tournamentField.appendChild(title);

    tournamentField.appendChild(document.createElement("br"));

    tournamentField.appendChild(document.createTextNode("Status: "));
    const status = document.createElement("span");
    status.classList.add(
      tournament.winner === null ? "status-pending" : "status-completed"
    );
    status.textContent = tournament.winner ? "completed" : "in progress";
    tournamentField.appendChild(status);

    tournamentField.appendChild(document.createElement("br"));

    tournamentField.appendChild(
      document.createTextNode(`Winner: ${tournament?.winner?.displayName || "N/A"}`)
    );

    tournamentField.appendChild(document.createElement("br"));

    const runnerUp =
      (tournament.matches[2]?.score[0] ?? 0) >
      (tournament.matches[2]?.score[1] ?? 0)
        ? tournament.matches[2]?.players[1]?.displayName || "N/A"
        : tournament.matches[2]?.players[0]?.displayName || "N/A";
    tournamentField.appendChild(
      document.createTextNode(`Runner-up: ${runnerUp}`)
    );

    tournamentField.appendChild(document.createElement("br"));

    tournamentField.appendChild(document.createTextNode(`Created: `));
    const createdDate = document.createElement("span");
    createdDate.classList.add("date-text");
    createdDate.textContent = (tournament.createdAt || "N/A").substring(0, 10);
    tournamentField.appendChild(createdDate);

    tournamentField.appendChild(document.createElement("br"));

    tournamentField.appendChild(document.createTextNode(`Ended: `));
    const endedDate = document.createElement("span");
    endedDate.classList.add("date-text");
    endedDate.textContent = tournament.matches[2]?.createdAt || "N/A";
    tournamentField.appendChild(endedDate);

    tournamentField.appendChild(document.createElement("br"));
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
