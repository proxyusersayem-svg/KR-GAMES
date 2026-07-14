import * as THREE from 'three';

export class Player {
    constructor(camera, domElement, world, blockEngine) {
        this.camera = camera;
        this.domElement = domElement;
        this.world = world;
        this.blockEngine = blockEngine;

        this.mesh = new THREE.Group();
        this.position = this.mesh.position;
        
        this.velocity = new THREE.Vector3();
        this.isGrounded = false;
        
        // Physics dimensions
        this.height = 1.8;
        this.radius = 0.5;
        this.speed = 6.0;
        this.jumpForce = 8.0;

        // Input Setup
        this.moveDirection = { forward: false, backward: false, left: false, right: false };
        this.mouseMove = { x: 0, y: 0 };
        this.pitch = 0;
        this.yaw = 0;

        this.setupPointerLock();
        this.setupKeyboard();
    }

    setupPointerLock() {
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement !== this.domElement) return;

            const sensitivity = 0.002;
            this.yaw -= e.movementX * sensitivity;
            this.pitch -= e.movementY * sensitivity;

            // Clamp vertical camera look limits
            this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));

            this.camera.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
            this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        });
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW': this.moveDirection.forward = true; break;
                case 'KeyS': this.moveDirection.backward = true; break;
                case 'KeyA': this.moveDirection.left = true; break;
                case 'KeyD': this.moveDirection.right = true; break;
                case 'Space': 
                    if (this.isGrounded) {
                        this.velocity.y = this.jumpForce;
                        this.isGrounded = false;
                    }
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW': this.moveDirection.forward = false; break;
                case 'KeyS': this.moveDirection.backward = false; break;
                case 'KeyA': this.moveDirection.left = false; break;
                case 'KeyD': this.moveDirection.right = false; break;
            }
        });
    }

    update(delta) {
        // Apply Gravity
        this.velocity.y -= 22.0 * delta; // Gravity rate acceleration

        // Movement Calculations
        const moveVector = new THREE.Vector3();
        if (this.moveDirection.forward) moveVector.z -= 1;
        if (this.moveDirection.backward) moveVector.z += 1;
        if (this.moveDirection.left) moveVector.x -= 1;
        if (this.moveDirection.right) moveVector.x += 1;
        moveVector.normalize();

        // Direction offset relative to visual yaw angle
        const actualMove = moveVector.clone().applyQuaternion(this.mesh.quaternion);
        
        this.position.x += actualMove.x * this.speed * delta;
        this.position.z += actualMove.z * this.speed * delta;
        this.position.y += this.velocity.y * delta;

        // Collision Checks (Base islands and voxels)
        this.isGrounded = false;
        
        // Static Map ground bounds collision
        const mapCollision = this.world.checkCollision(this.position, this.radius);
        if (mapCollision.collision && this.velocity.y <= 0) {
            this.position.y = mapCollision.surfaceY;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // Check custom placed bridge blocks
        const blockCollision = this.blockEngine.checkBlockCollision(this.position, this.radius);
        if (blockCollision.collision && this.velocity.y <= 0) {
            this.position.y = blockCollision.surfaceY;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // Void Boundary Respawn Logic
        if (this.position.y < -15) {
            this.respawn();
        }

        // Bind camera offset directly inside body container
        this.camera.position.copy(this.position);
        this.camera.position.y += this.height - 0.2;
    }

    respawn() {
        this.position.set(0, 12, 45); // Return to blue team sanctuary node
        this.velocity.set(0,0,0);
    }

    dispose() {
        // Clean listeners safely on exit
    }
}
