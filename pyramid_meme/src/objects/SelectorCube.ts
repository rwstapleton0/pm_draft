import * as THREE from 'three';
import { EventBus } from '../engine/EventBus';
import { IRaycastData } from '../engine/CameraManager';


const originalPositions = [
    0,-5, 0, 0,-5,-5, 0,-5, 5,-5,-5, 0, 5,-5, 0,
     0, 0,-5, 0, 0, 5,-5, 0, 0, 5, 0, 0,
    0, 5, 0, 0, 5,-5, 0, 5, 5,-5, 5, 0, 5, 5, 0,
];

export class SelectorCube extends THREE.Object3D {
    
    private eventBus: EventBus = EventBus.getInstance();


    private particleSize: number = 1;

    private boxGeometry: THREE.BoxGeometry;
    private boxMaterial: THREE.MeshBasicMaterial;
    private boxMesh: THREE.Mesh;

    private edgeGeometry: THREE.EdgesGeometry;
    private edgeMaterial: THREE.LineBasicMaterial;
    private edgeLines: THREE.LineSegments;

    private partGeometry: THREE.BufferGeometry;
    private partMaterial: THREE.ShaderMaterial;
    public edgeIndicators: THREE.Points;

    private selectedIndex: number | null = null;

    constructor() {
        super()

        this.boxGeometry = new THREE.BoxGeometry( 10, 10, 10 );
        this.boxMaterial = new THREE.MeshBasicMaterial( { visible: false } );
        this.boxMesh = new THREE.Mesh( this.boxGeometry, this.boxMaterial );
        this.add(this.boxMesh)

        this.edgeGeometry = new THREE.EdgesGeometry(this.boxGeometry);
        this.edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
        this.edgeLines = new THREE.LineSegments(this.edgeGeometry, this.edgeMaterial);
        this.add(this.edgeLines)

        this.partGeometry = this.createPartGeometry(originalPositions);
        this.partMaterial = this.createPartMaterial();
        this.edgeIndicators = new THREE.Points( this.partGeometry, this.partMaterial );
        this.add(this.edgeIndicators);


        this.eventBus.on('pointerUp', ({ raycastData, isPress }) => this.onPointUpPart(raycastData, isPress))
           
        this.eventBus.on('moveSelector', ({ direction }) => this.onMoveSelector(direction))

    }

    onMoveSelector(direction: THREE.Vector3) {
        this.position.add(direction.clone().multiplyScalar(2));

        const fromDir = direction.clone().sub(direction.multiplyScalar(2));

        let foundIndex = -1;
        
        const positionAttribute = this.partGeometry.getAttribute('position');
        console.log(positionAttribute)

        for (let i = 0; i < positionAttribute.count; i++) {

            const vertexPosition = new THREE.Vector3(
                positionAttribute.getX(i),
                positionAttribute.getY(i),
                positionAttribute.getZ(i)
            );

            if (vertexPosition.equals(fromDir)) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex !== -1) {
            console.log('Vertex index found:', foundIndex);
        } else {
            console.log('Position not found in the geometry.');
        }

        this.handleHideParts(fromDir)
        const localPosition = this.handleSelectPart(foundIndex)!

        this.eventBus.emit('pointSelected', { centerPosition: this.position.clone(), localPosition })
    }

    onPointUpPart({ intersects, centerPosition }: IRaycastData, isPress: boolean ) {
        if (!isPress) return
        if (!intersects || intersects.length === 0) {
            // Reset the previously intersected particle if there's no intersection
            this.handleDeselectPart()
            return;
        }
    
        // If there is an intersection and it's a new particle
        const newIntersectedIndex = intersects[0].index;
        const localPosition = this.handleSelectPart(newIntersectedIndex!)!

        this.eventBus.emit('pointSelected', { centerPosition, localPosition })
    }

    handleHideParts(direction: THREE.Vector3) {

        const positionAttribute = this.partGeometry.getAttribute('position');
        console.log(positionAttribute)

        for (let i = 0; i < positionAttribute.count; i++) {

            if ((direction.x !== 0 && positionAttribute.getX(i) === direction.x) || 
            (direction.y !== 0 && positionAttribute.getY(i) === direction.y) ||
            (direction.z !== 0 && positionAttribute.getZ(i) === direction.z)) {
                positionAttribute.setXYZ(i, NaN, NaN, NaN)
            } else if (positionAttribute.setX(i, NaN)) {
                positionAttribute.setXYZ(
                    i,
                    originalPositions[i * 3],
                    originalPositions[i * 3 + 1],
                    originalPositions[i * 3 + 2]
                )
            }
        }

        positionAttribute.needsUpdate = true;
    }

    restoreHiddenVertices() {
        const positionAttribute = this.partGeometry.getAttribute('position');

        // Restore hidden vertices from the original positions array
        for (let i = 0; i < positionAttribute.count; i += 3) {
            if (isNaN(originalPositions[i])) {
                positionAttribute.setXYZ(
                    i, 
                    originalPositions[i],
                    originalPositions[i + 1],
                    originalPositions[i + 2]
                )
            }
        }

        // Notify Three.js that the position buffer has been updated
        positionAttribute.needsUpdate = true;
    }

    handleSelectPart(newIndex: number): THREE.Vector3 | undefined {
        if (this.selectedIndex === newIndex) return
        // Reset the previously intersected particle if it exists
        if (this.selectedIndex !== null) {
            this.partGeometry.attributes.size.array[this.selectedIndex] = this.particleSize;  // Reset size to default
        }
        const positionAttr = this.partGeometry.getAttribute('position')
        if (Number.isNaN(positionAttr.getX(newIndex))) {
            positionAttr.setXYZ(
                newIndex, 
                originalPositions[newIndex * 3],
                originalPositions[newIndex * 3 + 1],
                originalPositions[newIndex * 3 + 2]
            )
        }

        // Set the new intersected particle size to be larger
        this.selectedIndex = newIndex!;
        this.partGeometry.attributes.size.array[this.selectedIndex] = this.particleSize * 5;  // Increase size
        this.partGeometry.attributes.size.needsUpdate = true;

        // Get local position of point from buffer geometry positions attr.
        let positionVec = []
        for ( let i = 0; i < 3; i ++ ) {
            positionVec.push(this.partGeometry.attributes.position.array[this.selectedIndex * 3 + i])
        }
        return new THREE.Vector3(...positionVec);
    }

    handleDeselectPart() {
        if (this.selectedIndex !== null) {
            this.partGeometry.attributes.size.array[this.selectedIndex] = this.particleSize;  // Reset size to default
            this.partGeometry.attributes.size.needsUpdate = true;
            this.selectedIndex = null;
        }
    }

    createPartMaterial(): THREE.ShaderMaterial {

        return new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0xffffff) },
                pointTexture: { value: new THREE.TextureLoader().load( 'textures/sprites/disc.png' ) },
                alphaTest: { value: 0.9 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 customColor;
        
                varying vec3 vColor;
        
                void main() {
        
                    vColor = customColor;
        
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_PointSize = clamp(gl_PointSize, 10.0, 64.0);

                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform sampler2D pointTexture;
                uniform float alphaTest;
                
                varying vec3 vColor;

                void main() {
                    gl_FragColor = vec4( color * vColor, 1.0);  // Multiply uniform color with varying color

                    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );

                    if ( gl_FragColor.a < alphaTest ) discard;
                }
            `,
            // transparent: true,
        });
    }

    createPartGeometry(partPositions: number[]): THREE.BufferGeometry {

        const colors: any[] = [];
        const sizes: any[] = [];

        const color = new THREE.Color();

        for ( let i = 0, l = partPositions.length; i < l; i ++ ) {

            color.setHSL( 0.3, 1.0, 0.5 );
            color.toArray( colors, i * 3 );

            sizes[ i ] = this.particleSize;

        }

        const partGeometry = new THREE.BufferGeometry();
        partGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute(partPositions, 3) );
        partGeometry.setAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
        partGeometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) );
        return partGeometry
    }

}
