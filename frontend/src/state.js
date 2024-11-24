window.state = {
    // max size 4
    loggedInUsers: [
        {"displayname": "", "avatar": "", "id": "", "gamesPlayed": 0, "winrate": 0.0} ,
        {"displayname": "", "avatar": "", "id": "", "gamesPlayed": 0, "winrate": 0.0},
        {"displayname": "", "avatar": "", "id": "", "gamesPlayed": 0, "winrate": 0.0}
    ],
    // max 5
    recentMatches: [
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"}
    ],
    // max 5
    tournaments: [ 
        {"name": "", "status": "", "winner": "", "runnerUp": "", "created": "", "ended": ""},
        {"name": "", "status": "", "winner": "", "runnerUp": "", "created": "", "ended": ""},
        {"name": "", "status": "", "winner": "", "runnerUp": "", "created": "", "ended": ""},
        {"name": "", "status": "", "winner": "", "runnerUp": "", "created": "", "ended": ""}
    ]
}
window.tournamentState = {
    // exactly 4, could require to match loggedin
    players: [
        {"name": "", "winrate": 0.0, status: "online"},
        {"name": "", "winrate": 0.0, status: "online"},
        {"name": "", "winrate": 0.0, status: "online"},
        {"name": "", "winrate": 0.0, status: "online"}
    ],
    status: "",
    name: "",
    matches: [
        {"player1": "1", "player2": "2", "status": "0", "score": ""},
        {"player1": "3", "player2": "4", "status": "0", "score": ""},
    ]
}
//window.singleGameState = {}  for tournament
// window.singleGameState = {
//     player1: "id1",
//     player2: "id2",
//     player1_score: 0,
//     player2_score: 0,
//     match_time: 0
//     //"status": "0",
// }

 window.singleGameState = {
    player1: "id1", 
    player2: "id2",
    player3: "id3",
    player4: "id4",
    player1_score: 0,
    player2_score: 0,
    match_time: 0
    //"status": "0",
}

let userinfo = {
    allMatches: [
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"}
    ],
    winrate: 0.0
}

window.updateRecentGames = () => {
    let res = fetch("localhost:8000/recentMatches")
    if (res.ok)
    {
        window.state.recentMatches = res.json();
    }
    updateRecentMatchesView();
}

window.updateRecentMatchView = () => {
    let i = 0
    let recentMatchesBoxes = document.getElementsByClassName("recentMatchesBoxes")
    recentMatchesBoxes.forEach(element => {
        let match = window.state.recentMatches[i++]
        element.innerText = match.winner + " " + match.loser + " " + match.score
    });
}