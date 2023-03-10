const express = require("express");
const fs = require("fs");

// const io = require("socket.io")(8900, {
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });
const PORT = process.env.PORT || 8900;
const INDEX = "./index.html";

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// // const io = socketIO(server, {
// //   cors: {
// //     origin: "*",
// //   },
// // });

// let users = [];

// const addUser = (userId, socketId) => {
//   !users.some((user) => user.userId === userId) &&
//     users.push({ userId, socketId });
// };

// const removeUser = (socketId) => {
//   users = users.filter((user) => user.socketId !== socketId);
// };

// const getUser = (userId) => {
//   return users.find((user) => user.userId === userId);
// };

// io.on("connection", (socket) => {
//   console.log("A user Connected");
//   socket.on("addUser", (userId) => {
//     console.log("emit event");
//     addUser(userId, socket.id);
//     io.emit("getUsers", users);
//   });

//   socket.on("sendMessage", ({ senderId, receiverId, message }) => {
//     const user = getUser(receiverId);
//     console.log(message, "message from socket");
//     io.to(user.socketId).emit("getMessage", {
//       senderId,
//       message,
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("disconnect");
//     removeUser(socket.id);
//     io.emit("getUsers", users);
//   });
// });

const io = require("socket.io")(server, {
  cors: {
    origin: "https://appolonia-admin-uat.vercel.app/",
    //origin: "http://localhost:3000",
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { senderId, receiverId, message, conversationId, format, scanId } =
      data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending from socket to :", receiverId);
    console.log("Data in send message: ", data);
    console.log("active users", activeUsers);
    console.log("user", user);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
      console.log(data, "in receive message");
    }
  });

  socket.on("upload", (data) => {
    const { senderId, receiverId, conversationId, file } = data;
    console.log(file); // <Buffer 25 50 44 ...>

    const path = "/tmp/upload/" + Date.now() + ".png";
    // save the content to the disk, for example
    fs.writeFile(path, file, function (err, data) {
      if (err) {
        console.log(err, "error while uploading");
      } else {
        console.log(path, "path");
      }
    });
  });
});
