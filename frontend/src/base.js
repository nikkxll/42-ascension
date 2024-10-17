import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("enviroment").appendChild(renderer.domElement)

const starGeometry = new THREE.SphereGeometry(0.25, 24, 24)
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
function addStar() {
    const star = new THREE.Mesh(starGeometry, starMaterial)
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100))
    star.position.set(x, y, z)
    scene.add(star)
}

let stars = Array(200).fill().forEach(addStar)

let clock = new THREE.Clock();
let delta = 0;
// 30 max fps
let interval = 1 / 30;

let render = () => {
    requestAnimationFrame(render)

    delta += clock.getDelta();
    if (delta > interval) {
        camera.rotation.y += 0.2 * delta
        delta = delta % interval;
        renderer.render(scene, camera)
    }

}

render()

