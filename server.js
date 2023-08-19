const path = require("path");
const http = require("http");
const express = require("express");
const socket = require("socket.io");
const formatmessages = require("./utils/messages");
const {userJoin, getCurrentUser, userLeaves, getRoomUsers } = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socket(server);

//set static folder
app.use(express.static(path.join(__dirname, "public")))


//run when client connects 
io.on('connection', socket => {
    const chatName = "babblehub bot";
    // console.log("New WS connection.....");

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //welcome current user
        socket.emit('message', formatmessages(chatName,'Welcome to BabbleHub!'));//single client

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatmessages(chatName, `${user.username} has joined the chat`)); // all except the single client
    
        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room : user.room,
            users : getRoomUsers(user.room)
        });

    });

    //listen to chat message
    socket.on('chatmessage', msg => {
        const user = getCurrentUser(socket.id);
        // console.log("this is user",user);
        io.to(user.room).emit('message',formatmessages(user.username, msg));
    });

    //runs when user disconnects
    socket.on('disconnect', () => {
        const user = userLeaves(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatmessages(chatName, ` ${user.username} has left the chat`));   // all the clients

             //send users and room info
        io.to(user.room).emit('roomUsers', {
            room : user.room,
            users : getRoomUsers(user.room)
        });
        }
    });

        

});

var port = 3000 || process.env.PORT;
server.listen(port, ()=> console.log(`server is running on ${port}`));