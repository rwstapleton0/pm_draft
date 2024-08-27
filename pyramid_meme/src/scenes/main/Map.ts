
import * as THREE from 'three';
import { dimensions, buildCube, buildCubeBase } from '../../engine/Object';

export function initMap() {

    const map = createPyramid(4);
    
    // const gridHelper = new THREE.GridHelper( 100, 10, 0x888888 );
    // map.add( gridHelper );

    return map
}

function createPyramid(layers: number) {
    const pyramid = new THREE.Group();

    for (let y = 0; y < layers; y++) {
        for (let x = -y; x <= y; x++) {
            for (let z = -y; z <= y; z++) {
                if (y - Math.abs(x) === Math.abs(z) || y - Math.abs(z) === Math.abs(x)) {
                    const cube = buildCube(x * dimensions.width, -y * dimensions.height, z * dimensions.width);
                    pyramid.add(cube);
                } else if (Math.abs(x) + Math.abs(z) < y) {
                    const cube = buildCubeBase(x * dimensions.width, -y * dimensions.height, z * dimensions.width);
                    pyramid.add(cube);
                }
            }
        }
    }
    return pyramid
}

