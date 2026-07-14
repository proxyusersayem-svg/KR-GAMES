import { GameEngine } from './game.js';
import { SaveSystem } from './save.js';

class AppController {
    constructor() {
        this.currentView = 'menu-view';
        this.gameEngine = null;
        this.saveSystem = new SaveSystem();

        window.addEventListener('DOMContentLoaded', () => {
            this.initDOM();
        });
    }

    initDOM() {

        // ==========================
        // OFFLINE PLAY
        // ==========================
        const offlineBtn = document.getElementById('btn-offline');

        if (offlineBtn) {
            offlineBtn.addEventListener('click', () => {
                this.switchView('room-view');
            });
        }

        // ==========================
        // ONLINE PLAY
        // ==========================
        const onlineBtn = document.getElementById('btn-online');

        if (onlineBtn) {
            onlineBtn.addEventListener('click', () => {
                this.switchView('room-view');
            });
        }

        // ==========================
        // SETTINGS
        // ==========================
        const settingsBtn = document.getElementById('btn-settings-toggle');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                document.getElementById('settings-modal').classList.add('active');
            });
        }

        const saveBtn = document.getElementById('btn-save-settings');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                document.getElementById('settings-modal').classList.remove('active');
            });
        }

        // ==========================
        // START MATCH
        // ==========================
        const startBtn = document.getElementById('btn-start-match');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.switchView('game-view');
                this.startGame();
            });
        }

        // ==========================
        // LEAVE ROOM
        // ==========================
        const leaveBtn = document.getElementById('btn-leave-room');

        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => {
                this.switchView('menu-view');
            });
        }

        // ==========================
        // PROFILE
        // ==========================
        const profile = this.saveSystem.getProfile();

        const coins = document.getElementById('hdr-coins');
        if (coins) coins.innerText = profile.coins ?? 0;

        const diamonds = document.getElementById('hdr-diamonds');
        if (diamonds) diamonds.innerText = profile.diamonds ?? 0;
    }

    switchView(viewId) {

        const current = document.getElementById(this.currentView);
        const next = document.getElementById(viewId);

        if (current) current.classList.remove('active');
        if (next) next.classList.add('active');

        this.currentView = viewId;
    }

    startGame() {

        const difficulty =
            document.getElementById('lobby-difficulty')?.value || 'normal';

        const botsCount =
            parseInt(document.getElementById('lobby-bots-count')?.value || 4);

        const container = document.getElementById('canvas-container');

        if (!container) {
            console.error('Canvas container not found!');
            return;
        }

        container.innerHTML = '';

        this.gameEngine = new GameEngine(container, {
            difficulty,
            botsCount,
            onGameOver: (winner) => {
                alert(`Winner: ${winner}`);
                this.switchView('menu-view');

                if (this.gameEngine) {
                    this.gameEngine.destroy();
                }
            }
        });

        this.gameEngine.start();
    }
}

new AppController();
