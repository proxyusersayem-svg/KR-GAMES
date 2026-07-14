import * as THREE from 'three';

export class CombatEngine {
    constructor(scene, player, botManager, audioManager, effectEngine) {
        this.scene = scene;
        this.player = player;
        this.botManager = botManager;
        this.audio = audioManager;
        this.effects = effectEngine;
        this.reach = 3.5;
    }

    executeAttack() {
        this.audio.play('swing');

        // Cast ray directly through camera sight target
        const raycaster = new THREE.Raycaster();
        const center = new THREE.Vector2(0, 0); // Crosshair center offset
        raycaster.setFromCamera(center, this.player.camera);

        // Ray intersect against AI bot colliders
        const botMeshes = this.botManager.bots.map(b => b.mesh);
        const intersects = raycaster.intersectObjects(botMeshes);

        if (intersects.length > 0 && intersects[0].distance <= this.reach) {
            const hitMesh = intersects[0].object;
            const targetBot = this.botManager.bots.find(b => b.mesh === hitMesh);
            if (targetBot) {
                targetBot.health -= 25; // Wooden sword default swing rate
                this.audio.play('hit');
                this.effects.spawnSparks(intersects[0].point, 0xe74c3c);
                
                if (targetBot.health <= 0) {
                    targetBot.respawn();
                    this.pushKillfeed('Player', targetBot.team.toUpperCase() + ' Bot');
                }
            }
        }
    }

    pushKillfeed(killer, victim) {
        const feed = document.getElementById('killfeed');
        if (!feed) return;
        const msg = document.createElement('div');
        msg.className = 'kill-msg';
        msg.innerHTML = `⚔️ <span class="k-name">${killer}</span> defeated <span class="v-name">${victim}</span>`;
        feed.appendChild(msg);
        
        setTimeout(() => msg.remove(), 4000); // clear after 4s
    }
}
