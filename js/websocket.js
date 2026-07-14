const WebSocket = require('ws');
const { Matchmaker } = require('./matchmaker');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.matchmaker = new Matchmaker();
        this.init();
    }

    init() {
        this.wss.on('connection', (ws) => {
            let currentRoom = null;
            let playerId = Math.random().toString(36).substring(2, 9);

            ws.on('message', (message) => {
                try {
                    const packet = JSON.parse(message);
                    this.handlePacket(ws, playerId, packet, (room) => {
                        currentRoom = room;
                    });
                } catch (e) {
                    console.error("Protocol parse error:", e);
                }
            });

            ws.on('close', () => {
                if (currentRoom) {
                    currentRoom.removePlayer(playerId);
                    this.broadcastToRoom(currentRoom.id, 'player_left', { playerId });
                    if (Object.keys(currentRoom.players).length === 0) {
                        this.matchmaker.removeRoom(currentRoom.id);
                    }
                }
            });
        });
    }

    handlePacket(ws, playerId, packet, setRoomCallback) {
        const { type, payload } = packet;

        switch (type) {
            case 'join_lobby': {
                const room = this.matchmaker.findOrCreateRoom(payload.username, payload.config);
                const success = room.addPlayer(playerId, payload.username, ws);
                if (success) {
                    setRoomCallback(room);
                    ws.send(JSON.stringify({ type: 'lobby_joined', payload: room.getRoomInfo() }));
                    this.broadcastToRoom(room.id, 'lobby_update', room.getRoomInfo());
                } else {
                    ws.send(JSON.stringify({ type: 'error', payload: 'Room is full' }));
                }
                break;
            }
            case 'toggle_ready': {
                const room = this.matchmaker.getRoom(payload.roomId);
                if (room && room.players[playerId]) {
                    room.players[playerId].ready = !room.players[playerId].ready;
                    this.broadcastToRoom(room.id, 'lobby_update', room.getRoomInfo());
                }
                break;
            }
            case 'peer_sync': {
                const room = this.matchmaker.getRoom(payload.roomId);
                if (room) {
                    this.broadcastToRoom(room.id, 'peer_update', {
                        id: playerId,
                        position: payload.position,
                        rotation: payload.rotation,
                        item: payload.item
                    }, playerId);
                }
                break;
            }
        }
    }

    broadcastToRoom(roomId, type, payload, excludeId = null) {
        const room = this.matchmaker.getRoom(roomId);
        if (!room) return;

        const packet = JSON.stringify({ type, payload });
        for (const pid in room.players) {
            if (pid !== excludeId) {
                const ws = room.players[pid].ws;
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(packet);
                }
            }
        }
    }
}

module.exports = { WebSocketServer };
