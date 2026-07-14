const { Room } = require('./rooms');

class Matchmaker {
    constructor() {
        this.rooms = {}; // roomId -> Room instance
    }

    findOrCreateRoom(username, config = {}) {
        // Attempt to find a matching public, unpopulated room
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (room.gameState === 'lobby' && 
                !room.password && 
                Object.keys(room.players).length < room.maxPlayers) {
                return room;
            }
        }

        // Create fallback lobby
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = new Room(newRoomId, `Global #${newRoomId}`, config);
        this.rooms[newRoomId] = room;
        return room;
    }

    getRoom(roomId) {
        return this.rooms[roomId] || null;
    }

    removeRoom(roomId) {
        if (this.rooms[roomId]) {
            delete this.rooms[roomId];
        }
    }
}

module.exports = { Matchmaker };
