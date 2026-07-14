export class InputControls {
    constructor(element) {
        this.element = element;
        this.states = { forward: false, backward: false, left: false, right: false, jump: false, sneak: false };
        this.mouseDelta = { x: 0, y: 0 };
        this.setupListeners();
    }

    setupListeners() {
        this.element.addEventListener('click', () => {
            this.element.requestPointerLock();
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.element) {
                this.mouseDelta.x = e.movementX;
                this.mouseDelta.y = e.movementY;
            }
        });

        window.addEventListener('keydown', (e) => this.handleKey(e.code, true));
        window.addEventListener('keyup', (e) => this.handleKey(e.code, false));
    }

    handleKey(code, isPressed) {
        switch (code) {
            case 'KeyW': this.states.forward = isPressed; break;
            case 'KeyS': this.states.backward = isPressed; break;
            case 'KeyA': this.states.left = isPressed; break;
            case 'KeyD': this.states.right = isPressed; break;
            case 'Space': this.states.jump = isPressed; break;
            case 'ShiftLeft': this.states.sneak = isPressed; break;
        }
    }

    consumeMouseDelta() {
        const delta = { ...this.mouseDelta };
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        return delta;
    }
}
