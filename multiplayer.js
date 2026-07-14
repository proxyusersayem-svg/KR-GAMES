import * as THREE from 'three';

export class MultiplayerController {
    constructor(networkClient, scene) {
        this.network = networkClient;
        this.scene = scene;
        this.peers = {}; // peerId -> Mesh objects
        this.setupNetworkCallbacks();
    }

    setupNetworkCallbacks() {
        this.network.onSyncEvent = (type, payload) => {
            switch (type) {
                case 'peer_update':
                    this.syncPeer(payload);
                    break;
                case 'player_left':
                    this.removePeer(payload.playerId);
                    break;
            }
        };
    }

    syncPeer(data) {
        const id = data.id;
        if (!this.peers[id]) {
            // Generate low-poly surrogate mesh for foreign player joins
            const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 6);
            const mat = new THREE.MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.9 });
            const mesh = new THREE.Mesh(geo, mat);
            this.scene.add(mesh);
            this.peers[id] = mesh;
        }

        // Interpolate foreign peer coordinates directly
        const targetMesh = this.peers[id];
        targetMesh.position.copy(data.position);
        targetMesh.rotation.y = data.rotation;
    }

    removePeer(id) {
        if (this.peers[id]) {
            this.scene.remove(this.peers[id]);
            delete this.peers[id];
        }
    }

    broadcastLocalState(position, rotation) {
        this.network.send('peer_sync', {
            roomId: this.network.roomId,
            position: { x: position.x, y: position.y, z: position.z },
            rotation: rotation
        });
    }
}
