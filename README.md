# Ascension
our journey to transend at Hive

## Install
clone the repo, change the docker compose files volume location -> docker compose up

## How to run

https://localhost/ - this is the lobby view, where most of the interactions, login and user dashboards will happen. its equivalent to https://localhost/index.html

### Game

https://localhost/game.html - game with 2 ai with Threejs, will expand a bit this week

## Backend endpoints

### Create a new user

```
fetch("http://localhost:8000/players/create-player/", {
      "method": "POST",
      "headers": {
            "Content-Type": "application/json; charset=utf-8"
      },
      "body": "{\"username\":\"tony\",\"password\":\"123\",\"displayName\":\"Tony\"}"
})
.then((res) => res.text())
.then(console.log.bind(console))
.catch(console.error.bind(console));
```



## PLEASE EXPAND THESE WITH YOUR MODULES

### Modules done

graphics, browsers, frontend toolkit

### Modules in work

language support, multiple players, fixing the ai, game customisation with colors and speeds
