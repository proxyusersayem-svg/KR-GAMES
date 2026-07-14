export class SaveSystem {
    constructor() {
        this.storageKey = "KRGAMES_BEDWARS_SAVE_DATA";
        this.data = this.load();
    }

    load() {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.error("Corruption inside LocalStorage blocks. Resetting database.");
            }
        }
        return {
            level: 1,
            xp: 0,
            coins: 150,
            stats: { wins: 0, matchesPlayed: 0, kills: 0 }
        };
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    getProfile() {
        return this.data;
    }

    addCoins(amount) {
        this.data.coins += amount;
        this.save();
    }
}
