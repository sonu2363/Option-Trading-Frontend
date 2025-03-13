import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import tradesAPI from '../../api/trades';
import Spinner from '../common/Spinner';
import './Trades.css';

const TradeHistory = () => {
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

    const calculateTotalProfit = () => {
        return trades
            .filter(trade => trade.status === 'settled')
            .reduce((total, trade) => total + (trade.settledAmount - trade.amount), 0);
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    const filteredTrades = getFilteredTrades();

    return (
        <div className="trade-history">
            <div className="history-header">
                <h2>Trade History</h2>
                <div className="trade-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Trades</span>
                        <span className="stat-value">{trades.length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Profit/Loss</span>
                        <span className={`stat-value ${calculateTotalProfit() >= 0 ? 'profit' : 'loss'}`}>
                            ${calculateTotalProfit().toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="filter-buttons">
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
                                <h3>{trade.event.title}</h3>
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
                                    {new Date(trade.createdAt).toLocaleString()}
                                </span>
                                {trade.status === 'settled' && (
                                    <span className="settled-date">
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

export default TradeHistory;