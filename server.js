const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { getToken } = require("next-auth/jwt");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Expose IO globally so Next.js API routes can broadcast securely
  global.io = io;

  // NextAuth JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const req = socket.request;
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token && token.sub) {
        socket.userId = token.sub;
        return next();
      }
      return next(new Error("unauthorized"));
    } catch (err) {
      return next(new Error("unauthorized"));
    }
  });

  const userSocketMap = new Map();

  io.on("connection", (socket) => {
    const userId = socket.userId;
    
    // Auto-join the user's secure room
    socket.join(userId);

    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    io.emit("online-users", Array.from(userSocketMap.keys()));

    socket.on("typing", (data) => {
      // Prevent spoofing by enforcing sender identity
      if (data.senderId !== userId) return;
      io.to(data.receiverId).emit("typing", data);
    });

    socket.on("disconnect", () => {
      const sockets = userSocketMap.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketMap.delete(userId);
          io.emit("online-users", Array.from(userSocketMap.keys()));
        }
      }
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
