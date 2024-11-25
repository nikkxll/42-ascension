console.log("Fetch recent matches script loaded");
window.addEventListener('load', fetchRecentMatches);

async function fetchRecentMatches() {
	try{
		const response = await fetch('/api/matches/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	
		const { data } = await response.json();
		if (!data) {
			throw new Error('No data');
		}


		const matchList = document.querySelector('.match-results');
		data?.matches?.map((match) => {
			const newDiv = document.createElement("div");
			console.log(match);
			let scoreArr;
			let isWinner1 = undefined;
			if (match.score !== null) {
				scoreArr = match.score.split(":");
				isWinner1 = scoreArr[0] > scoreArr[1];
			}
			console.log(match.players[0]?.displayName, match.players[0]?.username)
			console.log(match.players[1]?.displayName, match.players[1]?.username)
			newDiv.innerHTML = `
				<li class="match-result">
				<p onclick="goToMatchView()" class="match-link">
					<span class=${isWinner1 === true ? "winner-name" : ""}>
						${match.players[0]?.displayName ?? match.players[0]?.username }
					</span> vs <span class=${isWinner1 === false ? "winner-name" : ""}>
						${match.players[1]?.displayName ?? match.players[1]?.username}
					</span> ${match.score ? "[" + match.score + "]" : "[0:0]"}
				</p>
				</li>
			`
			matchList.appendChild(newDiv);
		});

		// <span class="winner-name">${match.players[0].displayName || match.players[0].user.username }</span> vs ${match.players[1].username || match.players[1].user.username} [${match.score}]
	}
	catch (error) {
		console.error(error);
	}
}
