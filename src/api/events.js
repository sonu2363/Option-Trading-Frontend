import api from '../utils/api';

const eventsAPI = {
    // Get all events
    getAllEvents: async () => {
        try {
            const response = await api.get('/events');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch events' };
        }
    },

    // Get event by ID
    getEventById: async (eventId) => {
        try {
            const response = await api.get(`/events/${eventId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch event' };
        }
    },

    // Get live events
    getLiveEvents: async () => {
        try {
            const response = await api.get('/events/status/live');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch live events' };
        }
    },

    // Create new event (admin only)
    createEvent: async (eventData) => {
        try {
            const response = await api.post('/events', eventData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create event' };
        }
    },

    // Update event (admin only)
    updateEvent: async (eventId, eventData) => {
        try {
            const response = await api.put(`/events/${eventId}`, eventData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update event' };
        }
    },

    // Update event odds (admin only)
    updateEventOdds: async (eventId, odds) => {
        try {
            const response = await api.patch(`/events/${eventId}/odds`, { odds });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update odds' };
        }
    },

    // Delete event (admin only)
    deleteEvent: async (eventId) => {
        try {
            const response = await api.delete(`/events/${eventId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete event' };
        }
    },

    // Filter events
    filterEvents: async (filters) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await api.get(`/events?${queryString}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to filter events' };
        }
    },

    // Get event statistics (admin only)
    getEventStats: async (eventId) => {
        try {
            const response = await api.get(`/events/${eventId}/stats`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch event stats' };
        }
    }
};

export default eventsAPI;