const express = require("express");

const io = require("socket.io")(8900, {
  cors: {
    origin: "*",
  },
});
// const PORT = process.env.PORT || 3010;
// const INDEX = "./index.html";

// const server = express()
//   .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
//   .listen(PORT, () => console.log(`Listening on ${PORT}`));

// const io = socketIO(server, {
//   cors: {
//     origin: "*",
//   },
// });

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A user Connected");
  socket.on("addUser", (userId) => {
    console.log("emit event");
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const user = getUser(receiverId);
    console.log(message);
    io.to(user?.socketId).emit("getMessage", {
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
