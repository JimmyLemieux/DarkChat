const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);

const axios = require("axios");

const {Server} = require('socket.io');

const io = new Server(server);

app.use(express.static('public'));

// key: socketId, value: {userimage, username}
const usrMap = new Map();

const queueArray = new Array();


io.on('connection', (socket) => {

    
    queueArray.forEach(item => {
        // socket listener for add message. Will populate the frontend!
        socket.emit("sendResp", item);
    });


    axios.get("https://randomuser.me/api/")
    .then(res => {
    let data = res.data.results[0];
    let user_name = data.login.username;
    let user_image = data.picture.large;
    if (!usrMap.has(socket.id)) {
        usrMap.set(socket.id, {user_name, user_image});
    }

    })
    .catch(err => {
    console.err("ERR:", err);
    });
    
    socket.on('typing', () => {
        let client_content = usrMap.get(socket.id);
        console.log("typing!");
        socket.broadcast.emit("usr_typing", client_content);
    });

    socket.on('disconnect', (_) => {
        usrMap.delete(socket.id);
    });

    socket.on('send', (args, callback) => {
        let messageContent = args;

        if (queueArray.length === 100) {
            queueArray.shift();
        }

        // send back an object containing {userimage, username, messageContent}
        let client_content = usrMap.get(socket.id);
        client_content.messageContent = messageContent;

        if (client_content !== undefined) {
            queueArray.push(client_content);
            callback(client_content); 
            socket.broadcast.emit("sendResp", client_content);
        }
    });
    console.log('connected!');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "chat.html"));
});

server.listen('3000', () => {
    console.log("The express app is listening on 3000!");
});