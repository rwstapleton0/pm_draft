import * as THREE from 'three';

export class Rail extends THREE.Line {

    private points: THREE.Vector3[]; 
    private curves: THREE.CubicBezierCurve3[];

    pathGeometry = new THREE.BufferGeometry();
    pathMaterial = new THREE.LineBasicMaterial( { linewidth: 3, color: 0xff0000 } );
    // material = new THREE.LineBasicMaterial( { linewidth: 3, color: 0xff0000 } );
    
    constructor(
        curves?: THREE.CubicBezierCurve3[],
    ) {
        super()

        this.curves = [];
        this.points = [];
        if (curves && curves?.length !== 0) {
            curves.forEach(curve => {
                this.addCurve(curve)
            });
        }

    }
    // Method to add a new curve to the chain
    addCurve(curve: THREE.CubicBezierCurve3, numPoints = 50) {
        // Store the new curve
        this.curves.push(curve);

        // Generate points for the new curve and add to points array
        const newPoints = curve.getPoints(numPoints);
        this.points.push(...newPoints);

        // Update the geometry
        this.updateGeometry();
    }

    // Method to update the geometry after adding new points
    updateGeometry() {
        // Convert the array of Vector3 points into a Float32Array
        const positions = new Float32Array(this.points.length * 3); // each Vector3 has 3 components (x, y, z)

        this.points.forEach((point, i) => {
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
        });

        // Update the position attribute of the BufferGeometry
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Inform Three.js that the geometry needs to be updated
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeBoundingSphere(); // Optionally, update the bounding sphere
        // console.log(this.geometry)
    }
}