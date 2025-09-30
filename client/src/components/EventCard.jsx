import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import socket from '../socket/socket';

const EventCard = ({ event, viewerCount: propViewerCount }) => {
  const [currentViewers, setCurrentViewers] = useState(propViewerCount || 0);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  useEffect(() => {
    if (typeof propViewerCount === 'number') {
      setCurrentViewers(propViewerCount);
    }
  }, [propViewerCount]);

  useEffect(() => {
    if (!event?._id) return;

    // Handle socket connection changes
    const onConnect = () => {
      // console.log('EventCard: Socket connected');
      setSocketConnected(true);
      socket.emit('requestEventViewers', { eventId: event._id });
    };

    const onDisconnect = () => {
      console.log('EventCard: Socket disconnected');
      setSocketConnected(false);
    };

    // Listen for viewer updates
    const handleViewerUpdate = (data) => {
      if (data.eventId === event._id) {
        console.log(`EventCard: Updating viewer count for ${event.title} to:`, data.currentViewers);
        setCurrentViewers(data.currentViewers || 0);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('viewerUpdate', handleViewerUpdate);

    if (socket.connected) {
      console.log('EventCard: Requesting initial viewer count for event:', event._id);
      socket.emit('requestEventViewers', { eventId: event._id });
    }

    // Cleanup listeners when component unmounts
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('viewerUpdate', handleViewerUpdate);
    };
  }, [event?._id, event?.title]);

  if (!event) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{event.title}</h3>
          <div className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${
            socketConnected 
              ? 'text-green-600 bg-green-50' 
              : 'text-gray-500 bg-gray-100'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              socketConnected 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-gray-400'
            }`}></div>
            {currentViewers} viewing{!socketConnected && ' (offline)'}
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
            <span className="text-lg text-indigo-600">{event.attendeeCount || 0}</span>
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

