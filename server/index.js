var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8888 });

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('weebo-control', function(msg){
        console.log('message: ' + msg);
        io.emit('weebo-control', msg);
    });

    socket.on('frame',function(data){
      socket.broadcast.emit('frame',data);
    }); 
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
