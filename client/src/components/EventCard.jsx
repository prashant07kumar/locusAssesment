import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Eye } from 'lucide-react';
import socket from '../socket/socket';

const EventCard = ({ event }) => {
  const [currentViewers, setCurrentViewers] = useState(0);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  useEffect(() => {
    // Handle socket connection changes
    const onConnect = () => {
      console.log('Socket connected in EventCard');
      setSocketConnected(true);
      // Re-request viewer count when reconnected
      socket.emit('requestEventViewers', { eventId: event._id });
    };

    const onDisconnect = () => {
      console.log('Socket disconnected in EventCard');
      setSocketConnected(false);
    };

    // Listen for connection events
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Request initial viewer count
    if (socketConnected) {
      console.log('Requesting initial viewer count for event:', event._id);
      socket.emit('requestEventViewers', { eventId: event._id });
    }

    // Listen for viewer updates
    const handleViewerUpdate = (data) => {
      console.log('Received viewer update:', data);
      if (data.eventId === event._id) {
        console.log(`Updating viewer count for ${event.title} to:`, data.currentViewers);
        setCurrentViewers(data.currentViewers);
      }
    };

    socket.on('viewerUpdate', handleViewerUpdate);

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      if (socketConnected) {
        console.log('Requesting periodic viewer count update for:', event._id);
        socket.emit('requestEventViewers', { eventId: event._id });
      }
    }, 10000); // Refresh every 10 seconds

    // Cleanup listeners when component unmounts
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('viewerUpdate', handleViewerUpdate);
      clearInterval(refreshInterval);
    };
  }, [event._id, event.title, socketConnected]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
          <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
            <Eye className="w-4 h-4 mr-1 text-blue-500" />
            <span className="text-sm text-blue-600 font-medium">{currentViewers}</span>
          </div>
        </div>
        <div className="space-y-3 text-gray-600 text-sm">
          <p className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <p className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
            {event.location}
          </p>
          <p className="flex items-center font-semibold">
            <Users className="w-4 h-4 mr-2 text-indigo-500" />
            <span className="text-lg text-indigo-600">{event.attendeeCount}</span>
            <span className="ml-1">Approved Attendees</span>
          </p>
        </div>
        <div className="mt-6">
          <Link
            to={`/event/${event._id}`}
            className="w-full text-center block bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

