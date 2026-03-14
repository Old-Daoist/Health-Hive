const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

/* ── Optional security packages (install before deploying) ── */
let helmet, rateLimit;
try { helmet       = require("helmet");                  } catch {}
try { rateLimit    = require("express-rate-limit");     } catch {}

const app    = express();
const server = http.createServer(app);

/* ── Allowed origins (add your prod domain here before deploying) ── */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",").map(o => o.trim());

/* ── Socket.IO ── */
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ["GET","POST"], credentials: true },
});
global.io = io;

io.on("connection", (socket) => {
  socket.on("joinUserRoom",   (userId)        => socket.join(userId));
  socket.on("joinDiscussion", (discussionId)  => socket.join(`discussion:${discussionId}`));
  socket.on("leaveDiscussion",(discussionId)  => socket.leave(`discussion:${discussionId}`));
  socket.on("disconnect", () => {});
});

/* ── Security headers (helmet) ── */
if (helmet) app.use(helmet({ crossOriginEmbedderPolicy: false }));

/* ── CORS ── */
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));

/* ── Body parsing ── */
app.use(express.json({ limit: "10kb" }));

/* ── Static uploads ── */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ── Routes ── */
const authRoutes         = require("./routes/auth.routes");
const discussionRoutes   = require("./routes/discussion.routes");
const replyRoutes        = require("./routes/reply.routes");
const messageRoutes      = require("./routes/message.routes");
const notificationRoutes = require("./routes/notification.routes");

app.use("/api/auth",          authRoutes);
app.use("/api/discussions",   discussionRoutes);
app.use("/api/replies",       replyRoutes);
app.use("/api/messages",      messageRoutes);
app.use("/api/notifications", notificationRoutes);

/* ── Health check ── */
app.get("/", (req, res) => res.json({ message: "Health Hive API running" }));

/* ── DB ── */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => { console.error("MongoDB error:", err.message); process.exit(1); });

/* ── Start ── */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));