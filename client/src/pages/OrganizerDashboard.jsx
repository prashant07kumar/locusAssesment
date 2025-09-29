import React, { useState, useEffect } from 'react';
import api from '../api';
import useAuth from '../hooks/useAuth';

const OrganizerDashboard = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // State for new event form
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const { data } = await api.get('/api/events');
        // Filter events where the current user is the organizer and organizer exists
        setMyEvents(data.filter(event => 
          event.organizer && event.organizer._id === user.id
        ));
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      const fetchRegistrations = async () => {
        try {
          const { data } = await api.get(`/api/registrations/event/${selectedEvent._id}`);
          setRegistrations(data);
        } catch (error) {
          console.error("Failed to fetch registrations", error);
        }
      };
      fetchRegistrations();
    }
  }, [selectedEvent]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/events', newEvent);
      setMyEvents([...myEvents, data]);
      setNewEvent({ title: '', description: '', date: '', location: '' });
      setShowEventForm(false);
    } catch (error) {
      console.error("Failed to create event", error);
    }
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async (regId, status) => {
    try {
      await api.put(`/api/registrations/${regId}`, { status });
      // Refresh registrations for the selected event
      const { data } = await api.get(`/api/registrations/event/${selectedEvent._id}`);
      setRegistrations(data);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) return <p>Loading your events...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showEventForm ? 'Cancel' : 'Create New Event'}
        </button>
      </div>

      {/* Create Event Form */}
      {showEventForm && (
        <form onSubmit={handleCreateEvent} className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleEventInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleEventInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="datetime-local"
                name="date"
                value={newEvent.date}
                onChange={handleEventInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={newEvent.location}
                onChange={handleEventInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Event
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Events</h2>
          <ul>
            {myEvents.map(event => (
              <li
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                className={`p-2 rounded cursor-pointer ${selectedEvent?._id === event._id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
              >
                {event.title}
              </li>
            ))}
          </ul>
        </div>
        {/* Registrations View */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          {selectedEvent ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Registrations for "{selectedEvent.title}"</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map(reg => (
                      <tr key={reg._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{reg.student.name}</div>
                              <div className="text-sm text-gray-500">{reg.student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                            reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                             'bg-yellow-100 text-yellow-800'
                           }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {reg.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button onClick={() => handleStatusUpdate(reg._id, 'approved')} className="text-green-600 hover:text-green-900">Approve</button>
                              <button onClick={() => handleStatusUpdate(reg._id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Select an event to see registrations.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;