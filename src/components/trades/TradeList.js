import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import tradesAPI from '../../api/trades';
import Spinner from '../common/Spinner';
import './Trades.css';

const TradeList = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, settled, cancelled
    const { user } = useAuth();

    useEffect(() => {
        fetchTrades();
    }, []);

    const fetchTrades = async () => {
        try {
            const response = await tradesAPI.getMyTrades();
            setTrades(response);
        } catch (err) {
            setError(err.message || 'Failed to fetch trades');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTrades = () => {
        if (filter === 'all') return trades;
        return trades.filter(trade => trade.status === filter);
    };

    const calculateTotalStats = () => {
        return trades.reduce((stats, trade) => {
            stats.totalTrades++;
            stats.totalAmount += trade.amount;
            
            if (trade.status === 'settled') {
                stats.settledTrades++;
                stats.totalSettled += trade.settledAmount;
                const profit = trade.settledAmount - trade.amount;
                if (profit > 0) {
                    stats.winningTrades++;
                }
            }
            
            return stats;
        }, {
            totalTrades: 0,
            totalAmount: 0,
            settledTrades: 0,
            totalSettled: 0,
            winningTrades: 0
        });
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    const filteredTrades = getFilteredTrades();
    const stats = calculateTotalStats();

    return (
        <div className="trade-list-container">
            <div className="trade-list-header">
                <h1>My Trades</h1>
                
                <div className="trade-stats">
                    <div className="stat-card">
                        <span className="stat-label">Total Trades</span>
                        <span className="stat-value">{stats.totalTrades}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total Amount Traded</span>
                        <span className="stat-value">${stats.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Win Rate</span>
                        <span className="stat-value">
                            {stats.settledTrades > 0 
                                ? ((stats.winningTrades / stats.settledTrades) * 100).toFixed(1)
                                : 0}%
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total P/L</span>
                        <span className={`stat-value ${stats.totalSettled - stats.totalAmount >= 0 ? 'profit' : 'loss'}`}>
                            ${(stats.totalSettled - stats.totalAmount).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="filter-section">
                <button 
                    className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Trades
                </button>
                <button 
                    className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button 
                    className={`filter-button ${filter === 'settled' ? 'active' : ''}`}
                    onClick={() => setFilter('settled')}
                >
                    Settled
                </button>
                <button 
                    className={`filter-button ${filter === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setFilter('cancelled')}
                >
                    Cancelled
                </button>
            </div>

            {filteredTrades.length === 0 ? (
                <div className="no-trades">
                    <p>No {filter !== 'all' ? filter : ''} trades found</p>
                </div>
            ) : (
                <div className="trades-grid">
                    {filteredTrades.map(trade => (
                        <div key={trade._id} className="trade-card">
                            <div className="trade-header">
                                <Link to={`/events/${trade.event._id}`} className="event-link">
                                    {trade.event.title}
                                </Link>
                                <span className={`status status-${trade.status}`}>
                                    {trade.status}
                                </span>
                            </div>

                            <div className="trade-details">
                                <div className="detail-row">
                                    <span>Amount:</span>
                                    <span>${trade.amount}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Selected Option:</span>
                                    <span>{trade.selectedOption}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Odds:</span>
                                    <span>{trade.odds}</span>
                                </div>
                                {trade.status === 'settled' && (
                                    <>
                                        <div className="detail-row">
                                            <span>Result:</span>
                                            <span>{trade.result}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Settled Amount:</span>
                                            <span className={trade.settledAmount > trade.amount ? 'profit' : 'loss'}>
                                                ${trade.settledAmount}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Profit/Loss:</span>
                                            <span className={trade.settledAmount > trade.amount ? 'profit' : 'loss'}>
                                                ${(trade.settledAmount - trade.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="trade-footer">
                                <span className="timestamp">
                                    Placed: {new Date(trade.createdAt).toLocaleString()}
                                </span>
                                {trade.status === 'settled' && (
                                    <span className="timestamp">
                                        Settled: {new Date(trade.settledAt).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TradeList;