import * as THREE from 'three';


// THREE.js Setup
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ball Setup
let geometry = new THREE.SphereGeometry(1, 32, 32);
let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
let ball = new THREE.Mesh(geometry, material);
scene.add(ball);

// Camera Position
camera.position.z = 20;

// Variables for ball movement
let initialY = 10;
let y = initialY;
let v = 0; // Initial velocity
let g = -9.8; // Gravity
let time = 0;
let bezierMode = false;
let t = 0; // For Bezier parameter

// Bezier curve control points
let p0 = new THREE.Vector3(0, 0, 0);
let p1 = new THREE.Vector3(5, 5, 0);
let p2 = new THREE.Vector3(10, 5, 0);
let p3 = new THREE.Vector3(15, 0, 0);

// Draw the Bezier Curve using a line
let curvePoints = [];
let numSegments = 100; // Number of segments for the curve line
for (let i = 0; i <= numSegments; i++) {
    let t = i / numSegments;
    let x = cubicBezier(p0.x, p1.x, p2.x, p3.x, t);
    let y = cubicBezier(p0.y, p1.y, p2.y, p3.y, t);
    curvePoints.push(new THREE.Vector3(x, y, 0));
}
let curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
let curveMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
let curveLine = new THREE.Line(curveGeometry, curveMaterial);
scene.add(curveLine);

// Visualizing velocity at different timesteps
let velocityMarkers = [];
function addVelocityMarker(position: any, velocity: number) {
    let markerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    let markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(position);
    
    // Scale marker by velocity for visual effect
    let scale = Math.abs(velocity) * 0.1; // Adjust scale factor as needed
    marker.scale.set(scale, scale, scale);
    
    scene.add(marker);
    velocityMarkers.push(marker);
}

function animate() {
    requestAnimationFrame(animate);

    if (!bezierMode) {
        // Free fall simulation
        time += 0.016; // Simulating ~60fps
        v += g * 0.016; // v = u + g * t
        y += v * 0.016; // y = y + v * t
        
        ball.position.y = y;
        
        // When ball reaches ground (y = 0), switch to Bezier motion
        if (y <= 0) {
            bezierMode = true;
            v = Math.abs(v); // Capture velocity at impact for momentum conservation
            t = 0; // Initialize bezier t parameter
        }
    } else {
        // Bezier Curve simulation
        t += v * 0.0002; // The speed depends on previous velocity (adjust scale)
        if (t > 1) t = 1; // Ensure t stays within bounds

        let bezierPoint = new THREE.Vector3();
        bezierPoint.x = cubicBezier(p0.x, p1.x, p2.x, p3.x, t);
        bezierPoint.y = cubicBezier(p0.y, p1.y, p2.y, p3.y, t);

        ball.position.set(bezierPoint.x, bezierPoint.y, bezierPoint.z);

        // Add velocity markers along the path (every few frames for clarity)
        if (t <= 1 && Math.floor(t * 100) % 5 === 0) {
            addVelocityMarker(bezierPoint, v);
        }
    }

    renderer.render(scene, camera);
}

// Bezier cubic calculation
function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number) {
    let oneMinusT = 1 - t;
    return oneMinusT * oneMinusT * oneMinusT * p0 + 
           3 * oneMinusT * oneMinusT * t * p1 + 
           3 * oneMinusT * t * t * p2 + 
           t * t * t * p3;
}

animate();









// function plotPathAdvanced() {
//     // Constants for the simulation
//     const g = 9.8; // Gravity (m/s^2)
//     const mu = 0.05; // Coefficient of friction
//     const Cd = 0.47; // Drag coefficient (for a sphere)
//     const rho = 1.22; // Air density (kg/m^3)
//     const A = 0.05; // Cross-sectional area of the ball (m^2)
//     const mass = 0.5; // Mass of the ball (kg)
//     const timeStep = 0.05; // Time increment for plotting the path (seconds)
//     const totalTime = 5; // Total time to simulate (seconds)

//     // Initial conditions
//     let x0 = 0; // Initial X position
//     let y0 = 40; // Initial Y position (height of the ledge)
//     let vx = 5; // Initial horizontal velocity (m/s)
//     let vy = -5; // Initial vertical velocity

//     // Create the geometry to hold the points of the path
//     const points = [];

//     // Previous position for distance calculation
//     let prevX = x0;
//     let prevY = y0;
//     const markers = new THREE.Group();

//     for (let t = 0; t < totalTime; t += timeStep) {
//         // Calculate the friction and drag effects
//         const frictionForce = mu * mass * g;
//         const dragForceX = 0.5 * Cd * rho * A * vx * vx;
//         const dragForceY = 0.5 * Cd * rho * A * vy * vy;

//         // Update velocities with friction and drag
//         vx -= (frictionForce / mass) * timeStep; // Friction slows horizontal velocity
//         vx -= (dragForceX / mass) * timeStep;    // Air resistance slows horizontal velocity
//         vy -= (dragForceY / mass) * timeStep;    // Air resistance slows vertical velocity

//         // Apply gravity to vertical velocity
//         vy -= g * timeStep;

//         // Update position based on velocities
//         x0 += vx * timeStep;
//         y0 += vy * timeStep;

//         // Stop if the ball hits the ground (y <= 0)
//         if (y0 < 0) break;

//         const distance = Math.sqrt((x0 - prevX) ** 2 + (y0 - prevY) ** 2);

//         // Add the new position to the points array
//         points.push(new THREE.Vector3(x0, y0, 0));

//         // Create a small sphere at the current position to visualize the distance
//         const sphereGeometry = new THREE.SphereGeometry(0.05, 8, 8);
//         const sphereMaterial = new THREE.MeshBasicMaterial({
//             color: new THREE.Color(1 - distance / 10, 0, distance / 10), // Color based on distance
//         });
//         const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

//         // Position the sphere at the current position
//         sphere.position.set(x0, y0, 0);
//         markers.add(sphere);
//         // Update the previous position for the next iteration
//         prevX = x0;
//         prevY = y0;

//     }

//     // Create a line from the points
//     const geometry = new THREE.BufferGeometry().setFromPoints(points);
//     const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
//     const line = new THREE.Line(geometry, material)

//     return {line, markers};
// }

function plotPathAdvanced() {
    // Constants for the simulation
    const g = 9.8; // Gravity (m/s^2)
    const mu = 0.05; // Coefficient of friction
    const Cd = 0.47; // Drag coefficient (for a sphere)
    const rho = 1.22; // Air density (kg/m^3)
    const A = 0.05; // Cross-sectional area of the ball (m^2)
    const mass = 0.5; // Mass of the ball (kg)
    const timeStep = 0.05; // Time increment for plotting the path (seconds)
    const totalTime = 5; // Total time to simulate (seconds)
    
    // Initial conditions
    let x0 = 0; // Initial X position
    let y0 = 40; // Initial Y position (height of the ledge)
    let vx = 5; // Initial horizontal velocity (m/s)
    let vy = -5; // Initial vertical velocity
    
    // Create the geometry to hold the points of the path
    const points = [];
    
    // Previous position for distance calculation
    let prevX = x0;
    let prevY = y0;
    const markers = new THREE.Group();
    
    // Define the Bezier curve (semi-circle for example)
    const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(6.7, 10, 0),  // Start point of the curve
        new THREE.Vector3(15, 5, 0),  // Control point of the curve
        new THREE.Vector3(20, 10, 0)   // End point of the curve
    );

    // Flags to handle the state of the ball
    let caughtByCurve = false;  // Flag to know when the ball is on the curve
    let tOnCurve = 0;  // Parameter `t` to move along the curve

    for (let t = 0; t < totalTime; t += timeStep) {
        // Check if the ball is close to the Bezier curve
        if (!caughtByCurve) {
            // Regular physics calculation
            const frictionForce = mu * mass * g;
            const dragForceX = 0.5 * Cd * rho * A * vx * vx;
            const dragForceY = 0.5 * Cd * rho * A * vy * vy;
            
            // Update velocities with friction and drag
            vx -= (frictionForce / mass) * timeStep; // Friction slows horizontal velocity
            vx -= (dragForceX / mass) * timeStep;    // Air resistance slows horizontal velocity
            vy -= (dragForceY / mass) * timeStep;    // Air resistance slows vertical velocity
            
            // Apply gravity to vertical velocity
            vy -= g * timeStep;
            
            // Update position based on velocities
            x0 += vx * timeStep;
            y0 += vy * timeStep;
            
            // Stop if the ball hits the ground (y <= 0)
            if (y0 < 0) break;
            
            const distance = Math.sqrt((x0 - prevX) ** 2 + (y0 - prevY) ** 2);
            
            // Add the new position to the points array
            points.push(new THREE.Vector3(x0, y0, 0));

            // console.log(x0,y0)
            
            // Create a small sphere at the current position to visualize the distance
            const sphereGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(1 - distance / 10, 0, distance / 10), // Color based on distance
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(x0, y0, 0);
            markers.add(sphere);

            // Check for intersection with the curve (within a threshold)
            const curveStart = curve.getPointAt(0);
            const curveEnd = curve.getPointAt(1);
            if (x0 > curveStart.x && x0 < curveEnd.x && y0 < curveStart.y + 1 && y0 > curveEnd.y - 1) {
                // The ball has intersected the curve
                caughtByCurve = true;
                tOnCurve = 0;  // Start moving the ball along the curve
            }

            // Update the previous position for the next iteration
            prevX = x0;
            prevY = y0;

        } else {
            // Ball is now on the curve; move it along the curve
            tOnCurve += timeStep * 0.2;  // Adjust speed along the curve

            if (tOnCurve >= 1) {
                // Ball has reached the end of the curve, fling it off
                caughtByCurve = false;

                // Get the tangent of the curve at the end point to determine the fling direction
                const tangent = curve.getTangentAt(1).normalize();
                vx = tangent.x * 10;  // Give a new horizontal velocity
                vy = tangent.y * 10;  // Give a new vertical velocity

                // Update positions to the end of the curve
                const curveEnd = curve.getPointAt(1);
                x0 = curveEnd.x;
                y0 = curveEnd.y;

            } else {
                // Move the ball along the Bezier curve
                const newPosition = curve.getPointAt(tOnCurve);
                x0 = newPosition.x;
                y0 = newPosition.y;

                // Add the position to the points array
                points.push(new THREE.Vector3(x0, y0, 0));
                
                // Add a marker for visualization
                const sphereGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.set(x0, y0, 0);
                markers.add(sphere);
            }
        }
    }

    // Create a line from the points
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const line = new THREE.Line(geometry, material);

    return { line, markers };
}





function mapCurve() {

    // Define the Bezier curve (semi-circle for example)
    const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(6.4, 12, 0),  // Start point of the curve
        new THREE.Vector3(6.4, 4, 0),  // Start point of the curve
        new THREE.Vector3(17.6, 4, 0),  // Control point of the curve
        new THREE.Vector3(17.6, 12, 0)   // End point of the curve
    );

    console.log(curve)

    const points = curve.getPoints(50)

    console.log(points)

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    return new THREE.Line(geometry, material)
    
}