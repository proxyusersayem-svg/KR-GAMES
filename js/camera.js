import * as THREE from 'three';

export class CameraRig {
    constructor(camera) {
        this.camera = camera;
        this.offset = new THREE.Vector3(0, 1.6, 0); // Position at player head level
        this.target = new THREE.Vector3();
    }

    update(position, yaw, pitch) {
        // Adjust the camera position directly to align with the player entity core
        this.camera.position.copy(position).add(this.offset);

        // Compute direct target gaze vector based on mouse angle states
        const lookDir = new THREE.Vector3(0, 0, -1);
        lookDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
        lookDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

        this.target.copy(this.camera.position).add(lookDir);
        this.camera.lookAt(this.target);
    }
}
