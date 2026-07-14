export class BedSystem {
    constructor(team, position, world, scene, audio, scoreboard) {
        this.team = team;
        this.position = position;
        this.world = world;
        this.scene = scene;
        this.audio = audio;
        this.scoreboard = scoreboard;
        this.alive = true;
    }

    breakBed() {
        if (!this.alive) return;
        this.alive = false;
        this.audio.play('bed_destroy');
        this.scoreboard.destroyBed(this.team);

        // Remove the bed model mesh from the rendering scene
        const targetBed = this.world.beds[this.team];
        if (targetBed && targetBed.mesh) {
            this.scene.remove(targetBed.mesh);
        }
    }
}
