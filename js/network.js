export class NetworkClient {
    constructor(roomId, onSyncEvent) {
        this.roomId = roomId;
        this.onSyncEvent = onSyncEvent;
        this.ws = null;
        this.connect();
    }

    connect() {
        // Fallback checks for development host configurations
        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsHost = window.location.host || 'localhost:3000';
        
        this.ws = new WebSocket(`${wsProtocol}${wsHost}`);

        this.ws.onopen = () => {
            this.send('join_room', { roomId: this.roomId });
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.onSyncEvent(message.type, message.payload);
            } catch (err) {
                console.error("Malformed packet payload:", err);
            }
        };

        this.ws.onerror = (e) => console.error("Socket Interface Failure: ", e);
    }

    send(type, payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        }
    }
}
