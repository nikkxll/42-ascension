/* ----- THREEJS Utils for all other parts ----- */
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// ai = 2 two AIs: AI vs god level AI
// ai = 1 one AI vs human
// ai = 0 two humans
// (to be implemented) ai = -4 four humans
window.startGame = (ai) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    function setCameraTop() {
        camera.position.z = 22
        camera.position.y = 0
        camera.rotation.x = 0
    }
    function setCameraAside() {
        camera.rotation.x = 50 * Math.PI / 180;
        camera.position.z = 16; 
        camera.position.y =  - camera.position.z * Math.tan(camera.rotation.x);
    }

    //setCameraTop()
    setCameraAside()

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

    // if we have 4 players we create the other two
    if (ai == -4){
        const playergeometry2 = new THREE.BoxGeometry(4, 0.5, 1);
        const playermaterial2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const player3 = new THREE.Mesh(playergeometry, playermaterial);
        const player4 = new THREE.Mesh(playergeometry, playermaterial);
        const player3outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial({color: 0xffffff}));
        const player4outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial({color: 0xffffff}));
        scene.add(player3outline);
        scene.add(player4outline);
        scene.add(player3);
        scene.add(player4);
    }

    // create separate material and geometry for the ball and register it
    const ballmaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const ballMesh = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    const ball = new THREE.Mesh(ballMesh, ballmaterial);
    scene.add(ball)

    // double array for the outer boxes
    let outerboxes = [[], [], []]

    /* ----- Local game logic and setup ----- */
    // initial speed of the ball
    const ballPower = 6
    let startAngle = getRandom(-1, 1); 
    let ballVelocity = {x: Math.cos(startAngle) * ballPower, y: Math.sin(startAngle) * ballPower}
    //let ballVelocity = { x: ballPower, y: ballPower }
    const playerSpeed = 12

    // the per frame change that is influenced by keyboard presses
    let playe1Delta = 0
    let playe2Delta = 0

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
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 1, //0.1,
            bevelSize: 0.05,
            bevelSegments: 5
        });

        const textMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff});
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-4, 7, -2); 
        scene.add(textMesh);
        textMesh.rotation.x = camera.rotation.x;
    }

    function setup() {
        // move the players to their starting position from <0,0,0>
        player1.position.x = 20
        player2.position.x = -20
        player1outline.position.x = 20
        player2outline.position.x = -20

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
                cur.position.x = -22 + i;
                cur.position.y = -11.25 - row;
                cur.position.z = 0;

                // create an edge and line for all boxes and move to the same position
                let edges = new THREE.EdgesGeometry(outerboxgeometry);
                let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
                line.position.x = -22 + i;
                line.position.y = -11.25 - row;
                line.position.z = 0;

                scene.add(line);
                scene.add(cur);

                // save them for later access
                element.push({ box: cur, out: line });

                // add the same thing on the other side
                cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                cur.position.x = -22 + i;
                cur.position.y = 11.25 + row;
                cur.position.z = 0;
                edges = new THREE.EdgesGeometry(outerboxgeometry);
                line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));

                line.position.x = -22 + i;
                line.position.y = 11.25 + row;
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
            playe1Delta = playerSpeed
        else if (code == 40)
            playe1Delta = -playerSpeed
        else if (code == 87)
            playe2Delta = playerSpeed
        else if (code == 83)
            playe2Delta = -playerSpeed
    }
    
    // registered as keyup listener, cleares the movement of the players
    // 38 = ArrowUp, 40 = ArrowDown, 87 = w, 83 = s
    function clear(e)
    {
        let code = e.which;
        if ((code == 87 || code == 83 && playe2Delta != 0))
            playe2Delta = 0
        if ((code == 40 || code == 38) && playe1Delta != 0)
            playe1Delta = 0
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
    let r0 = {x: ball.position.x, y: ball.position.y};
    let r1 = {x: player1.position.x, y: player1.position.y};
    let r2 = {x: player2.position.x, y: player2.position.y};
    let v0 = {x: ballVelocity.x, y: ballVelocity.y};
    let w = 40; // width of the game area
    let h = 20;// hight  = hegith of the game area - height of the player
    let yPredictionNoBorders = [0, 0];
    let yPrediction = 0;
    let hightFromBorders = 0;
    let epsilon = 1;
    playe1Delta = 0;


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
            r0 = {x: ball.position.x, y: ball.position.y};
            v0 = {x: ballVelocity.x, y: ballVelocity.y};
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
                if (r1.y - yPrediction > epsilon && playe1Delta >= 0){ // need to move down
                    if (playe1Delta > 0)
                        simulateArrowKey('keyup','ArrowUp');
                    if (playe1Delta >= 0)
                        simulateArrowKey('keydown','ArrowDown');
                }
                else if (r1.y - yPrediction < epsilon && playe1Delta <= 0){  // need to move up
                    if (playe1Delta < 0)
                        simulateArrowKey('keyup','ArrowDown');
                    if (playe1Delta <= 0)
                        simulateArrowKey('keydown','ArrowUp');
                }
            }
            else {
                if (playe1Delta < 0)
                    simulateArrowKey('keyup','ArrowDown');
                if (playe1Delta > 0)
                    simulateArrowKey('keyup','ArrowUp');
            }
        }
        // Test AI that just jumps to the ball position without any prediction
        // it is simplest solution that always wins the AI opponent
        if (ai == 2)
        {
            playe2Delta = 0;
            player2.position.y = ball.position.y
            player2outline.position.y = ball.position.y
        }
    }
 
    /* ----- loop setup ----- */
    let animationId = null;
    // start a clock
    let clock = new THREE.Clock();
    // keep track of deltatime since last frame
    let delta = 0;
    // text clock and delta
    let clockText = new THREE.Clock();
    let deltaTimeText = 0;
    // 75 max fps
    let interval = 1 / 75;

    let hitRacketFlag = 0;
    let deltaAngle = 0;
    let ballDirectionAngle = 0;
    let ballSpeed = 0;

    //let gameCount = [0, 0];
    let gameCount = [0, 0];

    function loop() {
        if (ai != 0)
            runAi()
        animationId = requestAnimationFrame(loop);
        // keep track of time since last loop call
        delta += clock.getDelta();
        deltaTimeText += clockText.getDelta();

        // if its time to draw a new frame
        if (delta > interval) {
            // move the players with deltatime
            player1.position.y += playe1Delta * delta
            player2.position.y += playe2Delta * delta
            player1outline.position.y += playe1Delta * delta
            player2outline.position.y += playe2Delta * delta

            // check for boundaries of the game area
            if (player1.position.y < -8.5) {
                player1.position.y = -8.5
                player1outline.position.y = -8.5
            }
            if (player1.position.y > 8.5) {
                player1.position.y = 8.5
                player1outline.position.y = 8.5
            }
            if (player2.position.y < -8.5) {
                player2.position.y = -8.5
                player2outline.position.y = -8.5
            }
            if (player2.position.y > 8.5) {
                player2.position.y = 8.5
                player2outline.position.y = 8.5
            }
            // checks if the ball should bounce
            if (ball.position.y < -10) {
                ball.position.y = -10
                ballVelocity.y *= -1
            }
            else if (ball.position.y > 10) {
                ball.position.y = 10
                ballVelocity.y *= -1
            }

            // check if player can interact with the ball
            // all bounces are assumed to be perfect and dont apply any modifications
            // player can interact if: 
            //      x distance is the sum of their width/2
            //      y is at most the distance of their combined height/2
            // the /2 is because the position is the center of the obj
            hitRacketFlag = 0
            if (Math.abs(ball.position.x - player1.position.x) <= player1.scale.x / 2 + ball.scale.x / 2 &&
                Math.abs(ball.position.y - player1.position.y) <= player1.scale.y / 2 + ball.scale.y)
            {
                ball.position.x = player1.position.x - player1.scale.x / 2 - ball.scale.x / 2 - 0.01
                deltaAngle = -(ball.position.y - player1.position.y) / player1.scale.y
                //gameCount[1] += 1
                hitRacketFlag = 1
            }
            else if (Math.abs(ball.position.x - player2.position.x) <= player2.scale.x / 2 + ball.scale.x / 2 &&
                Math.abs(ball.position.y - player2.position.y) <= player2.scale.y / 2 + ball.scale.y)
            {
                ball.position.x = player2.position.x + player2.scale.x / 2 + ball.scale.x / 2 + 0.01
                deltaAngle = (ball.position.y - player2.position.y) / player2.scale.y
                //gameCount[0] += 1
                hitRacketFlag = 1
            }
            ballSpeed = Math.sqrt(ballVelocity.y * ballVelocity.y + ballVelocity.x * ballVelocity.x)
            if (hitRacketFlag == 1){
                if (ballSpeed < 1000){
                    ballVelocity.x *= -1.5
                    ballVelocity.y *= 1.5
                    ballSpeed *= 1.5
                }
                else
                    ballVelocity.x *= -1
                ballDirectionAngle = Math.atan2(ballVelocity.y, ballVelocity.x) + deltaAngle
                ballVelocity.x = ballSpeed * Math.cos(ballDirectionAngle)
                ballVelocity.y = ballSpeed * Math.sin(ballDirectionAngle)
                // if the ball's v_x  is too low or wrong direction
                if (Math.sign(ball.position.x) * ballVelocity.x > -5){
                    ballVelocity.x = - Math.sign(ball.position.x) * ballPower
                }
            }

            // move the ball the appropriate amount
            ball.position.x += ballVelocity.x * delta
            ball.position.y += ballVelocity.y * delta
            if (gameCount[0] == 11 || gameCount[1] == 11){
                console.log("Game ended", gameCount)
                cancelAnimationFrame(animationId);
            }
            // check for goals and just reset position: subject to change
            if (hitRacketFlag == 0 && (ball.position.x > 21 || ball.position.x < -21)) 
            {
                if (ball.position.x > 0)
                    gameCount[1] += 1
                else
                    gameCount[0] += 1
                createText(gameCount[1] + " : " + gameCount[0]);
                console.log("Game count", gameCount)
                console.log("New ball")
                ball.position.x = 0
                ball.position.y = 0
                startAngle = getRandom(-1, 1); 
                ballVelocity = {x: Math.cos(startAngle) * Math.sign(ballVelocity.x) * ballPower, y: Math.sin(startAngle) * Math.sign(ballVelocity.y) * ballPower}
                deltaTimeAi = 2;
                //if (count = 11)
                //  return data
                //cancelAnimationFrame(animationId);
                //return 1; 
                // data to return
                // player 1 score1
                // player 2 score2
                // game_time time
                // ??? mean max speed of the ball

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

    return 1;
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
                // ??? mean max speed of the ball

}