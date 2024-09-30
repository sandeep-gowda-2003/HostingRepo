// https://socket.io/docs/v4/tutorial/api-overview

import express from "express";
import { Server } from "socket.io";
import http from "node:http";
import env from "dotenv";
import ejs from "ejs";
env.config();

// socketio runs on the http server in we use app.listen then express hides the server

let app = express();
let server = http.createServer(app);
let io = new Server(server);
app.set("view engine", ejs);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// this is triggered whenever there is a connection
io.on("connection", (socket) => {
  console.log("A user connected");

  //   syntax socket.on(eventname,argument1,argument2,....,callback)
  socket.on("message", (m) => {
    console.log("The message is : ", m);

    // you can braoadcast using this but need to use 'message' as event name
    // socket.send("message received successfully")

    //This is a form of broadcasting from server
    io.emit("reply", "Message received successfully");
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(process.env.PORT, () => console.log("http://localhost:" + "/"));
