import * as THREE from 'three';
import { EventBus } from './EventBus';
import { GameState } from './Object';

export class SceneManager {

    private renderer: THREE.WebGLRenderer;
    private eventBus: EventBus;
    private currentCamera?: THREE.PerspectiveCamera;

    private scenes: Record<string, THREE.Scene> = {};
    private currentScene!: THREE.Scene;
    private lastTimestamp: number = 0;

    constructor(
        renderer: THREE.WebGLRenderer,
    ) {
        this.renderer = renderer;
        this.eventBus = EventBus.getInstance();
        
        this.setScene = this.setScene.bind(this);

        this.eventBus.on('gameStateChange', ({ state }) => this.onGameStateChange(state))
        this.eventBus.on('sceneChange',  ({ sceneName }) => this.setScene(sceneName));
        this.eventBus.on('rerender', ({}) => this.requestRender);
        this.eventBus.on('cameraChange', ({ camera }) => this.currentCamera = camera);
    }

    onGameStateChange(state: GameState): void {
        console.log('Game State Was changed: ', state)
        if (state === 'VIEW' || state === 'SELECT') {
            this.setScene('main')
        } else if (state === 'EDITOR') {
            this.setScene('editor')
        }
    }

    addScene(name: string, scene: THREE.Scene): void {
        this.scenes[name] = scene;
    }

    setScene(sceneName: string): void {
        if (!this.scenes[sceneName]) {
            console.warn(`Scene ${sceneName} not found`);
        }
        this.currentScene = this.scenes[sceneName];
    }

    update(timestamp: number): void {
        if (!this.currentScene || !this.currentCamera) {
            return
        }
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        this.eventBus.emit('frameUpdate', { deltaTime })
        this.renderer.render(this.currentScene, this.currentCamera);
    }

    requestRender(): void {
        this.renderer.setAnimationLoop((timestamp) => this.update(timestamp));
    }
}
