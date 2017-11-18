#!/usr/bin/env node
var express = require('express');
var app = express();
var path = require("path");

app.use(express.static('public'));

// app.get('/', function (req, res) {
//     console.log("Serving views/index.html")
//     res.sendFile('index.html', { root: path.join(__dirname, '/public') });
// })

var server = app.listen(8080);
var io = require('socket.io')(server);

io.on('connection', function(socket){
    socket.on('video stream send', function(msg){
        socket.emit('video stream receive', msg);
    });
});


console.log((new Date()) + ' Server is listening on port 8080');