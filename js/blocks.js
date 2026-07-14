import * as THREE from 'three';

export class BlockEngine {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.gridSize = 1;
        this.placedBlocks = {}; // Map storage "x_y_z" -> mesh
        
        this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.blockMaterial = new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.8 });
    }

    snapToGrid(val) {
        return Math.round(val / this.gridSize) * this.gridSize;
    }

    getKey(x, y, z) {
        return `${this.snapToGrid(x)}_${this.snapToGrid(y)}_${this.snapToGrid(z)}`;
    }

    placeBlock(x, y, z, colorHex = 0xd5dbdb) {
        const key = this.getKey(x, y, z);
        if (this.placedBlocks[key]) return false; // Slot occupied

        // Check distance to critical objects like beds to prevent trap farming
        for (const team in this.world.beds) {
            const bedPos = this.world.beds[team].position;
            if (bedPos.distanceTo(new THREE.Vector3(x, y, z)) < 1.8 && team === 'blue') {
                // Keep team spawns completely clear
                return false; 
            }
        }

        const customMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.8 });
        const blockMesh = new THREE.Mesh(this.blockGeometry, customMat);
        blockMesh.position.set(this.snapToGrid(x), this.snapToGrid(y), this.snapToGrid(z));
        blockMesh.castShadow = true;
        blockMesh.receiveShadow = true;

        this.scene.add(blockMesh);
        this.placedBlocks[key] = blockMesh;
        return true;
    }

    breakBlock(x, y, z) {
        const key = this.getKey(x, y, z);
        const mesh = this.placedBlocks[key];
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            delete this.placedBlocks[key];
            return true;
        }
        return false;
    }

    checkBlockCollision(pos, radius = 0.6) {
        const gridX = this.snapToGrid(pos.x);
        const gridY = this.snapToGrid(pos.y - 0.5); // Check beneath feet
        const gridZ = this.snapToGrid(pos.z);

        const key = `${gridX}_${gridY}_${gridZ}`;
        if (this.placedBlocks[key]) {
            return { collision: true, surfaceY: gridY + 0.5 };
        }
        return { collision: false, surfaceY: -999 };
    }
}
