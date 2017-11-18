#!/usr/bin/env node
var express = require('express');
var app = express();
var path = require("path");

app.use(express.static('public'));

app.get('/', function (req, res) {
    console.log("Serving views/index.html")
    res.sendFile('index.html', { root: path.join(__dirname, '/views') });
})

var server = app.listen(8080);
var io = require('socket.io')(server);

io.on('connection', function(socket){
    socket.on('drawing', function(msg){
        socket.broadcast.emit('drawing', msg);
    });
});


console.log((new Date()) + ' Server is listening on port 8080');