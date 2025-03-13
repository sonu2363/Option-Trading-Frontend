import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import eventsAPI from '../../api/events';
import EventCard from './EventCard';
import Spinner from '../common/Spinner';
import './Events.css';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, live, upcoming, completed
    const socket = useWebSocket();

    useEffect(() => {
        fetchEvents();

        if (socket) {
            socket.on('event_update', handleEventUpdate);
            socket.on('odds_update', handleOddsUpdate);

            return () => {
                socket.off('event_update');
                socket.off('odds_update');
            };
        }
    }, [socket]);

    const fetchEvents = async () => {
        try {
            const data = await eventsAPI.getAllEvents();
            setEvents(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch events');
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

    const getFilteredEvents = () => {
        switch (filter) {
            case 'live':
                return events.filter(event => event.status === 'live');
            case 'upcoming':
                return events.filter(event => event.status === 'upcoming');
            case 'completed':
                return events.filter(event => event.status === 'completed');
            default:
                return events;
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    const filteredEvents = getFilteredEvents();

    return (
        <div className="events-container">
            <div className="events-header">
                <h1>Events</h1>
                <div className="filter-buttons">
                    <button 
                        className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Events
                    </button>
                    <button 
                        className={`filter-button ${filter === 'live' ? 'active' : ''}`}
                        onClick={() => setFilter('live')}
                    >
                        Live Events
                    </button>
                    <button 
                        className={`filter-button ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming Events
                    </button>
                    <button 
                        className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed Events
                    </button>
                </div>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="no-events">
                    <p>No {filter !== 'all' ? filter : ''} events available</p>
                </div>
            ) : (
                <div className="events-grid">
                    {filteredEvents.map(event => (
                        <EventCard 
                            key={event._id} 
                            event={event} 
                            onUpdate={handleEventUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;