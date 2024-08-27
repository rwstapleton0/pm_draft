import * as THREE from 'three';
import { EventBus } from '../../engine/EventBus';
import { PyramidSegment } from '../../objects/PyramidSegment';
import { Rail } from '../../objects/Rail'
import { BallPath } from '../../objects/BallPath';

// look through segment vertices for node.
// if none start a new one else return and so editing.
// need to put bounds on.

export class RailBuilder {

    private eventBus: EventBus = EventBus.getInstance();
    private pyramidSegment: PyramidSegment;

    private ballPath?: BallPath;

    private selectedRail?: Rail;
    private lastPoint?: THREE.Vector3;
    private lastLocalPoint?: THREE.Vector3;

    constructor(
        pyramidSegment: PyramidSegment
    ) {
        this.pyramidSegment = pyramidSegment;

        this.ballPath = new BallPath(
            new THREE.Vector3(-5, 35, 35),
            new THREE.Vector3(-5, 35, 35),
            20,
            true
        );

        this.eventBus.on('pointSelected', ({ centerPosition, localPosition }) => this.onPointSelected(centerPosition!, localPosition))
        // this.eventBus.on('pointerUp', ({ raycastData: { centerPosition }}) => this.onPointSelected(centerPosition!))
        this.eventBus.on('railFinished', () => this.onRailFinished())
    }

    onRailFinished() {
        this.selectedRail = undefined
    }

    onPointSelected(centerPosition: THREE.Vector3, localPosition: THREE.Vector3) {
        if (!this.selectedRail) {
            this.selectedRail = new Rail();
            this.pyramidSegment.addRail(this.selectedRail);
        }
        const position = centerPosition.add(localPosition)
        if (!this.lastPoint || !this.lastLocalPoint) {
            this.lastPoint = position;
            this.lastLocalPoint = localPosition
            return
        }

        if (this.lastLocalPoint!.y === localPosition.y) {
            localPosition.y = 0;
            this.lastLocalPoint!.y = 0
        }

        const curve = new THREE.CubicBezierCurve3(
            this.lastPoint.clone(),
            this.lastPoint.clone().sub(this.lastLocalPoint!.clone().divideScalar(5).multiplyScalar(3.5)),
            position.clone().sub(localPosition.clone().divideScalar(5).multiplyScalar(3.5)),
            position.clone()
        )


        this.lastPoint = undefined
        this.lastLocalPoint = undefined
        // should visulise first.
        this.selectedRail.addCurve(curve)

        this.eventBus.emit('moveSelector', { direction: localPosition })
    }
    
}