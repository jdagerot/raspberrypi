var gpio = require("pi-gpio"),
	telldus = require('telldus'),
	q = require('q');

/**
device {
  id = 1
  name = "Höglampa vardagsrum"
  controller = 0
  protocol = "arctech"
  model = "codeswitch"
  parameters {
    # devices = ""
    house = "A"
    unit = "1"
    # code = ""
    # system = ""
    # units = ""
    # fade = ""
  }
}
*/

// The "grid" of LEDs
var lamps = {
	"1": {
		pin: 7,
		color: "Blå",
		css: "bulb-blue",
		type: "gpio"
	},
	"2": {
		pin: 11,
		color: "Red",
		css: "bulb-red",
		type: "gpio"
	},
	"3": {
		pin: 13,
		color: "Grön",
		css: "bulb-green",
		type: "gpio"

	},
	"4": {
		pin: 1, // This equivalents to ID in the telldus world
		name: "Höglampa vardagsrum",
		type: "telldus",
		css: "bulb-yellow"
	}

};

//todo 1 (general) +0:  We should not use "lamps" as a variable in the future
var devices = lamps;


// Eases up when going to production
function logme(obj) {
	console.log(obj);
}


// Called with two arguments, the pin and a callback
function toggleLamp(deviceId, successCB) {
	try {
		logme("Toggle device " + deviceId);
		device = devices[deviceId];
		if (device.type == "gpio") {
			gpio.read(device.pin, function(err, was) {
				var state = !was;
				logme("Writing to pin " + device.pin + "=" + state);
				gpio.write(device.pin, state, function(err) {
					successCB(device.deviceId, state);
				});
			});
		} else if (device.type == "telldus") {
			//todo 2 (general) +0: Add support for telldus devices
		}

	} catch (err) {
		logme(err);
		successCB("Error");
	}
}


// Server setup
var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

// Open up the GPIO-ports.
//todo 3 (general) +0: Make this aware of the devices list
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

	socket.emit("init", devices);
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


});

// Here we go.
http.listen(8080, function() {
	console.log('listening on *:8080');
});