export class HealthSystem {
    constructor(onDeathCallback) {
        this.maxHealth = 100;
        this.health = 100;
        this.armorValue = 0; // Shield absorption parameter (0.0 - 0.8)
        this.onDeath = onDeathCallback;
        this.updateUI();
    }

    takeDamage(amount) {
        const finalDamage = amount * (1 - this.armorValue);
        this.health = Math.max(0, this.health - finalDamage);
        this.updateUI();

        if (this.health <= 0) {
            this.onDeath();
        }
    }

    setArmor(armorLevel) {
        // level 1: Iron (0.3 absorption), level 2: Diamond (0.6 absorption)
        this.armorValue = armorLevel === 'iron' ? 0.3 : armorLevel === 'diamond' ? 0.6 : 0;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateUI();
    }

    reset() {
        this.health = this.maxHealth;
        this.updateUI();
    }

    updateUI() {
        const hpFill = document.getElementById('health-bar');
        const hpText = document.getElementById('health-text');
        if (hpFill && hpText) {
            hpFill.style.width = `${(this.health / this.maxHealth) * 100}%`;
            hpText.innerText = `${Math.round(this.health)} / ${this.maxHealth}`;
        }
    }
}
