import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const originalPositions = [
    0,-5, 0, 0,-5,-5, 0,-5, 5,-5,-5, 0, 5,-5, 0,
     0, 0,-5, 0, 0, 5,-5, 0, 0, 5, 0, 0,
    0, 5, 0, 0, 5,-5, 0, 5, 5,-5, 5, 0, 5, 5, 0,
];

class SelectorCube extends THREE.Object3D {
    
    geometry: THREE.BufferGeometry;
    material: THREE.PointsMaterial;
    public edgeIndicators: THREE.Points;

    private particleSize: number = 1;

    constructor() {
        super()

        this.geometry = new THREE.BufferGeometry();

        this.material = new THREE.PointsMaterial({ color: 0x00ff00, size: 2 })

        this.createPartGeometry(originalPositions)

        this.edgeIndicators = new THREE.Points( this.geometry, this.material );

    }

    createPartGeometry(partPositions: number[]) {
        const colors: number[] = [];
        const sizes = [];
        const color = new THREE.Color();

        for (let i = 0, l = partPositions.length / 3; i < l; i++) {
            color.setHSL(0.3, 1.0, 0.5);
            color.toArray(colors, i * 3);
            sizes[i] = this.particleSize;
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(partPositions, 3));
        this.geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    }

    // removeVerticesByX(partGeometry: , targetX: any) {
    //     const positions = partGeometry.attributes.position.array;
    //     const newPositions = [];
    //     const newColors = [];
    //     const newSizes = [];

    //     const originalColors = partGeometry.attributes.customColor.array;
    //     const originalSizes = partGeometry.attributes.size.array;

    //     this.removedVertices = [];

    //     for (let i = 0; i < positions.length; i += 3) {
    //         const x = positions[i];
    //         const y = positions[i + 1];
    //         const z = positions[i + 2];

    //         if (x === targetX) {
    //             this.removedVertices.push(x, y, z);
    //         } else {
    //             newPositions.push(x, y, z);
    //             newColors.push(originalColors[i], originalColors[i + 1], originalColors[i + 2]);
    //             newSizes.push(originalSizes[i / 3]);
    //         }
    //     }

    //     partGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    //     partGeometry.setAttribute('customColor', new THREE.Float32BufferAttribute(newColors, 3));
    //     partGeometry.setAttribute('size', new THREE.Float32BufferAttribute(newSizes, 1));

    //     partGeometry.attributes.position.needsUpdate = true;
    //     partGeometry.attributes.customColor.needsUpdate = true;
    //     partGeometry.attributes.size.needsUpdate = true;
    // }

    // restoreRemovedVertices(partGeometry: ) {
    //     if (this.removedVertices.length === 0) return;

    //     const currentPositions = Array.from(partGeometry.attributes.position.array);
    //     const currentColors = Array.from(partGeometry.attributes.customColor.array);
    //     const currentSizes = partGeometry.

    //     const restoredPositions = [...currentPositions, ...this.removedVertices];

    //     for (let i = 0; i < this.removedVertices.length / 3; i++) {
    //         currentColors.push(0.3, 1.0, 0.5);
    //         currentSizes.push(this.particleSize);
    //     }

    //     partGeometry.setAttribute('position', new THREE.Float32BufferAttribute(restoredPositions, 3));
    //     partGeometry.setAttribute('customColor', new THREE.Float32BufferAttribute(currentColors, 3));
    //     partGeometry.setAttribute('size', new THREE.Float32BufferAttribute(currentSizes, 1));

    //     partGeometry.attributes.position.needsUpdate = true;
    //     partGeometry.attributes.customColor.needsUpdate = true;
    //     partGeometry.attributes.size.needsUpdate = true;

    //     this.removedVertices = [];
    // }
}

let scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, controls: OrbitControls;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    const selectorCube = new SelectorCube();
    scene.add(selectorCube)
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();
animate();