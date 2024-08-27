import * as THREE from 'three';
import { Rail } from '../../objects/RailPath';
import { EventBus } from '../../engine/EventBus';

const points = [
    new THREE.Vector3( -10, 5, 5 ),
    new THREE.Vector3( -7, 5, 5 ),
    new THREE.Vector3( -5, 3, 5 ),
    new THREE.Vector3( -5, 0, 5 ),

    new THREE.Vector3( -5, -3, 5 ),
    new THREE.Vector3( -2, -5, 5 ),
    new THREE.Vector3( 0, -5, 5 ),

    new THREE.Vector3( 3, -5, 5 ),
    new THREE.Vector3( 5, -5, 7 ),
    new THREE.Vector3( 5, -5, 10 )
];

export class DraftEditor {
    // private eventBus: EventBus = EventBus.getInstance();
    // private draft: THREE.Group;

    // private rollOverCube: THREE.Mesh;  
    // private boundsCube: THREE.Mesh;

    // private selectedRail: Rail | null;

    // constructor(
    // ) {
    //     this.draft = new THREE.Group();
    //     // this.outline = outlineCube(0, 0, 0);
    //     // this.draft.add(this.outline);

    //     this.rollOverCube = rollOverCube(0, 0, 0);
    //     this.draft.add(this.rollOverCube);

    //     this.boundsCube = boundsCube(0, 0, 0);
    //     this.draft.add(this.boundsCube);

        
    //     // this.railBuilder = new Rail(points);
    //     this.selectedRail = new Rail();
    //     this.draft.add(this.selectedRail)


    //     this.onPointerMove = this.onPointerMove.bind(this);
    //     this.onPointerClick = this.onPointerClick.bind(this);

    //     document.addEventListener('pointermove', this.onPointerMove);
    //     document.addEventListener('click', this.onPointerClick);
    // }

    // private onPointerMove(event: PointerEvent): void {
    //     this.pointer.set(
    //         (event.clientX / window.innerWidth) * 2 - 1,
    //         -(event.clientY / window.innerHeight) * 2 + 1
    //     );

    //     // this.raycaster.setFromCamera(this.pointer, this.context.cameraManager.camera);
    //     const intersects = this.raycaster.intersectObjects([this.boundsCube], true);

    //     if ( intersects.length > 0 ) {

    //         const intersect = intersects[ 0 ];

    //         this.rollOverCube.position.copy( intersect.point ).sub( intersect!.face!.normal );
    //         this.rollOverCube.position.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar( 5 );

    //         // this.context.sceneManager.requestRender();
    //         this.eventBus.emit('rerender', {});
    //     }
    // }

    // // // Handle pointer click events
    // private onPointerClick(_event: MouseEvent): void {
    //     const intersects = this.raycaster.intersectObjects([this.boundsCube], true);
    //     if ( intersects.length > 0 ) {

    //         const intersect = intersects[ 0 ];

    //         const pos = intersect.point.sub( intersect!.face!.normal ).divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar( 5 );
    //         // console.log(this.rollOverCube.position)

    //         this.selectedRail?.addCurve(pos)

    //         const newRotation = new THREE.Euler(0, Math.PI, 0);
    //         const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

    //         // this.context.cameraManager.setTargetPositionAndRotation(pos, newQuaternion)

    //         // this.context.sceneManager.requestRender();
            
    //     }

    // }

    // // Dispose event listeners and cleanup
    // dispose(): void {
    //     document.removeEventListener('pointermove', this.onPointerMove);
    // }
}