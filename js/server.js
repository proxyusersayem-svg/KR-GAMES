const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('KR GAMES BedWars Network Hub Running.');
});

const wss = new WebSocket.Server({ server });

// Memory storage database
const rooms = {};

wss.on('connection', (ws) => {
    let currentRoom = null;
    let playerId = null;

    ws.on('message', (message) => {
        try {
            const packet = JSON.parse(message);
            const { type, payload } = packet;

            switch (type) {
                case 'join_room':
                    playerId = Math.random().toString(36).substring(2, 9);
                    currentRoom = payload.roomId;
                    
                    if (!rooms[currentRoom]) {
                        rooms[currentRoom] = { players: {} };
                    }
                    
                    // Add connection mappings
                    rooms[currentRoom].players[playerId] = { ws, position: { x: 0, y: 0, z: 0 } };
                    
                    // Broadcast new join
                    broadcastToRoom(currentRoom, 'player_joined', { playerId }, playerId);
                    break;

                case 'player_sync':
                    if (rooms[currentRoom] && rooms[currentRoom].players[playerId]) {
                        rooms[currentRoom].players[playerId].position = payload.position;
                        // Broadcast movement update downstream to peers
                        broadcastToRoom(currentRoom, 'peer_move', { playerId, position: payload.position }, playerId);
                    }
                    break;
            }
        } catch (e) {
            console.error("Broker runtime error processing frame", e);
        }
    });

    ws.on('close', () => {
        if (currentRoom && rooms[currentRoom] && rooms[currentRoom].players[playerId]) {
            delete rooms[currentRoom].players[playerId];
            broadcastToRoom(currentRoom, 'player_left', { playerId });
            
            // Sweep garbage room allocations
            if (Object.keys(rooms[currentRoom].players).length === 0) {
                delete rooms[currentRoom];
            }
        }
    });
});

function broadcastToRoom(roomId, type, payload, excludePlayerId = null) {
    if (!rooms[roomId]) return;
    const players = rooms[roomId].players;
    const packet = JSON.stringify({ type, payload });

    for (const pid in players) {
        if (pid !== excludePlayerId && players[pid].ws.readyState === WebSocket.OPEN) {
            players[pid].ws.send(packet);
        }
    }
}

server.listen(PORT, () => {
    console.log(`KR Network Broker active on port ${PORT}`);
});
