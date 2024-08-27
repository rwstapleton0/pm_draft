import * as THREE from 'three';

export class Rail extends THREE.Mesh {
    private curves: THREE.CubicBezierCurve3[];
    private combinedCurve: THREE.CurvePath<THREE.Vector3>;
    private railShape?: THREE.Shape;
    
    constructor(
        curves?: THREE.CubicBezierCurve3[],
    ) {
        super()

        this.curves = [];
        if (curves && curves?.length !== 0) {
            curves.forEach(curve => {
                this.addCurve(curve)
            });
        }

        this.combinedCurve = new THREE.CurvePath();
        this.material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
    }

    // Method to add a new curve to the chain
    addCurve(curve: THREE.CubicBezierCurve3) {
        if (!this.railShape) {
            this.getRailShape(true)
        }
        // Store the new curve
        this.curves.push(curve);

        this.combinedCurve.add(curve);
        // // Update the geometry
        this.renderRail();
    }

    renderRail() {
        const extrudeSettings = {
            // depth: 1,
            steps: this.curves.length * 10,
            bevelEnabled: false,
            extrudePath: this.combinedCurve
        };

        this.geometry = new THREE.ExtrudeGeometry(this.railShape, extrudeSettings);
    }

    getRailShape(needRot: boolean) {
        const railShape = new THREE.Shape();
        if (needRot) {
            railShape.moveTo(-2, 0.5);
            railShape.lineTo(-2, -0.5);
            railShape.lineTo(2, -0.5);
            railShape.lineTo(2, 0.5);
            railShape.closePath();
        } else {
            railShape.moveTo(-0.5, 2);
            railShape.lineTo(-0.5, -2);
            railShape.lineTo(0.5, -2);
            railShape.lineTo(0.5, 2);
            railShape.closePath();
        }
    
        this.railShape = railShape
    }
}