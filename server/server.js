import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";
import app from "./app.js";
import { createServer } from "node:http";
import connectDB from "./db/db.js";
import jwt from "jsonwebtoken";
import User from "./db/models/User.js";

const port = process.env.PORT || 4000;

const server = createServer(app);

console.log("CLIENT_URL from env:", process.env.CLIENT_URL);
// Force restart
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean),
    credentials: true,
  },
});

app.set("io", io);

const parseCookies = (cookieStr) => {
  const cookies = {};
  if (!cookieStr) return cookies;
  cookieStr.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0].trim();
    const val = parts.slice(1).join("=");
    cookies[name] = val;
  });
  return cookies;
};

// Track online users: Map of userId -> Set of socketId
const onlineUsers = new Map();

const dbConnection = async () => {
  await connectDB();
  try {
    await User.updateMany({}, { isOnline: false });
    console.log("Reset all users' online status to false on startup.");
  } catch (error) {
    console.error("Error resetting online status on startup:", error);
  }
}

dbConnection();

io.on("connection", async (socket) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies.accessToken;
    if (!token) {
      console.log(`Unauthorized socket connection: ${socket.id}`);
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log(`Invalid socket token: ${socket.id}`);
      return;
    }

    const userId = decoded.id || decoded._id;
    if (!userId) {
      console.log(`Socket token missing user ID: ${socket.id}`);
      return;
    }

    socket.userId = userId;
    console.log(`User authenticated: ${userId} with socket: ${socket.id}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    if (onlineUsers.get(userId).size === 1) {
      await User.findByIdAndUpdate(userId, { isOnline: true, lastActive: new Date() });
      socket.broadcast.emit("userOnline", { userId });
      console.log(`User ${userId} is now online`);
    }

    socket.on("joinChat", (chatId) => {
      const room = String(chatId);
      console.log(`Socket [${socket.id}] joining room [${room}]`);
      socket.join(room);
    });

    socket.on("leaveChat", (chatId) => {
      const room = String(chatId);
      console.log(`Socket [${socket.id}] leaving room [${room}]`);
      socket.leave(room);
    });

    socket.on("sendMessage", (data) => {
      const targetRoom = String(data.chatId);
      console.log(`Socket [${socket.id}] broadcasting message to room [${targetRoom}]`);
      io.to(targetRoom).emit("newMessage", data.message);
    });

    socket.on("editMessage", (data) => {
      const targetRoom = String(data.chatId);
      console.log(`Socket [${socket.id}] broadcasting edit to room [${targetRoom}]`);
      io.to(targetRoom).emit("messageEdited", data);
    });

    socket.on("coWatchSyncResponse", (data) => {
      const targetRoom = String(data.chatId);
      console.log(`Socket [${socket.id}] broadcasting coWatchSyncResponse to room [${targetRoom}]`);
      socket.to(targetRoom).emit("coWatchSyncResponded", data);
    });

    // Connection Sparks events
    socket.on("sparksEvent", (data) => {
      const targetRoom = String(data.chatId);
      console.log(`Socket [${socket.id}] broadcasting sparksEvent to room [${targetRoom}]`, data);
      socket.to(targetRoom).emit("sparksStateUpdate", data);
    });

    socket.on("bucketListUpdate", (data) => {
      const targetRoom = String(data.chatId);
      console.log(`Socket [${socket.id}] broadcasting bucketListUpdate to room [${targetRoom}]`, data);
      socket.to(targetRoom).emit("bucketListUpdated", data);
    });

    socket.on("sparksSyncRequest", (data) => {
      const targetRoom = String(data.chatId);
      console.log(`Socket [${socket.id}] broadcasting sparksSyncRequest to room [${targetRoom}]`);
      socket.to(targetRoom).emit("sparksSyncRequested", data);
    });

    socket.on("sparksSyncResponse", (data) => {
      const targetRoom = String(data.chatId);
      console.log(`Socket [${socket.id}] broadcasting sparksSyncResponse to room [${targetRoom}]`);
      socket.to(targetRoom).emit("sparksSyncResponded", data);
    });

    socket.on("deleteMessage", (data) => {
      const targetRoom = String(data.chatId);
      console.log(`Socket [${socket.id}] broadcasting delete to room [${targetRoom}]`);
      io.to(targetRoom).emit("messageDeleted", data);
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { isOnline: false, lastActive: new Date() });
          io.emit("userOffline", { userId });
          console.log(`User ${userId} went offline`);
        }
      }
    });

  } catch (error) {
    console.error("Error in socket connection handler:", error);
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
