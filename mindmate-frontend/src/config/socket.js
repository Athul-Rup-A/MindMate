import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BASE_URL, {
  // path: "/socket.io/",
  transports: ["websocket", "polling"],
  withCredentials: false,
  autoConnect: true,
});

export default socket;