import io from 'socket.io-client';

class SocketManager {
    constructor() {
        this.socket = null;
        this.eventSubscriptions = new Map();
    }

    // Initialize socket connection
    connect(token) {
        if (this.socket) {
            return;
        }

        this.socket = io(process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3000', {
            path: '/ws',
            auth: {
                token
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        this.setupDefaultListeners();
    }

    // Setup default event listeners
    setupDefaultListeners() {
        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    // Subscribe to an event
    subscribe(eventName, callback) {
        if (!this.socket) {
            throw new Error('Socket not initialized');
        }

        if (!this.eventSubscriptions.has(eventName)) {
            this.eventSubscriptions.set(eventName, new Set());
        }

        const callbacks = this.eventSubscriptions.get(eventName);
        callbacks.add(callback);
        this.socket.on(eventName, callback);
    }

    // Unsubscribe from an event
    unsubscribe(eventName, callback) {
        if (!this.socket) {
            return;
        }

        const callbacks = this.eventSubscriptions.get(eventName);
        if (callbacks) {
            callbacks.delete(callback);
            this.socket.off(eventName, callback);

            if (callbacks.size === 0) {
                this.eventSubscriptions.delete(eventName);
            }
        }
    }

    // Subscribe to event updates
    subscribeToEvent(eventId) {
        if (!this.socket) {
            throw new Error('Socket not initialized');
        }

        this.socket.emit('subscribe_event', eventId);
    }

    // Unsubscribe from event updates
    unsubscribeFromEvent(eventId) {
        if (!this.socket) {
            return;
        }

        this.socket.emit('unsubscribe_event', eventId);
    }

    // Emit an event
    emit(eventName, data) {
        if (!this.socket) {
            throw new Error('Socket not initialized');
        }

        this.socket.emit(eventName, data);
    }

    // Check if socket is connected
    isConnected() {
        return this.socket?.connected || false;
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.eventSubscriptions.clear();
        }
    }

    // Get socket instance
    getSocket() {
        return this.socket;
    }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;