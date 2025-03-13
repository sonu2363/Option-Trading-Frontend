import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const { 
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        updateBalance
    } = context;

    // Helper functions for common auth operations
    const isAuthenticated = () => {
        return !!user;
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const hasPermission = (requiredRole = 'user') => {
        if (!user) return false;
        if (requiredRole === 'admin') return user.role === 'admin';
        return true;
    };

    const getToken = () => {
        return localStorage.getItem('token');
    };

    return {
        // Auth state
        user,
        loading,
        error,
        
        // Auth operations
        login,
        register,
        logout,
        updateProfile,
        updateBalance,
        
        // Helper methods
        isAuthenticated,
        isAdmin,
        hasPermission,
        getToken
    };
};