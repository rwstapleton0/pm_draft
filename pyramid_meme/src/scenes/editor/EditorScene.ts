import * as THREE from 'three';
import { EventBus } from '../../engine/EventBus';
import { RailBuilder } from './RailBuilder';
import { boundsCube, GameState, outlineCube } from '../../engine/Object';
import { SelectorCube } from '../../objects/SelectorCube';
import { PyramidSegment } from '../../objects/PyramidSegment';

export class EditorScene extends THREE.Scene {
    private eventBus: EventBus = EventBus.getInstance();

    private pyramidSegment: PyramidSegment;
    // private railBuilder: RailBuilder;

    private outline: THREE.LineSegments;
    private selectorCube: THREE.Object3D;
    private boundsCube: THREE.Mesh;

    private hasSelectorCubeMoved: boolean = true;

    constructor() {
        super();
        this.background = new THREE.Color(0x80BCBD);
        this.pyramidSegment = new PyramidSegment();
        this.add(this.pyramidSegment)
        new RailBuilder(this.pyramidSegment);
        // this.railBuilder = new RailBuilder(this.pyramidSegment);

        this.outline = outlineCube(0, 0, 0);
        this.add(this.outline);

        this.selectorCube = new SelectorCube();
        this.add(this.selectorCube);

        this.boundsCube = boundsCube(0, 0, 0);
        this.add(this.boundsCube);

        this.eventBus.on('gameStateChange', ({ state }) => this.onSceneChange(state))
        this.eventBus.on('pointerMoved', ({ centerPosition }) => this.onPointerMoved(centerPosition!))
        this.eventBus.on('railStart', () => this.onEditorStart())
        this.eventBus.on('moveSelector', ({ direction }) => this.onMoveSelector(direction))
        this.eventBus.on('railFinished', () => this.onRailFinished())
        this.eventBus.emit('cameraTargetChange', { target: this.outline, distance: 180 })
        this.eventBus.emit('rayTargetsChange', { targets: [this.boundsCube]})

    }

    private onSceneChange(state: GameState) {
        if (state === 'EDITOR') {
            this.eventBus.emit('rayTargetsChange', { targets: [this.boundsCube]})
        }
    }

    private onPointerMoved(normalPosition: THREE.Vector3) {
        if (this.hasSelectorCubeMoved) {
            // console.log(normalPosition)
            // move to selector cube???
            this.selectorCube.position.copy( normalPosition )
            this.eventBus.emit('rerender', {})
        }
    }

    private onEditorStart() {
        this.eventBus.emit('cameraTargetChange', { target: this.selectorCube, distance: 40 })
        this.eventBus.emit('rayTargetsChange', { targets: [ (this.selectorCube as SelectorCube).edgeIndicators ] })
        this.hasSelectorCubeMoved = false;
    }
    
    private onRailFinished() {
        this.eventBus.emit('cameraTargetChange', { target:new THREE.Vector3() , distance: 180 })
        this.eventBus.emit('rayTargetsChange', { targets: [ this.boundsCube ] })
    }

    private onMoveSelector(direction: THREE.Vector3) {

    }
}