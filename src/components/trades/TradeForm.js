import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import tradesAPI from '../../api/trades';
import './Trades.css';

const TradeForm = ({ event, onTradeComplete }) => {
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

    const calculatePotentialWinnings = () => {
        if (!selectedOption || !amount) return 0;
        const selectedOdd = event.odds.find(odd => odd.option === selectedOption);
        return selectedOdd ? (Number(amount) * selectedOdd.value).toFixed(2) : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        if (!selectedOption || !amount) {
            setError('Please select an option and enter amount');
            return;
        }

        if (Number(amount) > user.balance) {
            setError('Insufficient balance');
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
            
            // Notify parent component
            onTradeComplete?.();
            
        } catch (err) {
            setError(err.message || 'Failed to place trade');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="trade-form">
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="odds-grid">
                {event.odds.map((odd, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`odd-button ${selectedOption === odd.option ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect(odd.option)}
                    >
                        <span className="option">{odd.option}</span>
                        <span className="value">{odd.value}</span>
                    </button>
                ))}
            </div>

            <div className="form-group">
                <label>Amount (Balance: ${user?.balance?.toFixed(2) || 0})</label>
                <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    min="1"
                    max={user?.balance}
                    className="amount-input"
                />
            </div>

            <div className="potential-winnings">
                Potential Winnings: ${calculatePotentialWinnings()}
            </div>

            <button 
                type="submit"
                className="submit-button"
                disabled={loading || !selectedOption || !amount}
            >
                {loading ? 'Placing Trade...' : 'Place Trade'}
            </button>
        </form>
    );
};

export default TradeForm;