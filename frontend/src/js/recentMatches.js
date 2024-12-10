async function renderRecentMatches() {
	window.state.recentMatches = await fetchRecentMatches();
	const data = window.state.recentMatches;
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
			<div onclick="goToMatchView(${match.id})" class="match-link">
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

async function renderDetailedMatchStats(matchId) {
	function secondsToHms(d) {
		d = Number(d);
		const h = Math.floor(d / 3600);
		const m = Math.floor((d % 3600) / 60);
		const s = Math.floor((d % 3600) % 60);

		const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
		const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
		const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
		return hDisplay + mDisplay + sDisplay;
	}

	function isoDateToShortDate(isoDate) {
		const date = new Date(isoDate);
		return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	}

	try {
		const renderElement = document.querySelector(".matchView .match-stats");
		const response = await fetch(`/api/matches/${matchId}/`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			console.error(
				`HTTP error getting the match stats! status: ${response.status}`
			);
			return null;
		}
		const { data } = await response.json();

		const team1Div =	data.players.length === 2 ? 
							`<div>${data.players[0].displayName || data.players[0].username}</div>` :
							`<div class="player-small-text">${data.players[0].displayName || data.players[0].username}</div>
							<div class="player-small-text">${data.players[1].displayName || data.players[1].username}</div>`;
		const team2Div =	data.players.length === 2 ? 
							`<div>${data.players[1].displayName || data.players[1].username}</div>` :
							`<div class="player-small-text">${data.players[2].displayName || data.players[2].username}</div>
							<div class="player-small-text">${data.players[3].displayName || data.players[3].username}</div>`;

		renderElement.innerHTML = `
			<div class="match-stats-header">
				<header class="match-stats-header-wrapper">
					<p onclick="goToHomeRight()" class="animation">
						<img src="./assets/back_arrow.svg" alt="" />
					</p>
					<h1 class="match-stats-title-top">Match statistics</h1>
				</header>
				</div>
				<div class="match-stats-result">
					<div class="match-stats-text-format">
						<div>${team1Div}</div>
						<div>${data.score[0]}</div>

					</div>
					<div class="match-stats-text-format">
						<div>${team2Div}</div>	
						<div>${data.score[1]}</div>
					</div>
				</div>
				<div class="match-stats-result match-stats-time-info">
					<div class="match-stats-text-format">
						<span>Match time:</span>
						<span>${secondsToHms(data.duration)}</span>
					</div>
					<div class="match-stats-text-format">
						<span>Date:</span>
						<span>${isoDateToShortDate(data.createdAt)}</span>
					</div>
				</div>

			</div>
			`;
	} catch (error) {
		console.error(error);
	}
}
