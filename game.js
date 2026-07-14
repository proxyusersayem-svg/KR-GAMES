import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { BotManager } from './bot.js';
import { BlockEngine } from './blocks.js';

export class GameEngine {
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.running = false;
        
        this.clock = new THREE.Clock();
        this.initGraphics();
        this.initSystems();
        
        window.addEventListener('resize', this.onResize.bind(this));
    }

    initGraphics() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xdceeff); // Pastel Sky Blue
        this.scene.fog = new THREE.FogExp2(0xdceeff, 0.015);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);

        // Environment Lights
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
        hemiLight.position.set(0, 200, 0);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
        dirLight.position.set(100, 150, 50);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 500;
        const d = 100;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        this.scene.add(dirLight);
    }

    initSystems() {
        this.world = new World(this.scene);
        this.world.buildMap();

        this.blockEngine = new BlockEngine(this.scene, this.world);
        
        this.player = new Player(this.camera, this.renderer.domElement, this.world, this.blockEngine);
        this.scene.add(this.player.mesh);
        this.player.mesh.position.set(0, 12, 45); // Spawn on player island Blue

        this.botManager = new BotManager(this.scene, this.world, this.blockEngine, this.options.botsCount, this.options.difficulty);
    }

    start() {
        this.running = true;
        this.animate();
    }

    destroy() {
        this.running = false;
        this.player.dispose();
        this.botManager.dispose();
        this.renderer.dispose();
        window.removeEventListener('resize', this.onResize);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        if (!this.running) return;
        requestAnimationFrame(this.animate.bind(this));

        const delta = Math.min(this.clock.getDelta(), 0.1); // Clamp physics steps to bypass background freezes
        
        this.player.update(delta);
        this.botManager.update(delta, this.player);
        this.world.update(delta);

        this.renderer.render(this.scene, this.camera);
    }
}
