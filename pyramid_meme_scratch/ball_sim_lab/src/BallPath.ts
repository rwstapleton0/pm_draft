import * as THREE from 'three';
import { Map } from './Map'

const g = 9.8; // Gravity (m/s^2)
const mu = 0.05; // Coefficient of friction
const Cd = 0.47; // Drag coefficient (for a sphere)
const rho = 1.22; // Air density (kg/m^3)
const A = 0.05; // Cross-sectional area of the ball (m^2)
const mass = 0.5; // Mass of the ball (kg)
const timeStep = 0.05; // Time increment for plotting the path (seconds)
const totalTime = 5; // Total time to simulate (seconds)


// Define the control points of the cubic Bezier curve
// const P0 = new THREE.Vector2(7, 23);
// const P1 = new THREE.Vector2(10, 13);
// const P2 = new THREE.Vector2(20, 13);
// const P3 = new THREE.Vector2(23,16);

type MapObject = {
    type: 'line' | 'bezierCurve',
    points: THREE.Vector3[]
}

export class BallPath extends THREE.Line {

    private points: THREE.Vector3[] = [];
    private pointsGeometry = new THREE.BufferGeometry();

    private lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    private pointMaterial = new THREE.PointsMaterial({ size: .2, color: 0x00ff00 });
    private pointMarkers: THREE.Points = new THREE.Points();

    private mapMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

    private currentCurve: MapObject | null = null;  // Track the current curve
    private currentCurveT = 0;
    private rollingOnCurve = false;

    private interactionObjects: MapObject[] = [];

    private thresholdDistance: number = 1
    private bounceThresholdAngle: number = 10

    constructor() {
        super()

        // this.addStraight([
        //     new THREE.Vector3(5, 30, 0),
        //     new THREE.Vector3(10, 25, 0)
        // ])

        this.addBezier([
            new THREE.Vector3(5, 30, 0),
            new THREE.Vector3(5, 30, 0),
            new THREE.Vector3(10, 25, 0),
            new THREE.Vector3(10, 25, 0)
        ])

        // this.addBezier([
        //     new THREE.Vector3(26, 14, 0),  // Start point
        //     new THREE.Vector3(26, 10, 0), // Control point 1
        //     new THREE.Vector3(20, 6, 0), // Control point 2
        //     new THREE.Vector3(16, 8, 0)
        // ])

        // this.addStraight([
        //     new THREE.Vector3(15, 15, 0),
        //     new THREE.Vector3(5, 5, 0)
        // ])

        this.runSimulation()

        // Create a line from the points
        this.pointsGeometry = new THREE.BufferGeometry().setFromPoints(this.points);
        this.geometry = this.pointsGeometry;
        this.material = this.lineMaterial

        this.pointMarkers.geometry = this.pointsGeometry
        this.pointMarkers.material = this.pointMaterial
        this.add(this.pointMarkers)

    }

    addBezier(points: THREE.Vector3[]) {
        const curve = new THREE.CubicBezierCurve3(...points).getPoints(50)
        const geometry = new THREE.BufferGeometry().setFromPoints(curve);
        this.add(new THREE.Line(geometry, this.mapMaterial))
        this.interactionObjects.push({ type: 'bezierCurve', points: points})
    }

    addStraight(points: THREE.Vector3[]) {
        const geometry = new THREE.BufferGeometry().setFromPoints([...points]);
        const line = new THREE.Line(geometry, this.mapMaterial);
        this.add(line)
        this.interactionObjects.push({ type: 'line', points: points})
    }

    runSimulation() {
        // Initial conditions
        let x0 = 0; // Initial X position
        let y0 = 40; // Initial Y position (height of the ledge)
        let vx = 5; // Initial horizontal velocity (m/s)
        let vy = 2; // Initial vertical velocity

        let rollingOnCurve = false;
        let t = 0; // Parameter for the curve (used when the ball starts rolling on the curve)
        const exitSpeedFactor = .7
        for (let time = 0; time < totalTime; time += timeStep) {
            if (rollingOnCurve) {
                const bezierObj = this.currentCurve
                // Calculate the current position on the curve using the parameter t
                const { x, y } = this.getPointOnCurve(bezierObj!.points, this.currentCurveT);

                // Update the ball's position to the curve's point
                x0 = x;
                y0 = y;

                // Increase the parameter t based on the ball's velocity
                const curveTangent = this.getCurveTangent(bezierObj!.points, this.currentCurveT); // Get the tangent vector at P(t)
                const speed = Math.sqrt(vx * vx + vy * vy); // Ball's speed
                this.currentCurveT += (speed * timeStep) / Math.sqrt(curveTangent.x * curveTangent.x + curveTangent.y * curveTangent.y);

                // Stop rolling when t exceeds the curve parameter range
                if (this.currentCurveT >= 1) {
                    rollingOnCurve = false;
                    // Calculate the tangent at the end of the curve
                    const endTangent = this.getCurveTangent(bezierObj!.points, 1);

                    // Normalize the tangent vector to get the direction
                    const tangentDirection = endTangent.clone().normalize();

                    // Update the ball's velocity based on the direction of the tangent
                    vx = tangentDirection.x * speed * exitSpeedFactor;
                    vy = tangentDirection.y * speed * exitSpeedFactor;
                }
            } else {
                // Normal motion
                const prevX = x0;
                const prevY = y0;

                // Calculate the friction and drag effects
                const frictionForce = (vx !== 0) ? mu * mass * g : 0;
                const dragForceX = (vx !== 0) ? 0.5 * Cd * rho * A * vx * vx : 0;
                const dragForceY = (vy !== 0) ? 0.5 * Cd * rho * A * vy * vy : 0;

                // Update velocities with friction and drag
                vx -= (frictionForce / mass) * timeStep;
                vx -= (dragForceX / mass) * timeStep;
                vy -= (dragForceY / mass) * timeStep;
                vy -= g * timeStep;

                // Predict the new position based on updated velocities
                x0 += vx * timeStep;
                y0 += vy * timeStep;

                for (const obj of this.interactionObjects) {
                    if (obj.type === 'line') {
                        // Check if the ball collides with the line
                        const collisionData = this.checkCollisionWithLine(prevX, prevY, x0, y0, obj.points[0]!, obj.points[1]!);
                        
                        if (collisionData && collisionData!.collided) {
                            const impactAngle = this.calculateImpactAngle(vx, vy, collisionData!.lineNormal);

                            if (impactAngle >= this.bounceThresholdAngle) {
                                // Move the ball to the intersection point
                                x0 = collisionData.intersectionPoint.x;
                                y0 = collisionData.intersectionPoint.y;
                                // Bounce off the line
                                const newVelocity = this.calculateBounceVelocity(vx, vy, collisionData!.lineNormal);
                                vx = newVelocity.vx;
                                vy = newVelocity.vy;

                                 // Recalculate the remaining time step after the bounce
                                const remainingTime = timeStep - collisionData.timeFraction * timeStep;

                                // Update position based on the reflected velocity for the remaining time
                                x0 += vx * remainingTime;
                                y0 += vy * remainingTime;
                            } 
                            // else {
                            //     // Roll along the curve
                            //     const closestPoint = this.getClosestPointOnCurve(obj.controlPoints!, x0, y0);
                            //     x0 = closestPoint.point.x;
                            //     y0 = closestPoint.point.y;

                            //     t = closestPoint.t;
                            //     rollingOnCurve = true;
                            // }
                        }
                    } else 
                    if (obj.type === 'bezierCurve') {
                        const closestPoint = this.getClosestPointOnCurve(obj.points!, x0, y0);
                        
                        if (this.getDistanceToCurve(obj.points!, x0, y0) <= this.thresholdDistance) {
                            console.log('here')
                            x0 = closestPoint.point.x;
                            y0 = closestPoint.point.y;
                            this.currentCurve = obj;     // Set the current curve
                            this.currentCurveT = closestPoint.t;
                            break;
                        }
                    }
                }
            }

            // console.log(x0, y0)

            // Stop if the ball hits the ground (y <= 0)
            if (y0 < 0) break;

            // Add the new position to the points array
            this.points.push(new THREE.Vector3(x0, y0, 0));
        }
    }

    getCurrentCurve() {
        return this.currentCurve;  // Return the currently tracked curve
    }

    // Function to check and calculate the intersection point between two line segments
    checkCollisionWithLine(prevX: number, prevY: number, x0: number, y0: number, p1: THREE.Vector3, p2: THREE.Vector3) {
        // Calculate direction vectors
        const d1x = x0 - prevX;
        const d1y = y0 - prevY;
        const d2x = p2.x - p1.x;
        const d2y = p2.y - p1.y;

        const denominator = d1x * d2y - d1y * d2x;

        // If denominator is zero, the lines are parallel
        if (denominator === 0) {
            return null;
        }


        const t = ((p1.x - prevX) * d2y - (p1.y - prevY) * d2x) / denominator;
        const u = ((p1.x - prevX) * d1y - (p1.y - prevY) * d1x) / denominator;

        // Check if t and u are between 0 and 1 (line segments intersect)
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            // Calculate the exact intersection point
            const intersectionX = prevX + t * d1x;
            const intersectionY = prevY + t * d1y;

            // Calculate the normal vector of the line (perpendicular to the line direction)
            // For a 2D line, the normal can be computed as (-dy, dx)
            const lineDirX = p2.x - p1.x;
            const lineDirY = p2.y - p1.y;
            const normalX = -lineDirY; // Perpendicular to the line's direction
            const normalY = lineDirX;

            // Normalize the normal vector to make it a unit vector
            const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
            const normalVec = new THREE.Vector3(
                normalX / normalLength,
                normalY / normalLength,
                0
            )

            return {
                collided: true,
                intersectionPoint: { x: intersectionX, y: intersectionY },
                lineNormal: normalVec,
                timeFraction: t // Fraction of the timestep when the collision occurred
            };
        }

        return null;
    }

    // Function to calculate the angle of impact between velocity vector and line's normal
    calculateImpactAngle(vx: number, vy: number, lineNormal: THREE.Vector3) {
        const velocity = new THREE.Vector2(vx, vy).normalize();
        const normal = new THREE.Vector2(lineNormal.x, lineNormal.y).normalize();

        const dotProduct = velocity.dot(normal);
        const angle = Math.acos(dotProduct); // Angle in radians

        return THREE.MathUtils.radToDeg(angle); // Convert to degrees for threshold comparison
    }

    // Function to calculate the new velocity after bounce
    calculateBounceVelocity(vx: number, vy: number, lineNormal: THREE.Vector3) {
        const velocity = new THREE.Vector3(vx, vy);
        const normal = new THREE.Vector3(lineNormal.x, lineNormal.y);

        // Reflect the velocity over the line normal
        const reflectedVelocity = velocity.reflect(normal);

        return { vx: reflectedVelocity.x, vy: reflectedVelocity.y };
    }

    // Function to calculate a point on the Bezier curve using parameter t
    getPointOnCurve(controlPoints: THREE.Vector3[], t: number) {
        const [P0, P1, P2, P3] = controlPoints;
        const x = (1 - t) ** 3 * P0.x + 3 * (1 - t) ** 2 * t * P1.x + 3 * (1 - t) * t ** 2 * P2.x + t ** 3 * P3.x;
        const y = (1 - t) ** 3 * P0.y + 3 * (1 - t) ** 2 * t * P1.y + 3 * (1 - t) * t ** 2 * P2.y + t ** 3 * P3.y;
        return { x, y };
    }

    // Function to calculate the tangent vector on the curve at parameter t
    getCurveTangent(controlPoints: THREE.Vector3[], t: number) {
        const [P0, P1, P2, P3] = controlPoints;
        const dx = -3 * (1 - t) ** 2 * P0.x + 3 * (1 - t) ** 2 * P1.x - 6 * (1 - t) * t * P1.x + 6 * (1 - t) * t * P2.x - 3 * t ** 2 * P2.x + 3 * t ** 2 * P3.x;
        const dy = -3 * (1 - t) ** 2 * P0.y + 3 * (1 - t) ** 2 * P1.y - 6 * (1 - t) * t * P1.y + 6 * (1 - t) * t * P2.y - 3 * t ** 2 * P2.y + 3 * t ** 2 * P3.y;
        return new THREE.Vector2(dx, dy);
    }
    // Function to calculate the distance from the ball to the curve
    getDistanceToCurve(controlPoints: THREE.Vector3[], x: number, y: number) {
        const closestPointData = this.getClosestPointOnCurve(controlPoints, x, y);
        const closestPoint = closestPointData.point;
        const distance = Math.sqrt((closestPoint.x - x) ** 2 + (closestPoint.y - y) ** 2);
        return distance;
    }

    // Function to get the closest point on the curve to a given position (x, y)
    getClosestPointOnCurve(controlPoints: THREE.Vector3[], x: number, y: number) {
        let closestT = 0;
        let closestDistance = Infinity;
        let closestPoint = { x: 0, y: 0 };

        // Divide the parameter t into small intervals to find the closest point
        const steps = 100; // Number of steps for evaluation, increase for more precision
        for (let i = 0; i <= steps; i++) {
            const t = i / steps; // Evaluate t from 0 to 1

            // Get the point on the curve for this t
            const pointOnCurve = this.getPointOnCurve(controlPoints, t);

            // Calculate the distance to the ball's current position
            const distance = Math.sqrt((pointOnCurve.x - x) ** 2 + (pointOnCurve.y - y) ** 2);

            // If this point is closer than the previous ones, update the closest point
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = pointOnCurve;
                closestT = t;
            }
        }

        // Return both the closest point and the parameter t corresponding to that point
        return { point: closestPoint, t: closestT };
    }

    //         const intersection = this.getIntersectionPoint(prevX, prevY, x0, y0, linePoint1, linePoint2);


    //         if (intersection) {
    //             // Move the ball to the intersection point
    //             x0 = intersection.x;
    //             y0 = intersection.y;

    //             // Calculate the normal vector of the line
    //             const normalX = linePoint2.y - linePoint1.y;
    //             const normalY = linePoint1.x - linePoint2.x;

    //             // Reflect the velocity
    //             const reflectedVelocity = this.reflectVector(vx, vy, normalX, normalY);
    //             vx = reflectedVelocity.vx;
    //             vy = reflectedVelocity.vy;

    //             // Recalculate the remaining time step after the bounce
    //             const remainingTime = timeStep - intersection.timeFraction * timeStep;

    //             // Update position based on the reflected velocity for the remaining time
    //             x0 += vx * remainingTime;
    //             y0 += vy * remainingTime;
    //         }
}