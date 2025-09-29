import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL;
const socket = io(URL, {
  autoConnect: false // We will connect manually when the app loads
});

export default socket;