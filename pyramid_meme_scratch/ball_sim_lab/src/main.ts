import './style.css'
import * as THREE from 'three';
import { BallPath } from './BallPath';
import { Map } from './Map';

function main() {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    scene.add(camera)
    camera.position.z = 50
    camera.position.x = 15
    camera.position.y = 20
    const renderer = setupRenderer()

    // const map = new Map()
    // scene.add(map)

    const ballPath = new BallPath()
    scene.add(ballPath)

    renderer.setAnimationLoop(() => renderer.render(scene, camera));
}


function setupRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
}

main()