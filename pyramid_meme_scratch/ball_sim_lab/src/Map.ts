import * as THREE from 'three';

export class Map extends THREE.Object3D {

    map: THREE.Line[] = []

    private material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    constructor () {
        super()
        this.addStraight(
            new THREE.Vector3(0,20,0),
            new THREE.Vector3(10,15,0)
        )
    }

    addStraight(pos1: THREE.Vector3, pos2: THREE.Vector3) {

        // Create a line from the points
        const geometry = new THREE.BufferGeometry().setFromPoints( [pos1, pos2] );
        const line = new THREE.Line( geometry, this.material );
        this.add(line)
        this.map.push(line)
    }

}