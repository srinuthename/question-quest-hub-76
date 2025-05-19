
import { io } from "socket.io-client";

// Get backend URL from environment variable
const getBackendUrl = () => {
  const envBackendUrl = import.meta.env.VITE_BACKEND_URL;
  
  // If environment variable is set, use it
  if (envBackendUrl) {
    return envBackendUrl;
  }
  
  // For local development - check if running on localhost
  if (window.location.hostname === "localhost") {
    return "http://localhost:50515"; // Fallback port
  }
  
  // For production - use the deployed backend URL or infer from current domain
  const currentDomain = window.location.hostname.split('.').slice(-2).join('.');
  return `https://backendgcube.${currentDomain}`;
};

// Create socket instance
export const socket = io(getBackendUrl(), {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Add logging for debugging
socket.on("connect", () => {
  console.info("Socket connected with ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.info("Socket disconnected:", reason);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// Export a function to emit events with error handling
export const emitEvent = (eventName: string, data: any) => {
  try {
    console.info(`Emitting ${eventName} with data:`, data);
    socket.emit(eventName, data);
    return true;
  } catch (error) {
    console.error(`Error emitting ${eventName}:`, error);
    return false;
  }
};

// Function to stop a game
export const stopGame = async (gameId: string) => {
  try {
    const response = await fetch(`${getBackendUrl()}/api/quizgames/${gameId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to stop game: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error stopping game:', error);
    throw error;
  }
};
