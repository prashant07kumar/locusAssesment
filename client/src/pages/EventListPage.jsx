import React, { useState, useEffect } from 'react';
import api from '../api';
import socket from '../socket/socket';
import EventCard from '../components/EventCard';

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewerCounts, setViewerCounts] = useState({});

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/api/events');
      setEvents(data);
      data.forEach(event => {
        socket.emit('requestEventViewers', { eventId: event._id });
      });
    } catch (err) {
      setError('Could not fetch events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    fetchEvents();

    // Listener for real-time attendee updates from approvals/rejections
    const handleAttendeeUpdate = (data) => {
      console.log('Attendee update received:', data);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === data.eventId ? { ...event, attendeeCount: data.newCount } : event
        )
      );
    };

    const handleRegistrationUpdate = () => {
      console.log('Registration update received, refetching events.');
      fetchEvents();
    };

    const handleViewerUpdate = (data) => {
      setViewerCounts(prev => ({
        ...prev,
        [data.eventId]: data.currentViewers
      }));
    };

    // Socket event listeners
    socket.on('attendeeUpdate', handleAttendeeUpdate);
    socket.on('registrationUpdate', handleRegistrationUpdate);
    socket.on('viewerUpdate', handleViewerUpdate); 

    
    return () => {
      socket.off('attendeeUpdate', handleAttendeeUpdate);
      socket.off('registrationUpdate', handleRegistrationUpdate);
      socket.off('viewerUpdate', handleViewerUpdate);
    };
  }, []);

  if (loading) return <p className="text-center mt-8">Loading events...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Upcoming Campus Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <EventCard 
            key={event._id} 
            event={event} 
            viewerCount={viewerCounts[event._id]}
          />
        ))}
      </div>
    </div>
  );
};

export default EventListPage;