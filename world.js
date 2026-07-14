import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.islands = [];
        this.beds = {};
        this.generators = [];
        this.colliders = []; // Static colliders for base islands
        
        // Clean original assets materials - stylized low-poly
        this.materials = {
            blue: new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.8 }),
            red: new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.8 }),
            green: new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.8 }),
            yellow: new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.8 }),
            islandSoil: new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }),
            islandGrass: new THREE.MeshStandardMaterial({ color: 0x81c784, roughness: 0.9 }),
            resourceBase: new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.5 })
        };
    }

    buildMap() {
        // Construct 4 player base coordinates spaced dynamically
        const bases = [
            { team: 'blue', x: 0, z: 50 },
            { team: 'red', x: 0, z: -50 },
            { team: 'green', x: -50, z: 0 },
            { team: 'yellow', x: 50, z: 0 }
        ];

        bases.forEach(base => {
            this.createIsland(base.x, 5, base.z, 12, base.team);
            this.placeBed(base.x, 8.5, base.z + 5, base.team);
            this.placeGenerator(base.x, 8, base.z - 5, 'iron_gold');
        });

        // Center Island containing High Tier generators
        this.createIsland(0, 0, 0, 18, 'neutral');
        this.placeGenerator(0, 4, 3, 'emerald');
        this.placeGenerator(0, 4, -3, 'emerald');

        // Outer corner Diamond Islands
        this.createIsland(-35, 3, -35, 6, 'neutral');
        this.placeGenerator(-35, 6.2, -35, 'diamond');

        this.createIsland(35, 3, 35, 6, 'neutral');
        this.placeGenerator(35, 6.2, 35, 'diamond');
    }

    createIsland(x, y, z, radius, affiliation) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        // Base Layer (Dirt)
        const dirtGeo = new THREE.CylinderGeometry(radius, radius - 2, 4, 6);
        const dirtMesh = new THREE.Mesh(dirtGeo, this.materials.islandSoil);
        dirtMesh.receiveShadow = true;
        group.add(dirtMesh);

        // Top Grass Layer
        const grassGeo = new THREE.CylinderGeometry(radius + 0.2, radius, 1, 6);
        const grassMesh = new THREE.Mesh(grassGeo, 
            affiliation !== 'neutral' ? this.materials[affiliation] : this.materials.islandGrass
        );
        grassMesh.position.y = 2.5;
        grassMesh.receiveShadow = true;
        grassMesh.castShadow = true;
        group.add(grassMesh);

        this.scene.add(group);
        
        // Save bounds configuration for physical raycasting limits
        this.colliders.push({
            position: new THREE.Vector3(x, y + 2.5, z),
            radius: radius,
            topY: y + 3
        });
    }

    placeBed(x, y, z, team) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        // Unique low-poly Bed style (not copying block aesthetics)
        const frameGeo = new THREE.BoxGeometry(1.6, 0.4, 2.4);
        const frameMesh = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: 0x3e2723 }));
        group.add(frameMesh);

        const sheetGeo = new THREE.BoxGeometry(1.5, 0.45, 1.6);
        const sheetMesh = new THREE.Mesh(sheetGeo, this.materials[team]);
        sheetMesh.position.set(0, 0.1, -0.4);
        group.add(sheetMesh);

        const pillowGeo = new THREE.BoxGeometry(1.5, 0.5, 0.6);
        const pillowMesh = new THREE.Mesh(pillowGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
        pillowMesh.position.set(0, 0.15, 0.7);
        group.add(pillowMesh);

        this.scene.add(group);
        this.beds[team] = {
            mesh: group,
            alive: true,
            position: new THREE.Vector3(x, y, z)
        };
    }

    placeGenerator(x, y, z, type) {
        const gen = new THREE.Group();
        gen.position.set(x, y, z);

        const baseGeo = new THREE.OctahedronGeometry(1.2, 0);
        const baseMesh = new THREE.Mesh(baseGeo, this.materials.resourceBase);
        gen.add(baseMesh);

        // Floating floating indicator
        const jewelGeo = new THREE.ConeGeometry(0.4, 0.8, 4);
        let jewelColor = 0xffffff;
        if (type === 'diamond') jewelColor = 0x3498db;
        if (type === 'emerald') jewelColor = 0x2ecc71;
        if (type === 'iron_gold') jewelColor = 0xf1c40f;

        const jewelMat = new THREE.MeshStandardMaterial({ color: jewelColor, emissive: jewelColor, emissiveIntensity: 0.4 });
        const jewelMesh = new THREE.Mesh(jewelGeo, jewelMat);
        jewelMesh.position.y = 1.8;
        gen.add(jewelMesh);

        this.scene.add(gen);

        this.generators.push({
            type,
            mesh: gen,
            jewel: jewelMesh,
            position: new THREE.Vector3(x, y, z),
            spawnTimer: 0
        });
    }

    update(delta) {
        // Rotate the floating jewel models inside generators
        this.generators.forEach(gen => {
            gen.jewel.rotation.y += delta * 1.5;
            gen.jewel.position.y = 1.8 + Math.sin(Date.now() * 0.003) * 0.15;
            
            // Simple logic for ticking and resource item spawning goes here...
        });
    }

    checkCollision(position, radius = 0.8) {
        // Evaluate platform floors
        for (const island of this.colliders) {
            const distXZ = Math.hypot(position.x - island.position.x, position.z - island.position.z);
            if (distXZ < (island.radius + radius)) {
                // If the vertical alignment crosses our top plane
                if (position.y >= island.topY - 0.5 && position.y <= island.topY + 1.5) {
                    return { collision: true, surfaceY: island.topY };
                }
            }
        }
        return { collision: false, surfaceY: -999 };
    }
}
