import * as THREE from 'three';
import { EventBus } from './EventBus';

export interface IRaycastData {
    intersects?: THREE.Intersection[],
    centerPosition?: THREE.Vector3,
    pointerPosition?: THREE.Vector2
};

export class CameraManager {

    camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private eventBus: EventBus = EventBus.getInstance();

    private target: THREE.Vector3 = new THREE.Vector3();

    private previousPosition: THREE.Vector2 = new THREE.Vector2();
    private isPressHeld: boolean = false;
    private isDragging: boolean = false;
    private currentPolarAngle: number = Math.PI / 2;;
    private currentAzimuthalAngle: number = 0;
    private spherical: THREE.Spherical;

    private distance: number = 180;
    private rotationSpeed: number = 0.005;

    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    private pointer: THREE.Vector2 = new THREE.Vector2();

    private targets: THREE.Object3D[] = [];

    constructor(
        renderer: THREE.WebGLRenderer,
    ) {
        this.renderer = renderer;

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        this.spherical = new THREE.Spherical(this.distance, this.currentPolarAngle, this.currentAzimuthalAngle);
        

        this.eventBus.emit('cameraChange', { camera: this.camera });
        this.eventBus.on('cameraTargetChange', ({ target, distance }) => this.handleCameraTargetChange(target, distance))
        this.eventBus.on('rayTargetsChange', ({ targets }) => this.handleRaycastTargetsChange(targets))
        // this.eventBus.on('frameUpdate', ({ deltaTime }) => this.update(deltaTime));

        this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.renderer.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.renderer.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.renderer.domElement.addEventListener('pointercancel', this.onPointerUp.bind(this));

        this.renderer.domElement.style.touchAction = 'none';
        this.handleDragChange()
    }

    onPointerDown(event: PointerEvent) {
        this.isPressHeld = true;
        this.previousPosition.set(event.clientX, event.clientY);
        this.eventBus.emit('pointerDown', {})
    }

    onPointerMove(event: PointerEvent) {
        if (this.isPressHeld || this.isDragging) {
            this.isDragging = true;
            this.isPressHeld = false;

            const currentX = event.clientX;
            const currentY = event.clientY;

            const deltaX = currentX - this.previousPosition.x;
            const deltaY = currentY - this.previousPosition.y;

            // Adjust azimuthal and polar angles based on pointer movement
            this.currentAzimuthalAngle -= deltaX * this.rotationSpeed;
            this.currentPolarAngle = Math.max(0.1, Math.min(Math.PI - 0.1, this.currentPolarAngle - deltaY * this.rotationSpeed));

            const raycastData = this.handleRaycast(event)        
            this.eventBus.emit('pointerMoved', raycastData)
            this.handleDragChange()

            this.previousPosition.set(currentX, currentY);
        }

    }

    onPointerUp(event: PointerEvent) {

        this.pointer.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const raycastData = this.handleRaycast(event)

        this.eventBus.emit('pointerUp', { raycastData, isPress: this.isPressHeld})

        this.isDragging = false;
        this.isPressHeld = false;
    }

    handleRaycast(event: PointerEvent): IRaycastData {

        this.pointer.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const pointerPosition = new THREE.Vector2(event.clientX, event.clientY)

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.targets, true);

        if ( intersects.length > 0 ) {

            const intersect = intersects[ 0 ];

            const centerPosition = new THREE.Vector3;

            if (intersect!.face) {
                centerPosition.copy( intersect.point ).sub( intersect!.face!.normal );
                centerPosition.divideScalar( 10 ).floor().multiplyScalar( 10 ).addScalar( 5 );
            } else {
                intersect.object.getWorldPosition(centerPosition);
            }
            return { intersects, centerPosition, pointerPosition }
        }
        return { pointerPosition }
    }

    handleDragChange() {

        this.spherical.set(this.distance, this.currentPolarAngle, this.currentAzimuthalAngle);

        // Convert spherical coordinates to Cartesian and apply to camera position
        const cameraPosition = new THREE.Vector3().setFromSpherical(this.spherical).add(this.target);

        // Update camera position and look at the target
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(this.target);

    }

    handleCameraTargetChange(target: THREE.Object3D | THREE.Vector3, distance?: number) {
        // console.log('Camera target was changed: ', target);
        if (target instanceof THREE.Object3D) {
            this.target = target.position
        } else {
            this.target = target;
        }
        this.distance = distance ?? 40
        this.handleDragChange()
        this.eventBus.emit('rerender', {})
    }

    handleRaycastTargetsChange(targets: THREE.Object3D[]) {
        this.targets = targets
    }

    // update(deltaTime: number): void {
    //     this.handleOrbit(deltaTime);
    // }

    dispose() {
        // Clean up event listeners
        this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown.bind(this));
        this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove.bind(this));
        this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp.bind(this));
        this.renderer.domElement.removeEventListener('pointercancel', this.onPointerUp.bind(this));
    }
}