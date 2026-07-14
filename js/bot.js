import * as THREE from 'three';

class BotEntity {
    constructor(id, team, difficulty, scene, world, blockEngine) {
        this.id = id;
        this.team = team;
        this.difficulty = difficulty;
        this.scene = scene;
        this.world = world;
        this.blockEngine = blockEngine;

        this.health = 100;
        this.speed = difficulty === 'pro' ? 5.5 : 3.5;

        // Visual low-poly capsule body
        const botGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 6);
        const botMat = this.world.materials[team];
        this.mesh = new THREE.Mesh(botGeo, botMat);
        this.scene.add(this.mesh);

        this.mesh.position.set(
            (Math.random() - 0.5) * 10,
            10,
            (Math.random() - 0.5) * 10
        );

        // Core State Engine
        this.states = { GATHER: 0, ATTACK_BED: 1, ESCAPE: 2 };
        this.currentState = this.states.GATHER;
        this.targetNode = null;
        this.searchTimer = 0;
    }

    update(delta, player) {
        this.searchTimer += delta;

        // Dynamic State Planning (Tick down every 1 sec to conserve performance)
        if (this.searchTimer > 1.0) {
            this.searchTimer = 0;
            this.decideNextState(player);
        }

        this.executeStateMovement(delta);
    }

    decideNextState(player) {
        // Proactive Aggression parameters
        const playerDist = this.mesh.position.distanceTo(player.position);
        
        if (playerDist < 15.0 && player.team !== this.team) {
            this.currentState = this.states.ATTACK_BED;
            this.targetNode = player.position;
            return;
        }

        // Gather Resources pathfinding targets
        const targetGens = this.world.generators.filter(g => g.type === 'iron_gold');
        if (targetGens.length > 0) {
            this.currentState = this.states.GATHER;
            this.targetNode = targetGens[0].position; // Pick closest spawn loop node
        }
    }

    executeStateMovement(delta) {
        if (!this.targetNode) return;

        const direction = new THREE.Vector3().subVectors(this.targetNode, this.mesh.position);
        direction.y = 0; // Lock look vector plane horizontal
        
        if (direction.length() > 0.5) {
            direction.normalize();
            this.mesh.position.addScaledVector(direction, this.speed * delta);
            
            // Turn face frame dynamically to travel vectors
            const targetRotation = Math.atan2(direction.x, direction.z);
            this.mesh.rotation.y = targetRotation;
        }

        // Fall handling physics bounds
        const collision = this.world.checkCollision(this.mesh.position, 0.5);
        if (collision.collision) {
            this.mesh.position.y = collision.surfaceY + 0.9;
        } else {
            this.mesh.position.y -= 9.8 * delta; // Fall downward
            if (this.mesh.position.y < -15) {
                this.respawn();
            }
        }
    }

    respawn() {
        this.health = 100;
        this.mesh.position.set(0, 10, -45); // Standard Yellow / Red AI Base
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

export class BotManager {
    constructor(scene, world, blockEngine, count, difficulty) {
        this.scene = scene;
        this.world = world;
        this.blockEngine = blockEngine;
        this.bots = [];

        const enemyTeams = ['red', 'green', 'yellow'];
        for (let i = 0; i < count; i++) {
            const assignedTeam = enemyTeams[i % enemyTeams.length];
            this.bots.push(new BotEntity(`bot_${i}`, assignedTeam, difficulty, scene, world, blockEngine));
        }
    }

    update(delta, player) {
        this.bots.forEach(bot => bot.update(delta, player));
    }

    dispose() {
        this.bots.forEach(bot => bot.destroy());
        this.bots = [];
    }
}
