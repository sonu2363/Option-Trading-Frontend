import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 seconds timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Handle unauthorized errors (401)
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');
            
            // Redirect to login page
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Handle forbidden errors (403)
        if (error.response?.status === 403) {
            // Redirect to home page or show permission denied message
            window.location.href = '/';
            return Promise.reject(error);
        }

        // Handle server errors (500)
        if (error.response?.status === 500) {
            console.error('Server Error:', error.response.data);
            error.message = 'An unexpected server error occurred';
            return Promise.reject(error);
        }

        // Handle network errors
        if (!error.response) {
            error.message = 'Network error - please check your connection';
            return Promise.reject(error);
        }

        // Format error message from response
        error.message = error.response?.data?.message || 'An unexpected error occurred';
        return Promise.reject(error);
    }
);

// Helper methods
const apiHelpers = {
    // Add query params to URL
    addQueryParams: (url, params) => {
        const queryString = new URLSearchParams(params).toString();
        return queryString ? `${url}?${queryString}` : url;
    },

    // Format error message
    formatError: (error) => {
        return error.response?.data?.message || error.message || 'An unexpected error occurred';
    },

    // Check if token exists
    hasToken: () => {
        return !!localStorage.getItem('token');
    },

    // Clear auth token
    clearToken: () => {
        localStorage.removeItem('token');
    }
};

export { apiHelpers };
export default api;