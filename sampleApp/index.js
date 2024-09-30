import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "node:http";
// import { pushMessage } from "./src/controllers/privateMessage.js";
// import env from "dotenv";
// import router from "./src/router/route.js";

// env.config();
let app = express();
let server = http.createServer(app);
let io = new Server(server);
let port = process.env.APP_PORT;
let activeUsers = {};
let socketId;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use("/", router);

io.use((socket, next) => {
  socket.username = socket.handshake.auth.username;
  activeUsers[socket.username] = socket.id;
  socketId = socket.id;
  next();
});

io.on("connection", (socket) => {
  socket.on("refreshActiveUsers", () => {
    io.emit("activeUsers", activeUsers);
  });
  io.emit("activeUsers", activeUsers);
  socket.on("message", (message, username) => {
    pushMessage(socket.username, username, message);
    socket.to(activeUsers[username]).emit("message", message, socket.username);
  });
  socket.on("disconnectUser", () => socket.disconnect());
  socket.on("disconnect", () => {
    socket.broadcast.emit("deactivateUsers", socket.username);
    delete activeUsers[socket.username];
  });
});

server.listen(port);

function getUsers() {
  return activeUsers;
}

export { getUsers };

// https://jsonplaceholder.typicode.com/photos
