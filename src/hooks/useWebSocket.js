import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';

export const useWebSocket = () => {
    const socket = useRef(null);
    const { token } = useAuth();

    // Initialize socket connection
    const connect = useCallback(() => {
        if (!token) return;

        socket.current = io('http://localhost:3000', {
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

        // Connection event handlers
        socket.current.on('connect', () => {
            console.log('WebSocket connected');
        });

        socket.current.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        socket.current.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

    }, [token]);

    // Disconnect socket
    const disconnect = useCallback(() => {
        if (socket.current) {
            socket.current.disconnect();
            socket.current = null;
        }
    }, []);

    // Subscribe to events
    const subscribe = useCallback((eventType, callback) => {
        if (socket.current) {
            socket.current.on(eventType, callback);
        }
    }, []);

    // Unsubscribe from events
    const unsubscribe = useCallback((eventType, callback) => {
        if (socket.current) {
            socket.current.off(eventType, callback);
        }
    }, []);

    // Subscribe to specific event updates
    const subscribeToEvent = useCallback((eventId) => {
        if (socket.current) {
            socket.current.emit('subscribe_event', eventId);
        }
    }, []);

    // Unsubscribe from specific event updates
    const unsubscribeFromEvent = useCallback((eventId) => {
        if (socket.current) {
            socket.current.emit('unsubscribe_event', eventId);
        }
    }, []);

    // Emit event
    const emit = useCallback((eventType, data) => {
        if (socket.current) {
            socket.current.emit(eventType, data);
        }
    }, []);

    // Connect on mount and token change
    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return {
        socket: socket.current,
        isConnected: socket.current?.connected || false,
        subscribe,
        unsubscribe,
        subscribeToEvent,
        unsubscribeFromEvent,
        emit
    };
};

export default useWebSocket;