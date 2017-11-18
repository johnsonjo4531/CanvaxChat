#!/usr/bin/env node
var express = require('express');
var app = express(); 
var path = require("path");
var rooms = {
    public: new Set(),
    private: new Set()
}

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.redirect('/public-0');
})

app.get('/public-:id', function(req , res){
    console.log("Serving views/index.html")
    res.sendFile('index.html', {root: path.join(__dirname, 'views')});
  });

app.get('/private-:id', function(req , res){
    console.log("Serving views/index.html")
    res.sendFile('index.html', {root: path.join(__dirname, 'views')});
  });

app.get('/create-private-room', async function(req, res){
    var url = setNamespace('private', await getNewRoomNumber());
    res.redirect('/'+url);
});

async function getNewRoomNumber()
{
    var token = await random();
    while(rooms['private'].has(token))
    {
       token = await random();
    }

    return token;
}

async function random()
{
    return new Promise(res => {
        require('crypto').randomBytes(24, function(err, buffer){
            res(buffer.toString('hex'))
        });
    });
}

var port = process.env.PORT || 8080;
var server = app.listen(port);
var io = require('socket.io')(server);

io.on('connection', function(socket){
    socket.on('drawing', function(msg){
        socket.broadcast.emit('drawing', msg);
    });
});

setNamespace("public", 0);

function setNamespace(privacy, id){
    if(rooms[privacy].has(id))
    {
        return;
    }
    
    rooms[privacy].add(id);
    var namespace = io.of(`/${privacy}-${id}`);
    namespace.on('connection', function(socket){
        console.log('someone connected');
        socket.on('drawing', function(msg){
			socket.broadcast.emit('drawing', msg);
		});
		
		socket.on('chat-message', function(msg){
				socket.broadcast.emit('chat-message', msg);
		});
		
	  });
  return `${privacy}-${id}`;
};

var setPublicNamespace = (id)=>setNamespace("private", id);

var setPrivateNamespace = (id)=>setNamespace("public", id);

console.log(`${new Date()}`);
console.log(`Server is listening on port ${port}`);