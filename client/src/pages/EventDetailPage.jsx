import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';
import { Calendar, MapPin, Info } from 'lucide-react';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [registration, setRegistration] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventAndRegistration = async () => {
      try {
        const [eventRes, registrationRes] = await Promise.all([
          api.get(`/api/events/${id}`),
          user ? api.get(`/api/registrations/status/${id}`) : Promise.resolve(null)
        ]);
        setEvent(eventRes.data);
        if (registrationRes) {
          setRegistration(registrationRes.data);
        }
      } catch (err) {
        setError('Could not fetch event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventAndRegistration();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/api/registrations/register/${id}`);
      setMessage('Successfully registered! Your registration is pending approval.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to register.');
    }
  };
  
  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;
  if (!event) return <p className="text-center mt-8">Event not found.</p>;

  const getRegistrationStatus = () => {
    if (!user) return null;
    if (!registration) return 'not-registered';
    return registration.status;
  };

  const renderRegistrationButton = () => {
    const status = getRegistrationStatus();
    
    if (!user) {
      return (
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login to Register
        </button>
      );
    }

    switch (status) {
      case 'approved':
        return (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong>Registration Approved!</strong>
            <p>You're all set to attend this event.</p>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong>Registration Not Approved</strong>
            <p>Unfortunately, your registration was not approved for this event.</p>
          </div>
        );
      case 'pending':
        return (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
            <strong>Registration Pending</strong>
            <p>Your registration is currently under review.</p>
          </div>
        );
      default:
        return (
          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register for Event
          </button>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{event.title}</h1>
      <div className="space-y-4 text-gray-700 mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>{new Date(event.date).toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-500" />
          <span>Organizer: {event.organizer.name}</span>
        </div>
        
        <p className="text-gray-600 mt-4">{event.description}</p>
        
        <div className="mt-8">
          {message && (
            <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
              {message}
            </div>
          )}
          
          {renderRegistrationButton()}
        </div>
      </div>
```
    </div>
  );
};

export default EventDetailPage;