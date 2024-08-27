import * as THREE from 'three';
import { RenderUI } from './ui/RenderUI'
import { EditorScene } from './scenes/editor/EditorScene';
// import { MainScene } from './scenes/main/MainScene';

import { SceneManager } from './engine/SceneManager';
import { CameraManager } from './engine/CameraManager';

function init(): void {
    
    const renderer = setupRenderer();
    const sceneManager = new SceneManager(renderer);
    new CameraManager(renderer);

    RenderUI();

    // const mainScene = createMainScene(context);
    // context.sceneManager.addScene('main', mainScene);

    sceneManager.addScene('editor', new EditorScene());
    sceneManager.setScene('editor')

    sceneManager.requestRender();
}

function setupRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
}

init();