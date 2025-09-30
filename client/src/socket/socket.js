import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create socket with robust configuration
const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
  transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
  upgrade: true,
  forceNew: false
});

// Connection status tracking
let isConnected = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  isConnected = true;
  reconnectAttempts = 0;
  
  // Emit a ping to verify connection
  socket.emit('ping');
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
  isConnected = false;
  
  // Auto-reconnect for specific reasons
  if (reason === 'io server disconnect') {
    console.log('🔄 Server disconnected, attempting to reconnect...');
    socket.connect();
  }
});

socket.on('connect_error', (error) => {
  console.error('🚫 Socket connection error:', error.message);
  reconnectAttempts++;
  
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error('❌ Max reconnection attempts reached. Please refresh the page.');
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  reconnectAttempts = 0;
});

socket.on('reconnect_error', (error) => {
  console.error('🚫 Socket reconnection error:', error.message);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 Reconnection attempt', attemptNumber);
});

socket.on('pong', () => {
  console.log('🏓 Pong received - connection verified');
});

// Utility functions
socket.getConnectionStatus = () => isConnected;
socket.getReconnectAttempts = () => reconnectAttempts;

// Enhanced emit with connection check
const originalEmit = socket.emit;
socket.emit = function(event, data, callback) {
  if (!socket.connected) {
    console.warn(`⚠️ Attempting to emit '${event}' while disconnected. Queuing for retry...`);
    
    // Queue the emission for when we reconnect
    const retryEmit = () => {
      if (socket.connected) {
        originalEmit.call(socket, event, data, callback);
        socket.off('connect', retryEmit);
      }
    };
    socket.on('connect', retryEmit);
    return socket;
  }
  
  return originalEmit.call(socket, event, data, callback);
};

export default socket;