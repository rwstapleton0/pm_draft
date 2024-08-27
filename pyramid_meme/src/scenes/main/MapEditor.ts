import * as THREE from 'three';
import { dimensions, outlineCube } from '../../engine/Object';
import { EventBus } from '../../engine/EventBus';

const outlineIdleYPos = -dimensions.height * 2;

export class MapEditor {
    private eventBus: EventBus;

    private map: THREE.Group;
    private mapEditor: THREE.Group;

    private outline: THREE.LineSegments;
    private raycaster: THREE.Raycaster;
    private pointer: THREE.Vector2;

    constructor(
        map: THREE.Group, 
    ) {
        this.eventBus = EventBus.getInstance();
        this.map = map;

        this.mapEditor = new THREE.Group();
        this.outline = outlineCube(0, outlineIdleYPos, 0);
        this.mapEditor.add(this.outline);

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        // Bind methods to ensure correct context when called
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerClick = this.onPointerClick.bind(this);

        // Add click event listener
        document.addEventListener('pointermove', this.onPointerMove);
        document.addEventListener('click', this.onPointerClick);
    }

    // Move build outline based on pointer movement
    private onPointerMove(event: PointerEvent): void {
        this.pointer.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(this.pointer, this.context.cameraManager.camera);
        const intersects = this.raycaster.intersectObjects([this.map], true);

        if (this.context.stateManager.getState() === 'BUILD') {
            this.pointerMoveInBuild(intersects)
            
            this.context.sceneManager.requestRender();
        }
    }

    private pointerMoveInBuild(intersects: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]) {
        if (intersects.length > 0) {
            const intersect = intersects[0];
            this.outline.position.copy(intersect.object.position);
        } else {
            this.outline.position.set(0, outlineIdleYPos, 0);
        }
    }

    // Handle pointer click events
    private onPointerClick(_event: MouseEvent): void {
        const intersects = this.raycaster.intersectObjects([this.map], true);

        if (intersects.length > 0) {

            if (this.context.stateManager.getState() === 'BUILD') {
                this.outline.position.set(0, outlineIdleYPos, 0);
                this.context.stateManager.setState('EDITOR');
            }
        }
    }

    // Dispose event listeners and cleanup
    dispose(): void {
        document.removeEventListener('pointermove', this.onPointerMove);
        document.removeEventListener('click', this.onPointerClick);
    }

    // Expose the MapEditor group object for adding to the scene
    getEditorObject(): THREE.Group {
        return this.mapEditor;
    }
}
