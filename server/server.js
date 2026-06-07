import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";
import app from "./app.js";
import { createServer } from "node:http";
import connectDB from "./db/db.js";


const port = process.env.PORT || 4000;

const server=createServer(app);

console.log("CLIENT_URL from env:", process.env.CLIENT_URL);
// Force restart
const io=new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean),
    credentials: true,
  },
});

app.set("io", io);

const dbConnection = async() => {
  await connectDB();
}

dbConnection();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
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

  socket.on("deleteMessage", (data) => {
    const targetRoom = String(data.chatId);
    console.log(`Socket [${socket.id}] broadcasting delete to room [${targetRoom}]`);
    io.to(targetRoom).emit("messageDeleted", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
  
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
