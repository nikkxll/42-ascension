/* ----- THREEJS Utils for all other parts ----- */
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function checkPlayerPositionY(player, minY, maxY){
    if (player.position.y < minY)
        player.position.y = minY
    else if (player.position.y > maxY)
        player.position.y = maxY
}

function checkBallPositionY(ball, minY, maxY){
    if (ball.position.y < minY){
        ball.position.y = minY
        ball.velocity.y *= -1
    }
    else if (ball.position.y > maxY){
        ball.position.y = maxY
        ball.velocity.y *= -1
    }
}

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// ai = 2 two AIs: AI vs god level AI
// ai = 1 one AI vs human
// ai = 0 two humans
// (to be implemented) ai = -2 four humans
window.startGame = (ai) => {
    let gameResult = "Game is not finished yet"
    let maxScore = 11
    let hight = 20;
    let width = 40;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    function setCameraTop() {
        camera.position.z = 22
        camera.position.y = 0
        camera.rotation.x = 0
    }
    function setCameraAside() {
        camera.rotation.x = 50 * Math.PI / 180;
        camera.position.z = 20; 
        camera.position.y =  - camera.position.z * Math.tan(camera.rotation.x);
    }

    setCameraTop()
    //setCameraAside()

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth * 0.96, window.innerHeight * 0.96);

    // needs to be a game screen that we overlay and make visible
    document.getElementById("gameWindow").appendChild(renderer.domElement);

    // Add lights to the scene for score visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Softer global illumination
    scene.add(ambientLight)

    // players geometry and material is shared so we create it once
    const playergeometry = new THREE.BoxGeometry(0.5, 4, 1);
    const playermaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // creates the player box
    const player1 = new THREE.Mesh(playergeometry, playermaterial);
    // adds a border based on the geometry
    let edge = new THREE.EdgesGeometry(playergeometry);
    const player1outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial({color: 0xffffff}));
    // registers to be rendered
    scene.add(player1outline);
    scene.add(player1);
    // same as the other player
    const player2 = new THREE.Mesh(playergeometry, playermaterial);
    const player2outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial({color: 0xffffff}));
    scene.add(player2outline);
    scene.add(player2);

    
    // create separate material and geometry for the ball1 and register it
    const ball1material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const ball1Mesh = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    const ball1 = new THREE.Mesh(ball1Mesh, ball1material);
    scene.add(ball1)


    // (work in progress) if we have 4 players we create the other two
    const playergeometry2 = new THREE.BoxGeometry(0.5, 4, 1);
    let player2Edge = new THREE.EdgesGeometry(playergeometry2);
    const playermaterial2 = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const player3mesh = new THREE.Mesh(playergeometry2, playermaterial2);
    const player4mesh = new THREE.Mesh(playergeometry2, playermaterial2);
    const player3outline = new THREE.LineSegments(player2Edge, new THREE.LineBasicMaterial({color: 0x000000}));
    const player4outline = new THREE.LineSegments(player2Edge, new THREE.LineBasicMaterial({color: 0x000000}));

    const player3 = new THREE.Group();
    const player4 = new THREE.Group();
    player3.add(player3mesh);
    player4.add(player4mesh);
    player3.add(player3outline);
    player4.add(player4outline);

    // const ballmaterial2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const ballMesh2 = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    // const ball2 = new THREE.Mesh(ballMesh2, ballmaterial2);
    // scene.add(ball2)
    const pyramidGeometry = new THREE.ConeGeometry(1, 1.8, 4); // Radius, Height, RadialSegments
    let ball2EdgesGeometry = new THREE.EdgesGeometry(pyramidGeometry);
    const pyramidMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500, wireframe: false }); // Orange color
    const ball2mesh = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
    const ball2Edges = new THREE.LineSegments(ball2EdgesGeometry, new THREE.LineBasicMaterial({color: 0x000000}));
    const ball2 = new THREE.Group();
    ball2.add(ball2mesh)
    ball2.add(ball2Edges)

    if (ai == -2){
        // Add the groups to the scene
        scene.add(player3);
        scene.add(player4);
        scene.add(ball2);
    
        ball2.position.x = 5;
        ball2.position.y = 5;
        ball2.velocity =  new THREE.Vector3(0, 0, 0);

        player3.position.x = -width / 2
        player3.position.y = hight / 4
        player4.position.x = width / 2
        player4.position.y = hight / 4 
    }

    // double array for the outer boxes
    let outerboxes = [[], [], []]

    /* ----- Local game logic and setup ----- */
    // initial speed of the ball1
    const ballPower = 6
    const ballAccelerationCoef = 1.5
    const ballSpeedLimit = 1000
    const playerSpeed = 12
    let startAngle = getRandom(-1, 1);
    let ball1Velocity = {x: Math.cos(startAngle) * ballPower, y: Math.sin(startAngle) * ballPower}
    if (ai == -2){
        startAngle = getRandom(-1, 1)
        ball2.velocity = {x: Math.cos(startAngle) * ballPower, y: Math.sin(startAngle) * ballPower, z: 0}
        //let ball2Velocity = {x: Math.cos(startAngle) * ballPower, y: Math.sin(startAngle) * ballPower}
    }

    // the per frame shift that is influenced by keyboard presses  = player1Velocity * (time duration since last frame)
    let player1Velocity = 0
    let player2Velocity = 0
    //player3.velocity =  new THREE.Vector3(0, 0, 0);
    let player3Velocity = 0
    let player4Velocity = 0

    // Function to create text geometry
    let textMesh, font, frame = 0
    function createText(text) {
        if (textMesh) {
            scene.remove(textMesh); // Remove the old text
            textMesh.geometry.dispose(); // Clean up memory
        }

        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 2, //1,
            height: 0.01,
            // curveSegments: 12,
            // bevelEnabled: true,
            // bevelThickness: 1, //0.1,
            // bevelSize: 0.05,
            //    bevelSegments: 5
        });

        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff});
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-4, 7, -2); 
        scene.add(textMesh);
        //textMesh.rotation.x = camera.rotation.x;
        textMesh.rotation.x = - Math.atan((textMesh.position.y - camera.position.y)/ (textMesh.position.z - camera.position.z));
    }

    function setup() {
        // move the players to their starting position from <0,0,0>
        player1.position.x = width / 2
        player2.position.x = -width / 2
        player1outline.position.x = width / 2
        player2outline.position.x = -width / 2

        // Load the font and create initial text
        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (loadedFont) {
            font = loadedFont;
            createText("0 : 0"); // Initial text
        });

        // use the same geometry for all outer boxes
        const outerboxgeometry = new THREE.BoxGeometry(0.95, 0.95, 1);
        const outerboxmaterial = new THREE.MeshBasicMaterial({ color: 0xf000f0, });
        // loop over all the rows that share the height of the outer boxes
        outerboxes.forEach((element, row) => {
            for (let i = 1; i < 44; i++) {
                // create box and move to the correct position in its row
                var cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                cur.position.x = -width/2 - 2 + i;
                cur.position.y = -hight/2 - 1.25 - row;
                cur.position.z = 0;

                // create an edge and line for all boxes and move to the same position
                let edges = new THREE.EdgesGeometry(outerboxgeometry);
                let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
                line.position.x = -width/2 - 2 + i;
                line.position.y = -hight/2 - 1.25 - row;
                line.position.z = 0;

                scene.add(line);
                scene.add(cur);

                // save them for later access
                element.push({ box: cur, out: line });

                // add the same thing on the other side
                cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                cur.position.x = -width/2 - 2 + i;
                cur.position.y = hight/2 + 1.25 + row;
                cur.position.z = 0;
                edges = new THREE.EdgesGeometry(outerboxgeometry);
                line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));

                line.position.x = -width/2 - 2 + i;
                line.position.y = hight/2 + 1.25 + row;
                line.position.z = 0;

                scene.add(line);
                scene.add(cur);

                element.push({ box: cur, out: line });
            }
        })
    }
    
    // function registered as an event listener to keydown events
    // 38 = ArrowUp, 40 = ArrowDown, 87 = w, 83 = s
    function movement (e) {
        let code = e.which;
        if (code == 38)
            player1Velocity = playerSpeed
        else if (code == 40)
            player1Velocity = -playerSpeed
        //else if (code == 87)
        else if ('W'.charCodeAt(0) == code)
            player2Velocity = playerSpeed
        else if ('S'.charCodeAt(0) == code)
            player2Velocity = -playerSpeed
        else if ('R'.charCodeAt(0) == code)
            player3Velocity = playerSpeed
        else if ('F'.charCodeAt(0) == code)
            player3Velocity = -playerSpeed
        else if ('O'.charCodeAt(0) == code)
            player4Velocity = playerSpeed
        else if ('L'.charCodeAt(0) == code)
            player4Velocity = -playerSpeed
        else if (code == 32){ // space
            //setCameraAside()
            gameResult = "Game stoped by user. space pressed"
            console.log("Enter is pressed, gameResult = ", gameResult)
            cancelAnimationFrame(animationId);
            return gameResult;
        }
        //else if (code == 13) // enter 
        //    setCameraTop()
    }
    
    // registered as keyup listener, cleares the movement of the players
    // 38 = ArrowUp, 40 = ArrowDown, 87 = w, 83 = s
    function clear(e)
    {
        let code = e.which;
        if ((code == 40 || code == 38) && player1Velocity != 0)
            player1Velocity = 0
        else if ((code == 'W'.charCodeAt(0) || code == 'S'.charCodeAt(0) && player2Velocity != 0))
            player2Velocity = 0
        else if ((code == 'R'.charCodeAt(0) || code == 'F'.charCodeAt(0)) && player3Velocity != 0)
            player3Velocity = 0
        else if ((code == 'O'.charCodeAt(0) || code == 'L'.charCodeAt(0)) && player4Velocity != 0)
            player4Velocity = 0
    }
    
    // util function
    var render = function() {
        renderer.render(scene, camera);
    };

    // AI Algo part
    // settging for the AI
    let timeIntervalAi = 1;  // must to be 1 according to the subject
    let clockAi = new THREE.Clock();
    let deltaTimeAi = 0;
    let r0 = {x: ball1.position.x, y: ball1.position.y};
    let r1 = {x: player1.position.x, y: player1.position.y};
    let r2 = {x: player2.position.x, y: player2.position.y};
    let v0 = {x: ball1Velocity.x, y: ball1Velocity.y};
    let w = width; // width of the game area
    let h = hight;// hight  = hegith of the game area - height of the player
    let yPredictionNoBorders = [0, 0];
    let yPrediction = 0;
    let hightFromBorders = 0;
    let epsilon = 1;
    player1Velocity = 0;


    // this function is used to simulate key presses. 
    // Only for ArrowUp and ArrowDown
    function simulateArrowKey(keyUpDown, key) {
        if (!(key == 'ArrowDown' || key == 'ArrowUp'))
            return;
        let numCode = 40
        if (key == 'ArrowUp')
            numCode = 38
        else if (key == 'ArrowDown')
            numCode = 40
        const event = new KeyboardEvent(keyUpDown, {
            key: key,
            code: key,
            keyCode: numCode, 
            bubbles: true, // Ensure the event bubbles up
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    function runAi()
    {
        deltaTimeAi += clockAi.getDelta();
        if (deltaTimeAi > timeIntervalAi){
            r0 = {x: ball1.position.x, y: ball1.position.y};
            v0 = {x: ball1Velocity.x, y: ball1Velocity.y};
            v0 = v0.x == 0 ? {x: 0.0001, y: v0.y} : v0;
            yPredictionNoBorders = [
                r0.y + (-w/2 - r0.x) * v0.y / v0.x, 
                r0.y + ( w/2 - r0.x) * v0.y / v0.x
            ];
            hightFromBorders = Math.abs(yPredictionNoBorders[v0.x > 0 ? 1 : 0]) - h / 2;
            if (hightFromBorders < 0)
                yPrediction = yPredictionNoBorders[v0.x > 0 ? 1 : 0];
            else
                yPrediction = (h/2 - hightFromBorders % h) * Math.sign(v0.y) 
                    * Math.pow(-1, Math.floor(hightFromBorders / h) % 2);
            deltaTimeAi = 0;
        }        
        if (ai >= 1)
        {
            r1 = {x: player1.position.x, y: player1.position.y};
            if (v0.x > 0 && Math.abs(r1.y - yPrediction) > epsilon) {
                if (r1.y - yPrediction > epsilon && player1Velocity >= 0){ // need to move down
                    if (player1Velocity > 0)
                        simulateArrowKey('keyup','ArrowUp');
                    if (player1Velocity >= 0)
                        simulateArrowKey('keydown','ArrowDown');
                }
                else if (r1.y - yPrediction < epsilon && player1Velocity <= 0){  // need to move up
                    if (player1Velocity < 0)
                        simulateArrowKey('keyup','ArrowDown');
                    if (player1Velocity <= 0)
                        simulateArrowKey('keydown','ArrowUp');
                }
            }
            else {
                if (player1Velocity < 0)
                    simulateArrowKey('keyup','ArrowDown');
                if (player1Velocity > 0)
                    simulateArrowKey('keyup','ArrowUp');
            }
        }
        // Test AI that just jumps to the ball1 position without any prediction
        // it is simplest solution that always wins the AI opponent
        if (ai == 2)
        {
            player2Velocity = 0;
            player2.position.y = ball1.position.y
            player2outline.position.y = ball1.position.y
        }
    }
 
    /* ----- loop setup ----- */
    let animationId = null;
    // start a clock
    let clock = new THREE.Clock();
    // keep track of deltatime since last frame
    let delta = 0;
    // 75 max fps
    let interval = 1 / 75;

    let hitRacketFlag = 0;
    let deltaAngle = 0;
    let ball1DirectionAngle = 0;
    let ball1Speed = 0;


    let playerMaxY = hight / 2 - 1.5
    let gameCount = [0, 0]

    
    
    console.log("player1 scale=", player1.scale.y, "ball scale=", ball1.scale.y)
    function loop() {
        if (ai != 0)
            runAi()
        animationId = requestAnimationFrame(loop);
        // keep track of time since last loop call
        delta += clock.getDelta();

        // if its time to draw a new frame
        if (delta > interval) {
            // move the players with deltatime
            player1.position.y += player1Velocity * delta
            player2.position.y += player2Velocity * delta
            player1outline.position.y += player1Velocity * delta
            player2outline.position.y += player2Velocity * delta
            if (ai == -2){
                player3.position.y += player3Velocity * delta
                player4.position.y += player4Velocity * delta
            }

            // check for boundaries of the game area
            if (player1.position.y < -playerMaxY) {
                player1.position.y = -playerMaxY
                player1outline.position.y = -playerMaxY
            }
            if (player1.position.y > playerMaxY) {
                player1.position.y = playerMaxY
                player1outline.position.y = playerMaxY
            }
            if (player2.position.y < -playerMaxY) {
                player2.position.y = -playerMaxY
                player2outline.position.y = -playerMaxY
            }
            if (player2.position.y > playerMaxY) {
                player2.position.y = playerMaxY
                player2outline.position.y = playerMaxY
            }
            // checks if the ball1 should bounce
            if (ball1.position.y < -hight / 2) {
                ball1.position.y = -hight / 2 
                ball1Velocity.y *= -1
            }
            else if (ball1.position.y > hight / 2 ) {
                ball1.position.y = hight / 2
                ball1Velocity.y *= -1
            }
            if (ai == -2){
                checkPlayerPositionY(player3, -playerMaxY, playerMaxY)
                checkPlayerPositionY(player4, -playerMaxY, playerMaxY)
                checkBallPositionY(ball2, -hight/2, hight/2)
            }

            // check if player can interact with the ball1
            // all bounces are assumed to be perfect and dont apply any modifications
            // player can interact if: 
            //      x distance is the sum of their width/2
            //      y is at most the distance of their combined height/2
            // the /2 is because the position is the center of the obj
            hitRacketFlag = 0
            if (Math.abs(ball1.position.x - player1.position.x) <= player1.scale.x / 2 + ball1.scale.x / 2 &&
                Math.abs(ball1.position.y - player1.position.y) <= player1.scale.y / 2 + ball1.scale.y)
            {
                //console.log("Hit racket", Math.abs(ball1.position.y - player1.position.y) , " vs ", player1.scale.y / 2 + ball1.scale.y)
                ball1.position.x = player1.position.x - player1.scale.x / 2 - ball1.scale.x / 2 - 0.01
                deltaAngle = -(ball1.position.y - player1.position.y) / player1.scale.y
                //gameCount[1] += 1
                hitRacketFlag = 1
            }
            else if (Math.abs(ball1.position.x - player2.position.x) <= player2.scale.x / 2 + ball1.scale.x / 2 &&
                Math.abs(ball1.position.y - player2.position.y) <= player2.scale.y / 2 + ball1.scale.y)
            {
                ball1.position.x = player2.position.x + player2.scale.x / 2 + ball1.scale.x / 2 + 0.01
                deltaAngle = (ball1.position.y - player2.position.y) / player2.scale.y
                //gameCount[0] += 1
                hitRacketFlag = 1
            }
            ball1Speed = Math.sqrt(ball1Velocity.y * ball1Velocity.y + ball1Velocity.x * ball1Velocity.x)
            if (hitRacketFlag == 1){
                if (ball1Speed < ballSpeedLimit){
                    ball1Velocity.x *= -ballAccelerationCoef
                    ball1Velocity.y *= ballAccelerationCoef
                    ball1Speed *= ballAccelerationCoef
                }
                else
                    ball1Velocity.x *= -1
                ball1DirectionAngle = Math.atan2(ball1Velocity.y, ball1Velocity.x) + deltaAngle
                ball1Velocity.x = ball1Speed * Math.cos(ball1DirectionAngle)
                ball1Velocity.y = ball1Speed * Math.sin(ball1DirectionAngle)
                // if the ball1's v_x  is too low or wrong direction
                if (Math.sign(ball1.position.x) * ball1Velocity.x > -5){
                    ball1Velocity.x = - Math.sign(ball1.position.x) * ballPower
                }
            }

            // move the ball1 the appropriate amount
            ball1.position.x += ball1Velocity.x * delta
            ball1.position.y += ball1Velocity.y * delta
            if (gameCount[0] == maxScore || gameCount[1] == maxScore){
                console.log("Game ended", gameCount)
                gameResult = "Game ended";
                cancelAnimationFrame(animationId);
                return gameResult; 

            }
            // check for goals and just reset position: subject to change
            if (hitRacketFlag == 0 && (ball1.position.x > width / 2  || ball1.position.x < - width / 2))
            {
                if (ball1.position.x > 0)
                    gameCount[1] += 1
                else
                    gameCount[0] += 1
                createText(gameCount[1] + " : " + gameCount[0]);
                console.log("Game count", gameCount)
                console.log("New ball1")
                ball1.position.x = 0
                ball1.position.y = 0
                startAngle = getRandom(-1, 1); 
                ball1Velocity = {x: Math.cos(startAngle) * Math.sign(ball1Velocity.x) * ballPower, y: Math.sin(startAngle) * Math.sign(ball1Velocity.y) * ballPower}
                deltaTimeAi = 2;
                //if (count = 11)
                //  return data
                //cancelAnimationFrame(animationId);
                //return 1; 
                // data to return
                // player 1 score1
                // player 2 score2
                // game_time time
                // ??? mean max speed of the ball1

            }
            // update each outer box height based on sin to create a wave effect
            outerboxes.forEach((element, row) => {
                element.forEach((box, index) => {
                    box.box.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                    box.box.position.z = -1 + box.box.scale.z / 2
                    box.out.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                    box.out.position.z = -1 + box.out.scale.z / 2
                });
            });

            render();
            // if we have multiple frames it skips to the most recent one
            delta = delta % interval;
        }
    }

    // allows keydown and keyup to move player
    document.addEventListener("keydown", movement, false)
    document.addEventListener("keyup", clear, false)


    /* ----- Main logic ----- */

    setup()
    loop()

    return gameResult;
    // return new Promise((resolve, reject) => {
    //     // Simulate the game logic with a timeout, or call the game logic here
    //     setTimeout(() => {
    //         let result = "Game finished successfully"; // Example result
    //         resolve(result); // Resolve the promise with the result
    //     }, 3000); // Simulating a 3-second delay for the game
    // });
                // data to return
                // player 1 score1
                // player 2 score2
                // game_time time
                // ??? mean max speed of the ball1

}