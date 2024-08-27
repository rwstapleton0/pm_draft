import * as THREE from 'three';
import { initMap } from './Map';
import { MapEditor } from './MapEditor';

export function createMainScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAD9BB);

    const map = initMap();
    scene.add(map);

    // Instantiate the MapEditor and pass in sceneManager
    const mapEditor = new MapEditor(map);
    scene.add(mapEditor.getEditorObject());

    return scene
}