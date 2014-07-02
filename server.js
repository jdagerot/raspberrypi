var gpio = require("pi-gpio");



var lamps = [{
		pin: 7,
		color: "Röd"
	}, {
		pin: 11,
		color: "Gul"
	}, {
		pin: 13,
		color: "Grön"
	},

];

function logme(obj) {
	console.log(obj);
}


function toggleLamp(pin, successCB) {
	try {
		logme("Toggle lamp on pin " + pin);
		gpio.read(pin, function(err, was) {
				var state = !was;
				logme("Writing to pin " + pin + "=" + state);
				gpio.write(pin, state, function(err) {
					logme(pin + ": " + state);
					successCB(pin, state);
				});
		});
	} catch (err) {
		logme(err);
		successCB("Error");
	}
}


function getInitStatus(socket) {
	for(lIDX in lamps) {
		l = lamps[lIDX];
		gpio.read(l.pin, function(err,state) {
			socket.emit("status", {
				pin: l.pin,
				state: state
			});
		})
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

app.get('/', function(req, res) {
	res.sendfile("index.html");
})

io.on('connection', function(socket) {
	console.log('a user connected');
	getInitStatus(socket);
	socket.on('ToggleLamp', function(pin) {
		toggleLamp(pin, function(pin, state) {
			socket.emit("status", {
				pin: pin,
				state: state
			});
			socket.broadcast.emit("status", {
				pin: pin,
				state: state
			})
		});
	})
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});