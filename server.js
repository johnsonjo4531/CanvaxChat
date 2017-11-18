#!/usr/bin/env node
var express = require('express');
var app = express();
var path = require("path");

app.use(express.static('public'));

app.get('/', function (req, res) {
    console.log("Serving views/index.html")
    res.redirect('/public');
})

app.get('/public', function(req , res){
    console.log("Serving views/index.html")
    res.sendFile('index.html', {root: path.join(__dirname, 'views')});
  });

  app.get('/private', function(req , res){
    console.log("Serving views/index.html")
    res.sendFile('index.html', {root: path.join(__dirname, 'views')});
  });

var port = process.env.PORT || 8080;
var server = app.listen(port);
var io = require('socket.io')(server);

io.on('connection', function(socket){
    socket.on('drawing', function(msg){
        socket.broadcast.emit('drawing', msg);
    });
});

var publicNamespace = io.of("/public");
publicNamespace.on('connection', function(socket){
    console.log('someone connected');
    socket.on('drawing', function(msg){
        socket.broadcast.emit('drawing', msg);
    });
  });

var privateNamespace = io.of("/private");
privateNamespace.on('connection', function(socket){
    console.log('someone connected');
    socket.on('drawing', function(msg){
        socket.broadcast.emit('drawing', msg);
    });
});

console.log(`${new Date()}`);
console.log(`Server is listening on port ${port}`);