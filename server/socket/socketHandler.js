const EventViewer = require('../models/EventViewer');
const mongoose = require('mongoose');

// Utility function to get current viewer count
async function getCurrentViewerCount(eventId) {
  try {
    const cutoffTime = new Date(Date.now() - 30000); // 30 seconds ago
    const count = await EventViewer.countDocuments({ 
      eventId,
      lastActive: { $gte: cutoffTime }
    });
    console.log(`Current viewer count for event ${eventId}: ${count} (cutoff time: ${cutoffTime.toISOString()})`);
    
    // Log active viewers for debugging
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

// Utility function to broadcast viewer count
async function broadcastViewerCount(io, eventId) {
  const count = await getCurrentViewerCount(eventId);
  io.to(`event:${eventId}`).emit('viewerUpdate', {
    eventId,
    currentViewers: count
  });
}

// Setup socket handlers
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    let currentEventId = null;
    let currentUserId = null;
    let viewerUpdateInterval = null;

    // Handle joining event
    socket.on('joinEvent', async ({ eventId, userId, userRole }) => {
      console.log(`Join event request - EventID: ${eventId}, UserID: ${userId}, Role: ${userRole}`);
      
      if (!eventId || !userId || !mongoose.Types.ObjectId.isValid(eventId)) {
        console.log('Invalid join event request - missing or invalid data');
        return;
      }

      try {
        // Leave previous event if any
        if (currentEventId) {
          console.log(`Leaving previous event: ${currentEventId}`);
          await handleLeaveEvent();
        }

        // Only track student viewers
        if (userRole === 'student') {
          console.log(`Student ${userId} joining event ${eventId}`);
          
          // Join socket room
          socket.join(`event:${eventId}`);
          currentEventId = eventId;
          currentUserId = userId;

          // Create or update viewer record
          const viewer = await EventViewer.findOneAndUpdate(
            { eventId, userId },
            { 
              socketId: socket.id,
              lastActive: new Date()
            },
            { upsert: true, new: true }
          );
          console.log(`Viewer record updated: ${viewer._id}`);

          // Clear existing interval if any
          if (viewerUpdateInterval) {
            clearInterval(viewerUpdateInterval);
          }

          // Start periodic updates of viewer count
          viewerUpdateInterval = setInterval(async () => {
            await broadcastViewerCount(io, eventId);
          }, 5000); // Update every 5 seconds

          // Broadcast initial viewer count
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

    // Handle heartbeat to keep viewer active
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

    // Handle leaving event
    async function handleLeaveEvent() {
      if (currentEventId && currentUserId) {
        try {
          // Remove viewer record
          await EventViewer.deleteOne({
            eventId: currentEventId,
            userId: currentUserId
          });

          // Leave socket room
          socket.leave(`event:${currentEventId}`);

          // Clear update interval
          if (viewerUpdateInterval) {
            clearInterval(viewerUpdateInterval);
            viewerUpdateInterval = null;
          }

          // Broadcast updated count
          await broadcastViewerCount(io, currentEventId);

          currentEventId = null;
          currentUserId = null;
        } catch (error) {
          console.error('Error in leaveEvent:', error);
        }
      }
    }

    // Handle explicit leave event
    socket.on('leaveEvent', handleLeaveEvent);

    // Handle disconnection
    socket.on('disconnect', handleLeaveEvent);
  });
}

module.exports = setupSocketHandlers;