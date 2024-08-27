import * as THREE from 'three';
import { EventBus } from './EventBus';

export class CameraManager {

    camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private eventBus: EventBus = EventBus.getInstance();

    private startPosition: THREE.Vector3 = new THREE.Vector3();;
    private targetPosition: THREE.Vector3 = new THREE.Vector3();;
    
    private startQuaternion: THREE.Quaternion = new THREE.Quaternion();;
    private targetQuaternion: THREE.Quaternion = new THREE.Quaternion();;

    private t: number = 0;
    private duration: number = 1.0;
    isMoving: boolean = false;
    private stopDistance: number = 30;

    constructor(
        renderer: THREE.WebGLRenderer,

    ) {
        this.renderer = renderer;

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 100;
        this.eventBus.emit('cameraChange', { camera: this.camera });

        this.updateCamera = this.updateCamera.bind(this);
        this.eventBus.on('frameUpdate', ({ deltaTime }) => this.updateCamera(deltaTime));

        // this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    }



    // onOrbit(event: PointerEvent) {
    //     // if (event.buttons === 1) { // Left mouse button for rotation
    //         const deltaX = event.movementX;
    //         const deltaY = event.movementY;

    //         this.currentAzimuthalAngle -= deltaX * this.rotationSpeed;
    //         this.currentPolarAngle = Math.max(0.1, Math.min(Math.PI - 0.1, this.currentPolarAngle - deltaY * this.rotationSpeed));
    //     // }

    //     this.updateCameraPosition();
    // }

    // updateCameraPosition() {
    //     if (!this.target) return
    //     const x = this.target.position.x + this.distance * Math.sin(this.currentPolarAngle) * Math.sin(this.currentAzimuthalAngle);
    //     const y = this.target.position.y + this.distance * Math.cos(this.currentPolarAngle);
    //     const z = this.target.position.z + this.distance * Math.sin(this.currentPolarAngle) * Math.cos(this.currentAzimuthalAngle);

    //     this.camera.position.set(x, y, z);
    //     this.camera.lookAt(this.target.position);
    // }

    
    


    setTargetPositionAndRotation(position: THREE.Vector3, rotation: THREE.QuaternionLike, duration = 1.0) {
        this.startPosition.copy(this.camera.position);
        
        const direction = new THREE.Vector3().subVectors(position, this.startPosition).normalize();
        this.targetPosition.copy(position).sub(direction.multiplyScalar(this.stopDistance));

        this.startQuaternion.copy(this.camera.quaternion);
        this.targetQuaternion.copy(rotation);

        this.t = 0;  // Reset interpolation parameter
        this.duration = duration;  // Set duration of interpolation
        this.isMoving = true;

    }

    // Method to update the camera's position and orientation
    updateCamera(deltaTime: number) {
        if (!this.isMoving) return;  // If not moving, skip update

        // Increase the interpolation parameter by deltaTime / duration
        // Clamp t to 1.0 to ensure it does not exceed the endpoint
        this.t += deltaTime / this.duration;
        this.t = Math.min(this.t, 1.0);

        // Linearly interpolate position
        // Slerp quaternion rotation
        this.camera.position.lerpVectors(this.startPosition, this.targetPosition, this.t);
        this.camera.quaternion.slerpQuaternions(this.startQuaternion, this.targetQuaternion, this.t);

        // Check if interpolation is complete
        if (this.t >= 1.0) {
            this.isMoving = false;
        }
    }
}