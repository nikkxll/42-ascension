/* ----- THREEJS Utils for all other parts ----- */

import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 0.5, 4, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00} );

const ballmaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff} );

const player1 = new THREE.Mesh( geometry, material );
scene.add( player1 );

const player2 = new THREE.Mesh( geometry, material );
scene.add( player2 );

camera.position.z = 15;
player1.position.z -= 0.5
player2.position.z -= 0.5

const ballMesh = new THREE.BoxGeometry(0.5, 0.5, 0.5)
const ball = new THREE.Mesh(ballMesh, ballmaterial);


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
}

const playerSpeed = 12

function movement (e) {
    if (e.which == 38)
        playe1Delta = playerSpeed
    else if (e.which == 40)
        playe1Delta = -playerSpeed
    
    if (e.which == 87)
        playe2Delta = playerSpeed
    else if (e.which == 83)
        playe2Delta = -playerSpeed
}

function clear(e)
{
    console.log(e.which)
    if (e.which == 87 || e.which == 83 && playe2Delta != 0)
        playe2Delta = 0
    if (e.which == 40 || e.which == 38 && playe1Delta != 0)
        playe1Delta = 0
}

var render = function() {
    renderer.render(scene, camera);
};

/* ----- loop setup ----- */
let clock = new THREE.Clock();
let delta = 0;
// 30 fps
let interval = 1 / 75;

function loop()
{
    requestAnimationFrame(loop);
    delta += clock.getDelta();

    if (delta  > interval) {
        // The draw or time dependent code are here
        player1.position.y += playe1Delta * delta
        player2.position.y += playe2Delta * delta
        if (player1.position.y < -8.5)
            player1.position.y = -8.5

        if (player1.position.y > 8.5)
            player1.position.y = 8.5

        if (player2.position.y < -8.5)
            player2.position.y = -8.5

        if (player2.position.y > 8.5)
            player2.position.y = 8.5

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


        ball.position.x += ballvelocity.x * delta
        ball.position.y += ballvelocity.y * delta

        if (Math.abs(ball.position.x - player1.position.x) <= player1.scale.x / 2 + ball.scale.x / 2 &&
            Math.abs(ball.position.y - player1.position.y) <= player1.scale.y / 2 + ball.scale.y / 2)
        {
            ball.position.x = player1.position.x - player1.scale.x / 2 - ball.scale.x / 2
            ballvelocity.x *= -1
        }
        if (Math.abs(ball.position.x - player2.position.x) <= player2.scale.x / 2 + ball.scale.x / 2 &&
            Math.abs(ball.position.y - player2.position.y) <= player2.scale.y / 2 + ball.scale.y / 2)
        {
            ball.position.x = player2.position.x + player2.scale.x / 2 + ball.scale.x / 2
            ballvelocity.x *= -1
        }

        if (ball.position.x > 20.5 || ball.position.x < -20.5 )
        {
            ball.position.x = 0
            ball.position.y = 0
        }

        render();
        delta = delta % interval;
    }
}

document.addEventListener("keydown", movement, false)
document.addEventListener("keyup", clear, false)


/* ----- Main logic ----- */

setup()
loop()
