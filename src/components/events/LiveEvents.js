import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';
import eventsAPI from '../../api/events';
import tradesAPI from '../../api/trades';
import Spinner from '../common/Spinner';
import './Events.css';

const LiveEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const socket = useWebSocket();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLiveEvents();

        if (socket) {
            socket.on('event_update', handleEventUpdate);
            socket.on('odds_update', handleOddsUpdate);

            return () => {
                socket.off('event_update');
                socket.off('odds_update');
            };
        }
    }, [socket]);

    const fetchLiveEvents = async () => {
        try {
            const response = await eventsAPI.getLiveEvents();
            setEvents(response);
        } catch (err) {
            setError(err.message || 'Failed to fetch live events');
        } finally {
            setLoading(false);
        }
    };

    const handleEventUpdate = (data) => {
        setEvents(prevEvents => 
            prevEvents.map(event => 
                event._id === data.eventId ? { ...event, ...data } : event
            )
        );
    };

    const handleOddsUpdate = (data) => {
        setEvents(prevEvents => 
            prevEvents.map(event => 
                event._id === data.eventId ? { ...event, odds: data.odds } : event
            )
        );
    };

    const handlePlaceTrade = async (eventId, selectedOption, amount) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await tradesAPI.placeTrade({
                eventId,
                selectedOption,
                amount: Number(amount)
            });
            // Optionally show success message
        } catch (err) {
            setError(err.message || 'Failed to place trade');
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;
    if (events.length === 0) return <div className="no-events">No live events available</div>;

    return (
        <div className="live-events-container">
            <h1>Live Events</h1>
            
            <div className="live-events-grid">
                {events.map(event => (
                    <div 
                        key={event._id} 
                        className={`live-event-card ${selectedEvent?._id === event._id ? 'selected' : ''}`}
                        onClick={() => setSelectedEvent(event)}
                    >
                        <div className="event-header">
                            <h3>{event.title}</h3>
                            <div className="live-indicator"></div>
                        </div>

                        <div className="event-info">
                            <span className="event-type">{event.type}</span>
                            <span className="event-time">
                                Started: {new Date(event.startTime).toLocaleString()}
                            </span>
                        </div>

                        <div className="odds-grid">
                            {event.odds.map((odd, index) => (
                                <div key={index} className="odd-item">
                                    <span className="option">{odd.option}</span>
                                    <span className="value">{odd.value}</span>
                                    <span className="timestamp">
                                        Updated: {new Date(odd.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="event-actions">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/events/${event._id}`);
                                }}
                                className="details-button"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveEvents;