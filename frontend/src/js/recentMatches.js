console.log("Fetch recent matches script loaded");
document.addEventListener("DOMContentLoaded", async () => {
	await renderRecentMatches();
});

async function renderRecentMatches() {
	window.state.recentMatches = await fetchRecentMatches();
	const data = window.state.recentMatches;
	console.log(data);
	const matchList = document.querySelector(".match-results");
	matchList.innerHTML = "";

	if (!data || !matchList) {
		return;
	}
	data?.matches?.map((match) => {
		const newDiv = document.createElement("div");
		let isWinner1 = undefined;
		if (match.score !== null) {	
			isWinner1 = Number(match.score[0]) > Number(match.score[1]);
		}
		const matchScore = match.score ? match.score[0] + ":" + match.score[1] : "0:0";

		let team1Div = `<div class=${isWinner1 === true ? "winner-name" : ""}>
							${match.players[0]?.displayName ?? match.players[0]?.username}
						</div>`;
		let team2Div = `<div class=${isWinner1 === false ? "winner-name" : ""}>
							${match.players[1]?.displayName ?? match.players[1]?.username}
						</div>`;
		if (match.players.length == 4) {
			// console.log(match.score[0], match.score[1], isWinner1);
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
			<div onclick="goToMatchView()" class="match-link">
				${team1Div}
				<div class="versus-text">vs</div>
				${team2Div}
				${matchScoreDiv}
			</div>
			</li>`;
		matchList.appendChild(newDiv);
	});
}

async function fetchRecentMatches() {
	try {
		const response = await fetch("/api/matches/", {
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
