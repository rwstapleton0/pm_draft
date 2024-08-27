
import * as THREE from 'three';
import { EventBus } from './EventBus';

const eventBus = EventBus.getInstance()

export type GameState = 'VIEW' | 'SELECT' | 'EDITOR';

export const dimensions = {
    width: 60,
    height: 60
}

const buildCubeGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.width);

// Draft Objects

const boundsMaterial = new THREE.MeshBasicMaterial( { visible: false, side: THREE.BackSide } );

export function boundsCube(x: number, y: number, z: number) {
    const boundsMesh = new THREE.Mesh( buildCubeGeometry, boundsMaterial );
    boundsMesh.position.set( x, y, z)

    return boundsMesh
}


// Map Segments

const buildCubeEdges = new THREE.EdgesGeometry(buildCubeGeometry);

const outlineMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 5, gapSize: 10 });
const transparentMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, color: 0x00ff00 });

export function buildCube(x: number, y: number, z: number) {
    // Create the cube
    const cube = new THREE.Mesh(buildCubeGeometry, transparentMaterial);
    cube.position.set( x, y, z)

    return cube
}

export function outlineCube(x: number, y: number, z: number) {
    // Create the dotted outline
    const outline = new THREE.LineSegments(buildCubeEdges, outlineMaterial);
    outline.position.set(x, y, z)
    outline.computeLineDistances();

    return outline
}

const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xD5F0C1 });
export function buildCubeBase(x: number, y: number, z: number) {
    // Create the cube
    const cube = new THREE.Mesh(buildCubeGeometry, baseMaterial);
    cube.position.set( x, y, z)

    return cube
}
