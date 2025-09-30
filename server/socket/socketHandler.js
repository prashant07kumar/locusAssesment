const EventViewer = require('../models/EventViewer');
const mongoose = require('mongoose');

async function getCurrentViewerCount(eventId) {
  try {
    // Validate eventId
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      console.log('Invalid eventId provided to getCurrentViewerCount:', eventId);
      return 0;
    }
    const eventObjectId = new mongoose.Types.ObjectId(eventId);
    
    // Use server's current time with 30-second buffer
    const cutoffTime = new Date(Date.now() - 30000); // 30 seconds ago
    
    const count = await EventViewer.countDocuments({ 
      eventId: eventObjectId,
      lastActive: { $gte: cutoffTime }
    });
    
    return Math.max(0, count); // Ensure non-negative
  } catch (error) {
    return 0;
  }
}

async function broadcastViewerCount(io, eventId) {
  try {
    const count = await getCurrentViewerCount(eventId);
    io.emit('viewerUpdate', {
      eventId: eventId.toString(), // Ensure string format for client
      currentViewers: count
    });
    
    return count;
  } catch (error) {
    console.error('❌ Error broadcasting viewer count:', error);
    return 0;
  }
}

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {

    let currentEventId = null;
    let currentUserId = null;
    let viewerUpdateInterval = null;
    socket.on('ping', () => {
      socket.emit('pong');
    });

    socket.on('requestEventViewers', async ({ eventId }) => {
      if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        return;
      }
      console.log(`📊 Received request for viewer count for event: ${eventId}`);
      await broadcastViewerCount(io, eventId);
    });

    socket.on('joinEvent', async ({ eventId, userId, userRole }) => {
      
      if (!eventId || !userId || !mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return;
      }

      try {
        if (currentEventId) {
          console.log(`Leaving previous event: ${currentEventId}`);
          await handleLeaveEvent();
        }

        if (userRole === 'student') {
          console.log(`Student ${userId} joining event ${eventId}`);
  
          socket.join(`event:${eventId}`);
          currentEventId = eventId;
          currentUserId = userId;

          const eventObjectId = new mongoose.Types.ObjectId(eventId);
          const userObjectId = new mongoose.Types.ObjectId(userId);

          const viewer = await EventViewer.findOneAndUpdate(
            { eventId: eventObjectId, userId: userObjectId },
            { 
              socketId: socket.id,
              lastActive: new Date()
            },
            { upsert: true, new: true }
          );
          console.log(`Viewer record updated: ${viewer._id}`);

          if (viewerUpdateInterval) {
            clearInterval(viewerUpdateInterval);
          }

          viewerUpdateInterval = setInterval(async () => {
            await broadcastViewerCount(io, eventId);
          }, 5000); 

          const currentCount = await getCurrentViewerCount(eventId);
          console.log(`Broadcasting initial viewer count for event ${eventId}: ${currentCount}`);
          await broadcastViewerCount(io, eventId);
        } else {
          console.log(`Non-student user ${userId} joined - not tracking as viewer`);
        }
      } catch (error) {
        console.error('Error in joinEvent:', error);
      }
    });

    socket.on('heartbeat', async () => {
      if (currentEventId && currentUserId) {
        try {
          const eventObjectId = new mongoose.Types.ObjectId(currentEventId);
          const userObjectId = new mongoose.Types.ObjectId(currentUserId);
          await EventViewer.findOneAndUpdate(
            { eventId: eventObjectId, userId: userObjectId },
            { lastActive: new Date() }
          );
        } catch (error) {
          console.error('Error updating heartbeat:', error);
        }
      }
    });

    async function handleLeaveEvent() {
      if (currentEventId && currentUserId) {
        try {
          const eventObjectId = new mongoose.Types.ObjectId(currentEventId);
          const userObjectId = new mongoose.Types.ObjectId(currentUserId);
          
          await EventViewer.deleteOne({
            eventId: eventObjectId,
            userId: userObjectId
          });

          socket.leave(`event:${currentEventId}`);

          if (viewerUpdateInterval) {
            clearInterval(viewerUpdateInterval);
            viewerUpdateInterval = null;
          }

          await broadcastViewerCount(io, currentEventId);

          currentEventId = null;
          currentUserId = null;
        } catch (error) {
          console.error('Error in leaveEvent:', error);
        }
      }
    }

    socket.on('leaveEvent', handleLeaveEvent);

    socket.on('disconnect', handleLeaveEvent);
  });
}

module.exports = setupSocketHandlers;