var gpio = require("pi-gpio");



var lamps = [{
		port: 7,
		color: "Röd"
	}, {
		port: 11,
		color: "Gul"
	}, {
		port: 13,
		color: "Grön"
	},

];


function toggleLamp(pin, successCB) {
	try {
	gpio.read(pin, function(err, was) {
		state = !was;
		gpio.write(pin, state, function(){
			successCB(pin, state);
		});
	});
} catch(err) {
	successCB("Error");
}
}


var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);


gpio.open(7, "out");
gpio.open(11, "out");
gpio.open(13, "out");
gpio.open(22, "in");

app.get('/', function(req,res){
	res.sendfile("index.html");
})

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('ToggleLamp', function(pin) {
	toggleLamp(pin, function(pin, state){
		socket.emit("status", {pin:pin, state:state});
		socket.broadcast.emit("status", {pin:pin, state:state})
	});
})
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});