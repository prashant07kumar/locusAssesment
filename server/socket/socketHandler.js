const EventViewer = require('../models/EventViewer');
const mongoose = require('mongoose');

async function getCurrentViewerCount(eventId) {
  try {
    const cutoffTime = new Date(Date.now() - 30000); // 30 seconds ago
    const count = await EventViewer.countDocuments({ 
      eventId,
      lastActive: { $gte: cutoffTime }
    });
    console.log(`Current viewer count for event ${eventId}: ${count} (cutoff time: ${cutoffTime.toISOString()})`);
    
    const activeViewers = await EventViewer.find({
      eventId,
      lastActive: { $gte: cutoffTime }
    });
    console.log('Active viewers:', activeViewers.map(v => ({
      userId: v.userId,
      lastActive: v.lastActive,
      socketId: v.socketId
    })));
    
    return count;
  } catch (error) {
    console.error('Error getting viewer count:', error);
    return 0;
  }
}

async function broadcastViewerCount(io, eventId) {
  const count = await getCurrentViewerCount(eventId);
  io.to(`event:${eventId}`).emit('viewerUpdate', {
    eventId,
    currentViewers: count
  });
}

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    let currentEventId = null;
    let currentUserId = null;
    let viewerUpdateInterval = null;

    socket.on('joinEvent', async ({ eventId, userId, userRole }) => {
      console.log(`Join event request - EventID: ${eventId}, UserID: ${userId}, Role: ${userRole}`);
      
      if (!eventId || !userId || !mongoose.Types.ObjectId.isValid(eventId)) {
        console.log('Invalid join event request - missing or invalid data');
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

          const viewer = await EventViewer.findOneAndUpdate(
            { eventId, userId },
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
          await EventViewer.findOneAndUpdate(
            { eventId: currentEventId, userId: currentUserId },
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
          await EventViewer.deleteOne({
            eventId: currentEventId,
            userId: currentUserId
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