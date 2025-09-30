// import React, { useState, useEffect } from 'react';
// import api from '../api';
// import socket from '../socket/socket';
// import EventCard from '../components/EventCard';

// const EventListPage = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     // Connect the socket when the component mounts
//     socket.connect();

//     const fetchEvents = async () => {
//       try {
//         const { data } = await api.get('/api/events');
//         setEvents(data);
//       } catch (err) {
//         setError('Could not fetch events.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEvents();

//     // Listener for real-time attendee updates
//     const handleAttendeeUpdate = (data) => {
//       console.log('Attendee update received:', data);
//       setEvents((prevEvents) =>
//         prevEvents.map((event) =>
//           event._id === data.eventId ? { ...event, attendeeCount: data.newCount } : event
//         )
//       );
//     };

//     socket.on('attendeeUpdate', handleAttendeeUpdate);

    
//     return () => {
//       socket.off('attendeeUpdate', handleAttendeeUpdate);
//       socket.disconnect();
//     };
//   }, []);

//   if (loading) return <p className="text-center mt-8">Loading events...</p>;
//   if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

//   return (
//     <div>
//       <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Upcoming Campus Events</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//         {events.map((event) => (
//           <EventCard key={event._id} event={event} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EventListPage;


import React, { useState, useEffect } from 'react';
import api from '../api';
import socket from '../socket/socket';
import EventCard from '../components/EventCard';

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/api/events');
      setEvents(data);
    } catch (err) {
      setError('Could not fetch events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    socket.connect();

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

    socket.on('attendeeUpdate', handleAttendeeUpdate);
    socket.on('registrationUpdate', handleRegistrationUpdate); 

    
    return () => {
      socket.off('attendeeUpdate', handleAttendeeUpdate);
      socket.off('registrationUpdate', handleRegistrationUpdate);
      socket.disconnect();
    };
  }, []);

  if (loading) return <p className="text-center mt-8">Loading events...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Upcoming Campus Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventListPage;