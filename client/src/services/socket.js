import { io } from "socket.io-client";

// In development, Vite proxies /api → localhost:5000.
// For socket we connect directly to the server origin.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Connected to socket:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});