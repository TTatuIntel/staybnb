"use client";

import { io, type Socket } from "socket.io-client";
import { API_URL } from "./api";

let socket: Socket | null = null;

/** Lazily-created shared Socket.IO connection (cookie auth). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

/** Reconnect so the server picks up a new auth cookie after login/logout. */
export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
