import * as THREE from 'three';
import { Rail } from './Rail';

export class PyramidSegment extends THREE.Object3D {

    private rails?: Rail[];

    constructor(rails?: Rail[]) {
        super()
        this.rails = !rails || rails.length ? [] : rails;
    }

    addRail(rail: Rail) {
        this.rails?.push(rail)
        this.add(rail)
    }
}