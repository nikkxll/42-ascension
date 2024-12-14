document.addEventListener("DOMContentLoaded", async () => {
	history.replaceState({ view: 'lobby' }, null, "")
	await renderRecentMatches();
	await renderRecentTournaments();
});