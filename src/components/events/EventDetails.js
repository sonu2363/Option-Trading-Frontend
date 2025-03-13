import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import eventsAPI from '../../api/events';
import tradesAPI from '../../api/trades';
import Spinner from '../common/Spinner';
import './Events.css';

const EventDetails = () => {
    const [event, setEvent] = useState(null);
    const [userTrades, setUserTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [amount, setAmount] = useState('');
    const [placingTrade, setPlacingTrade] = useState(false);
    
    const { id } = useParams();
    const { user } = useAuth();
    const socket = useWebSocket();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventDetails();
        if (user) {
            fetchUserTrades();
        }

        // WebSocket subscriptions
        if (socket) {
            socket.emit('subscribe_event', id);
            socket.on('event_update', handleEventUpdate);
            socket.on('odds_update', handleOddsUpdate);

            return () => {
                socket.emit('unsubscribe_event', id);
                socket.off('event_update');
                socket.off('odds_update');
            };
        }
    }, [id, user, socket]);

    const fetchEventDetails = async () => {
        try {
            const data = await eventsAPI.getEventById(id);
            setEvent(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch event details');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserTrades = async () => {
        try {
            const trades = await tradesAPI.getTradesByEvent(id);
            setUserTrades(trades);
        } catch (err) {
            console.error('Error fetching trades:', err);
        }
    };

    const handleEventUpdate = (data) => {
        if (data.eventId === id) {
            setEvent(prev => ({
                ...prev,
                ...data
            }));
        }
    };

    const handleOddsUpdate = (data) => {
        if (data.eventId === id) {
            setEvent(prev => ({
                ...prev,
                odds: data.odds
            }));
        }
    };

    const handlePlaceTrade = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!selectedOption || !amount) {
            setError('Please select an option and enter amount');
            return;
        }

        setPlacingTrade(true);
        setError(null);

        try {
            await tradesAPI.placeTrade({
                eventId: id,
                selectedOption,
                amount: Number(amount)
            });
            
            // Reset form and refresh trades
            setSelectedOption('');
            setAmount('');
            fetchUserTrades();
        } catch (err) {
            setError(err.message || 'Failed to place trade');
        } finally {
            setPlacingTrade(false);
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;
    if (!event) return <div className="error-message">Event not found</div>;

    return (
        <div className="event-details">
            <div className="event-header">
                <h1>{event.title}</h1>
                <span className={`status status-${event.status}`}>
                    {event.status}
                </span>
            </div>

            <div className="event-info">
                <div className="info-row">
                    <span>Type:</span>
                    <span>{event.type}</span>
                </div>
                <div className="info-row">
                    <span>Start Time:</span>
                    <span>{new Date(event.startTime).toLocaleString()}</span>
                </div>
                {event.endTime && (
                    <div className="info-row">
                        <span>End Time:</span>
                        <span>{new Date(event.endTime).toLocaleString()}</span>
                    </div>
                )}
            </div>

            <div className="odds-section">
                <h2>Current Odds</h2>
                <div className="odds-grid">
                    {event.odds.map((odd, index) => (
                        <button
                            key={index}
                            className={`odd-button ${selectedOption === odd.option ? 'selected' : ''}`}
                            onClick={() => setSelectedOption(odd.option)}
                            disabled={event.status !== 'live'}
                        >
                            <span className="option">{odd.option}</span>
                            <span className="value">{odd.value}</span>
                            <span className="timestamp">
                                Last updated: {new Date(odd.timestamp).toLocaleTimeString()}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {event.status === 'live' && user && (
                <div className="trade-section">
                    <h2>Place Trade</h2>
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="trade-form">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="1"
                            className="amount-input"
                        />
                        <button
                            onClick={handlePlaceTrade}
                            disabled={placingTrade || !selectedOption || !amount}
                            className="trade-button"
                        >
                            {placingTrade ? 'Placing Trade...' : 'Place Trade'}
                        </button>
                    </div>
                </div>
            )}

            {user && userTrades.length > 0 && (
                <div className="user-trades">
                    <h2>Your Trades</h2>
                    <div className="trades-grid">
                        {userTrades.map(trade => (
                            <div key={trade._id} className="trade-card">
                                <div className="trade-details">
                                    <span>Amount: ${trade.amount}</span>
                                    <span>Option: {trade.selectedOption}</span>
                                    <span>Odds: {trade.odds}</span>
                                    <span className={`status status-${trade.status}`}>
                                        {trade.status}
                                    </span>
                                </div>
                                {trade.status === 'settled' && (
                                    <div className="settlement-details">
                                        <span>Result: {trade.result}</span>
                                        <span>Settled Amount: ${trade.settledAmount}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {user?.role === 'admin' && event.status === 'live' && (
                <div className="admin-controls">
                    <button 
                        onClick={() => {
                            eventsAPI.updateEvent(id, { status: 'completed' });
                            fetchEventDetails();
                        }}
                        className="admin-button"
                    >
                        Complete Event
                    </button>
                </div>
            )}
        </div>
    );
};

export default EventDetails;