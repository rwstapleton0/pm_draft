import * as THREE from 'three';

export class BallPath extends THREE.Line {

    private points: THREE.Vector3[]; 
    private curves: THREE.CubicBezierCurve3[];

    private direction: THREE.Vector3;
    private velocity: THREE.Vector3;

    constructor(
        startPosition: THREE.Vector3,
        startDirection: THREE.Vector3,
        startSpeed: number,
        isVisualised: boolean, 
    ) {
        super()
    }

    handleUpdate() {
        
    }


}