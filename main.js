import { GameEngine } from './game.js';
import { SaveSystem } from './save.js';

class AppController {
    constructor() {
        this.currentView = 'menu-view';
        this.gameEngine = null;
        this.saveSystem = new SaveSystem();
        this.initDOM();
    }

    initDOM() {
        // Core View Triggers
        document.getElementById('btn-offline').addEventListener('click', () => this.switchView('room-view'));
        document.getElementById('btn-settings').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.add('active');
        });
        document.getElementById('btn-save-settings').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.remove('active');
        });

        // Room Controls
        document.getElementById('btn-start-match').addEventListener('click', () => {
            this.switchView('game-view');
            this.startGame();
        });

        document.getElementById('btn-leave-room').addEventListener('click', () => {
            this.switchView('menu-view');
        });

        // Initialize display stats
        const profile = this.saveSystem.getProfile();
        document.getElementById('user-level').innerText = profile.level;
        document.getElementById('user-coins').innerText = profile.coins;
    }

    switchView(viewId) {
        document.getElementById(this.currentView).classList.remove('active');
        document.getElementById(viewId).classList.add('active');
        this.currentView = viewId;
    }

    startGame() {
        const difficulty = document.getElementById('lobby-difficulty').value;
        const botsCount = parseInt(document.getElementById('lobby-bots-count').value, 10);
        
        // Fire up clean instance
        const container = document.getElementById('canvas-container');
        container.innerHTML = ''; // Clean old context instances
        
        this.gameEngine = new GameEngine(container, {
            difficulty,
            botsCount,
            onGameOver: (winner) => {
                alert(`Game Over! Team Winner: ${winner.toUpperCase()}`);
                this.switchView('menu-view');
                if (this.gameEngine) this.gameEngine.destroy();
            }
        });
        this.gameEngine.start();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new AppController();
});
