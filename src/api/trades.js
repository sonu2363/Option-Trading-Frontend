import api from '../utils/api';

const tradesAPI = {
    // Get user's trades
    getMyTrades: async () => {
        try {
            const response = await api.get('/trades/my-trades');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch trades' };
        }
    },

    // Place a new trade
    placeTrade: async (tradeData) => {
        try {
            const response = await api.post('/trades', tradeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to place trade' };
        }
    },

    // Get trade by ID
    getTradeById: async (tradeId) => {
        try {
            const response = await api.get(`/trades/${tradeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch trade' };
        }
    },

    // Cancel a trade
    cancelTrade: async (tradeId) => {
        try {
            const response = await api.delete(`/trades/${tradeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to cancel trade' };
        }
    },

    // Get trade statistics
    getTradeStats: async () => {
        try {
            const response = await api.get('/trades/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch trade statistics' };
        }
    },

    // Get trades by event
    getTradesByEvent: async (eventId) => {
        try {
            const response = await api.get(`/trades/event/${eventId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch event trades' };
        }
    },

    // Filter trades
    filterTrades: async (filters) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await api.get(`/trades/my-trades?${queryString}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to filter trades' };
        }
    },

    // Settle trades (admin only)
    settleTrades: async (eventId, result) => {
        try {
            const response = await api.post(`/trades/settle/${eventId}`, { result });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to settle trades' };
        }
    }
};

export default tradesAPI;