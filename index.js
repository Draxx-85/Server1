let io = require('socket.io')(process.env.PORT || 8080);

var Player = require('./Classes/Player');

console.log('Server has started');

var players = [];
var sockets = [];

io.of('/');
io.on('connection', function(socket){
    console.log('Connection made');

    var player = new Player();
    var thisPlayerID = player.id;

    players[thisPlayerID] = player;
    sockets[thisPlayerID] = socket;

    //tell the client that this is our id for the server
    socket.emit('register' , {id : thisPlayerID} );
    socket.emit('spawn' , player); //tell myself i have spawn
    socket.broadcast.emit('spawn' , player); //tell others

    //tell myself about others
    for(var playerID in players)
    {
        if(playerID != thisPlayerID)
        {
            socket.emit('spawn',players[playerID]);
        }
    }

    socket.on('updatePosition', function(data){
        player.position.x = parseFloat(data.position._x);
        player.position.y = parseFloat(data.position._y);
        player.position.z = parseFloat(data.position._z);
        var d = {
            id : thisPlayerID,
            position : {
                x : player.position.x,
                y : player.position.y,
                z : player.position.z,
            }
        }
        console.log(d);
        socket.broadcast.emit('updatePosition' ,d);
    });

    
    //Disconnect//
    socket.on('disconnect', function()
    {
        console.log('A player has disconnected');
        delete players[thisPlayerID];
        delete sockets[thisPlayerID];
        socket.broadcast.emit('disconnected' , player);
    });
});