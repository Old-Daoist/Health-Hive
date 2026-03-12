const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

/* ===========================
   APP INITIALIZATION
=========================== */

const app = express();

/* ===========================
   HTTP SERVER (needed for Socket.IO)
=========================== */

const server = http.createServer(app);

/* ===========================
   SOCKET.IO INITIALIZATION
=========================== */

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make socket accessible everywhere
global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ===========================
   MIDDLEWARE
=========================== */

// Enable CORS for frontend (Vite default: 5173)
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===========================
   ROUTES
=========================== */

const authRoutes = require("./routes/auth.routes");
const discussionRoutes = require("./routes/discussion.routes");
const replyRoutes = require("./routes/reply.routes");
//const doctorRoutes = require("./routes/doctor.routes");
//const adminRoutes = require("./routes/admin.routes");
//const reportRoutes = require("./routes/report.routes");
//const moderationRoutes = require("./routes/moderation.routes");

app.use("/api/auth", authRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/replies", replyRoutes);
// app.use("/api/doctor", doctorRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/reports", reportRoutes);
// app.use("/api/moderation", moderationRoutes);

/* ===========================
   DATABASE CONNECTION
=========================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

/* ===========================
   HEALTH CHECK ROUTE
=========================== */

app.get("/", (req, res) => {
  res.json({ message: "Health Hive API running" });
});

/* ===========================
   SERVER START
=========================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});