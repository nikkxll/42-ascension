/* ----- THREEJS Utils for all other parts ----- */

import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

let inGame = false
if (inGame)
    document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 0.5, 4, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00} );

const ballmaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff} );

const player1 = new THREE.Mesh( geometry, material );
let edge = new THREE.EdgesGeometry(geometry);
const player1outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
scene.add( player1outline );
scene.add( player1 );

const player2 = new THREE.Mesh( geometry, material );
const player2outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
scene.add( player2outline );
scene.add( player2 );

camera.position.z = 18;


const ballMesh = new THREE.BoxGeometry(0.5, 0.5, 0.5)
const ball = new THREE.Mesh(ballMesh, ballmaterial);

let outerboxes = [[],[],[]]

scene.add(ball)


/* ----- Local game logic and setup ----- */
const ballPower = 6
let ballvelocity = {x: ballPower, y: ballPower}

let playe1Delta = 0 
let playe2Delta = 0 

function setup()
{
    player1.position.x = 20
    player2.position.x = -20
    player1outline.position.x = 20
    player2outline.position.x = -20

    // player1.position.z -= 0.5
    // player2.position.z -= 0.5

    // player1outline.position.z -= 0.5
    // player2outline.position.z -= 0.5

    let row;

    const outerboxgeometry = new THREE.BoxGeometry(0.95, 0.95, 1);
    const outerboxmaterial = new THREE.MeshBasicMaterial({color: 0xf000f0, });
    outerboxes.forEach((element, row) =>{
            for (let i = 1; i < 44; i++)
                {
                    var cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                    cur.position.x = -22 + i;
                    cur.position.y = -11.25 - row;
                    cur.position.z = 0;
                    
                    let edges = new THREE.EdgesGeometry( outerboxgeometry ); 
                    let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
                    
                    line.position.x = -22 + i;
                    line.position.y = -11.25 - row;
                    line.position.z = 0;

                    scene.add( line );
                    scene.add(cur);

                    element.push({box: cur, out: line});
                    
                    cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                    cur.position.x = -22 + i;
                    cur.position.y = 11.25 + row;
                    cur.position.z = 0;
                    
                    edges = new THREE.EdgesGeometry( outerboxgeometry ); 
                    line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 

                    line.position.x = -22 + i;
                    line.position.y = 11.25 + row;
                    line.position.z = 0;

                    scene.add( line );
                    scene.add(cur);
                    
                    element.push({box: cur, out: line});
                }
    })
}

const playerSpeed = 12

function movement (e) {
    if (ai == 0)
    {
        if (e.which == 38)
            playe1Delta = playerSpeed
        else if (e.which == 40)
            playe1Delta = -playerSpeed
    }
    if (ai < 2)
    {
        if (e.which == 87)
            playe2Delta = playerSpeed
        else if (e.which == 83)
            playe2Delta = -playerSpeed
    }
}

let ai = 2
function clear(e)
{
    console.log(e.which)
    if (ai == 0 && (e.which == 87 || e.which == 83 && playe2Delta != 0))
        playe2Delta = 0
    if (ai < 2 && (e.which == 40 || e.which == 38 && playe1Delta != 0))
        playe1Delta = 0
}

var render = function() {
    renderer.render(scene, camera);
};

/* ----- loop setup ----- */
let clock = new THREE.Clock();
let delta = 0;
// 75 max fps
let interval = 1 / 75;


function runAi()
{
    if (ai >= 1)
    {
        if (Math.abs(player1.position.y - ball.position.y) > 1 && Math.abs(player1.position.x - ball.position.x) < 22)
            playe1Delta = (player1.position.y - ball.position.y) * -playerSpeed
        else
            playe1Delta = 0
    }
    if (ai == 2)
    {
        if (Math.abs(player2.position.y - ball.position.y) > 1 && Math.abs(player2.position.x - ball.position.x) < 22)
            playe2Delta = (player2.position.y - ball.position.y) * -playerSpeed
        else
            playe2Delta = 0
    }
}

function loop()
{
    if (ai != 0)
        runAi()
    requestAnimationFrame(loop);
    delta += clock.getDelta();

    if (delta  > interval) {
        // The draw or time dependent code are here
        player1.position.y += playe1Delta * delta
        player2.position.y += playe2Delta * delta

        player1outline.position.y += playe1Delta * delta
        player2outline.position.y += playe2Delta * delta

        if (player1.position.y < -8.5)
        {
            player1.position.y = -8.5
            player1outline.position.y = -8.5
        }

        if (player1.position.y > 8.5)
        {
            player1.position.y = 8.5
            player1outline.position.y = 8.5
        }

        if (player2.position.y < -8.5)
        {
            player2.position.y = -8.5
            player2outline.position.y = -8.5
        }

        if (player2.position.y > 8.5)
        {
            player2.position.y = 8.5
            player2outline.position.y = 8.5
        }

        if (ball.position.y < -10 )
        {
            ball.position.y = -10
            ballvelocity.y *= -1
        }
        else if (ball.position.y > 10)
        {
            ball.position.y = 10
            ballvelocity.y *= -1
        }


        
        if (Math.abs(ball.position.x - player1.position.x) <= player1.scale.x / 2 + ball.scale.x / 2 &&
        Math.abs(ball.position.y - player1.position.y) <= player1.scale.y / 2 + ball.scale.y)
        {
            ball.position.x = player1.position.x - player1.scale.x / 2 - ball.scale.x / 2 - 0.01
            ballvelocity.x *= -1
        }
        if (Math.abs(ball.position.x - player2.position.x) <= player2.scale.x / 2 + ball.scale.x / 2 &&
        Math.abs(ball.position.y - player2.position.y) <= player2.scale.y / 2 + ball.scale.y)
        {
            ball.position.x = player2.position.x + player2.scale.x / 2 + ball.scale.x / 2 + 0.01
            ballvelocity.x *= -1
        }

        ball.position.x += ballvelocity.x * delta
        ball.position.y += ballvelocity.y * delta
        
        if (ball.position.x > 21 || ball.position.x < -21 )
        {
            ball.position.x = 0
            ball.position.y = 0
        }

        outerboxes.forEach((element, row) => {
            element.forEach((box, index) => {
                box.box.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                box.box.position.z = -1 + box.box.scale.z / 2
                box.out.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                box.out.position.z = -1 + box.out.scale.z / 2
            });
        });

        render();
        delta = delta % interval;
    }
}

document.addEventListener("keydown", movement, false)
document.addEventListener("keyup", clear, false)


/* ----- Main logic ----- */

setup()
loop()
