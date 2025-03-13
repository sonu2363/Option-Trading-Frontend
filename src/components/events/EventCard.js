import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import tradesAPI from '../../api/trades';
import './Events.css';

const EventCard = ({ event }) => {
    const [selectedOption, setSelectedOption] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setError('');
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0)) {
            setAmount(value);
            setError('');
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

        setLoading(true);
        setError('');

        try {
            await tradesAPI.placeTrade({
                eventId: event._id,
                selectedOption,
                amount: Number(amount)
            });
            
            // Reset form
            setSelectedOption('');
            setAmount('');
            // Show success message or notification
        } catch (err) {
            setError(err.message || 'Failed to place trade');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'live': return 'status-live';
            case 'upcoming': return 'status-upcoming';
            case 'completed': return 'status-completed';
            default: return '';
        }
    };

    return (
        <div className="event-card">
            <div className="event-header">
                <h3>{event.title}</h3>
                <span className={`status ${getStatusColor(event.status)}`}>
                    {event.status}
                </span>
            </div>

            <div className="event-info">
                <span className="event-type">{event.type}</span>
                <span className="event-time">
                    {new Date(event.startTime).toLocaleString()}
                </span>
            </div>

            <div className="odds-container">
                {event.odds.map((odd, index) => (
                    <button
                        key={index}
                        className={`odd-button ${selectedOption === odd.option ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect(odd.option)}
                        disabled={event.status !== 'live'}
                    >
                        <span className="option">{odd.option}</span>
                        <span className="value">{odd.value}</span>
                    </button>
                ))}
            </div>

            {event.status === 'live' && user && (
                <div className="trade-form">
                    <input
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                        min="1"
                        className="amount-input"
                    />
                    <button
                        onClick={handlePlaceTrade}
                        disabled={loading || !selectedOption || !amount}
                        className="trade-button"
                    >
                        {loading ? 'Placing Trade...' : 'Place Trade'}
                    </button>
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <button 
                onClick={() => navigate(`/events/${event._id}`)}
                className="details-button"
            >
                View Details
            </button>
        </div>
    );
};

export default EventCard;