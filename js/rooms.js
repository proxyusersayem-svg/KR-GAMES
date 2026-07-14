class Room {
    constructor(id, name, config = {}) {
        this.id = id;
        this.name = name || `Room #${id}`;
        this.password = config.password || null;
        this.map = config.map || 'floating_arch';
        this.teamSize = config.teamSize || 1; // 1 (Solo), 2 (Duo), 4 (Squad/4v4)
        this.maxPlayers = config.maxPlayers || 8;
        this.botFill = config.botFill !== undefined ? config.botFill : true;
        this.players = {}; // playerId -> player state
        this.hostId = null;
        this.gameState = 'lobby'; // lobby, active, ended
    }

    addPlayer(playerId, username, ws) {
        if (Object.keys(this.players).length >= this.maxPlayers) return false;
        
        const isHost = Object.keys(this.players).length === 0;
        this.players[playerId] = {
            id: playerId,
            username: username || `Guest_${playerId.slice(0, 4)}`,
            ws: ws,
            team: null,
            ready: isHost, // Host is automatically ready
            isHost: isHost
        };

        if (isHost) {
            this.hostId = playerId;
        }

        this.assignTeam(playerId);
        return true;
    }

    removePlayer(playerId) {
        const player = this.players[playerId];
        if (!player) return;

        delete this.players[playerId];

        if (player.isHost && Object.keys(this.players).length > 0) {
            const nextHostId = Object.keys(this.players)[0];
            this.players[nextHostId].isHost = true;
            this.hostId = nextHostId;
        }
    }

    assignTeam(playerId) {
        const teams = ['blue', 'red', 'green', 'yellow'];
        const player = this.players[playerId];
        if (!player) return;

        // Group players into teams based on smallest team counts
        const teamCounts = { blue: 0, red: 0, green: 0, yellow: 0 };
        for (const pid in this.players) {
            const t = this.players[pid].team;
            if (t) teamCounts[t]++;
        }

        let bestTeam = 'blue';
        let minCount = Infinity;
        for (const team of teams) {
            if (teamCounts[team] < minCount) {
                minCount = teamCounts[team];
                bestTeam = team;
            }
        }
        player.team = bestTeam;
    }

    getRoomInfo() {
        return {
            id: this.id,
            name: this.name,
            map: this.map,
            teamSize: this.teamSize,
            maxPlayers: this.maxPlayers,
            hostId: this.hostId,
            gameState: this.gameState,
            players: Object.values(this.players).map(p => ({
                id: p.id,
                username: p.username,
                team: p.team,
                ready: p.ready,
                isHost: p.isHost
            }))
        };
    }
}

module.exports = { Room };
