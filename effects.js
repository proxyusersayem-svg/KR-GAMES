import * as THREE from 'three';

export class EffectEngine {
    constructor(scene) {
        this.scene = scene;
        this.activeParticles = [];
    }

    spawnSparks(position, colorHex) {
        const count = 12;
        const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: colorHex });

        const group = new THREE.Group();
        for (let i = 0; i < count; i++) {
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(position);
            p.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 4,
                    Math.random() * 4 + 1,
                    (Math.random() - 0.5) * 4
                ),
                life: 0.6 // active seconds life
            };
            group.add(p);
        }
        this.scene.add(group);
        this.activeParticles.push(group);
    }

    update(delta) {
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const group = this.activeParticles[i];
            let allDead = true;

            group.children.forEach(p => {
                const ud = p.userData;
                if (ud.life > 0) {
                    p.position.addScaledVector(ud.velocity, delta);
                    ud.velocity.y -= 9.8 * delta; // particle gravity fallback
                    ud.life -= delta;
                    allDead = false;
                } else {
                    p.visible = false;
                }
            });

            if (allDead) {
                this.scene.remove(group);
                this.activeParticles.splice(i, 1);
            }
        }
    }
}
