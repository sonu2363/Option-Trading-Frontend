import { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const socket = useRef(null);
    const { user, token } = useAuth();

    useEffect(() => {
        // Only connect if user is authenticated
        if (token) {
            // Initialize socket connection
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

            socket.current.on('disconnect', (reason) => {
                console.log('WebSocket disconnected:', reason);
            });

            // Event updates
            socket.current.on('event_update', (data) => {
                console.log('Event update received:', data);
            });

            socket.current.on('odds_update', (data) => {
                console.log('Odds update received:', data);
            });

            socket.current.on('trade_update', (data) => {
                console.log('Trade update received:', data);
            });

            // Error handling
            socket.current.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        }

        // Cleanup on unmount or token change
        return () => {
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
        };
    }, [token]);

    // Helper functions for socket operations
    const emit = (eventName, data) => {
        if (socket.current) {
            socket.current.emit(eventName, data);
        }
    };

    const subscribe = (eventName, callback) => {
        if (socket.current) {
            socket.current.on(eventName, callback);
        }
    };

    const unsubscribe = (eventName, callback) => {
        if (socket.current) {
            socket.current.off(eventName, callback);
        }
    };

    // Subscribe to event updates
    const subscribeToEvent = (eventId) => {
        emit('subscribe_event', eventId);
    };

    // Unsubscribe from event updates
    const unsubscribeFromEvent = (eventId) => {
        emit('unsubscribe_event', eventId);
    };

    const value = {
        socket: socket.current,
        isConnected: socket.current?.connected || false,
        emit,
        subscribe,
        unsubscribe,
        subscribeToEvent,
        unsubscribeFromEvent
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

// Custom hook for using WebSocket context
export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export default WebSocketContext;