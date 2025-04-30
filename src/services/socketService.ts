
import { io, Socket } from "socket.io-client";

// Define the base URL for the socket connection
// In production, you would use your actual backend URL
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:50515";

let socket: Socket | null = null;

// Initialize the socket connection
export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    // Log connection events for debugging
    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  return socket;
};

// Get the existing socket or create a new one
export const getSocket = (): Socket => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Disconnect the socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
};
