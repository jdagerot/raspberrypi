var gpio = require("pi-gpio");
var telldus = require('telldus');
// The "grid" of LEDs
var lamps = {
	"diods": [{
		pin: 7,
		color: "Röd"
	}, {
		pin: 11,
		color: "Gul"
	}, {
		pin: 13,
		color: "Grön"

	}],
	"telldus": {
		name: "Höglampa vardagsrum",
		type: "telldus"
	}

};

// Eases up when going to production
function logme(obj) {
	console.log(obj);
}


// Called with two arguments, the pin and a callback
function toggleLamp(pin, successCB) {
	try {
		logme("Toggle lamp on pin " + pin);
		gpio.read(pin, function(err, was) {
			var state = !was;
			logme("Writing to pin " + pin + "=" + state);
			gpio.write(pin, state, function(err) {
				successCB(pin, state);
			});
		});
	} catch (err) {
		logme(err);
		successCB("Error");
	}
}

// This is used once, when the client connects
function sendInitData(socket) {
	for (var lIDX in lamps.diods) {
		(function(pin) {
			gpio.read(pin, function(err, state) {
				logme("Init sending pin" + pin + " state " + (state ? true : false));
				socket.emit("status", {
					pin: pin,
					state: state ? true : false
				});
			})
		})(lamps.diods[lIDX].pin)

	}
}


// Server setup
var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

// Open up the GPIO-ports.
gpio.open(7, "out");
gpio.open(11, "out");
gpio.open(13, "out");

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendfile("index.html");
})


// Setting upp socket.io....
io.on('connection', function(socket) {
	console.log('a user connected, starting init task');
	sendInitData(socket);
	socket.on('ToggleLamp', function(pin, type) {
		toggleLamp(pin, function(pin, state) {
			socket.emit("status", {
				pin: pin,
				state: state
			});
			socket.broadcast.emit("status", {
				pin: pin,
				state: state
			});
		});
	});


	socket.on("BigLamp", function(args) {
		var deviceId = 1;
		logme("Got a BigLamp request");
		if(args==true) {
		telldus.turnOn(deviceId, function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log('deviceId is now ON');
			}

		});
		} else {
		telldus.turnOff(deviceId, function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log('deviceId is now ON');
			}

		});			
		}



	});
});

// Here we go.
http.listen(8080, function() {
	console.log('listening on *:8080');
});