import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import eventsAPI from '../../api/events';
import tradesAPI from '../../api/trades';
import './Admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeEvents: 0,
        totalTrades: 0,
        totalVolume: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [eventStats, tradeStats] = await Promise.all([
                eventsAPI.getEventStats(),
                tradesAPI.getTradeStats()
            ]);

            setStats({
                totalUsers: tradeStats.uniqueUsers || 0,
                activeEvents: eventStats.active || 0,
                totalTrades: tradeStats.total || 0,
                totalVolume: tradeStats.volume || 0
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <span className="stat-value">{stats.totalUsers}</span>
                </div>
                <div className="stat-card">
                    <h3>Active Events</h3>
                    <span className="stat-value">{stats.activeEvents}</span>
                </div>
                <div className="stat-card">
                    <h3>Total Trades</h3>
                    <span className="stat-value">{stats.totalTrades}</span>
                </div>
                <div className="stat-card">
                    <h3>Total Volume</h3>
                    <span className="stat-value">${stats.totalVolume.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;