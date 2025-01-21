document.addEventListener("DOMContentLoaded", async () => {
	changeUnderline(0);
	history.replaceState({ view: 'lobby' }, null, "")
	await renderRecentMatches();
	await renderRecentTournaments();
});