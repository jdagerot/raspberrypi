var gpio = require("pi-gpio");
var telldus = require('telldus');

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
		type: "tellfus"
	}

};

var devices = lamps; // We should not call it lamps in the future...

// Eases up when going to production
function logme(obj) {
	console.log(obj);
}


// Called with two arguments, the pin and a callback
function toggleDevice(deviceID, successCB) {
	try {
		logme("Toggle device " + deviceID);
		device = devices[deviceID];
		if (device.type == "gpio") {
			gpio.read(device.deviceID, function(err, was) {
				var state = !was;
				logme("Writing to pin " + device.deviceID + "=" + state);
				gpio.write(device.pin, state, function(err) {
					successCB(device.deviceID, state);
				});
			});
		} else if (device.type == "telldus") {
			telldus.turnOn(deviceID, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log('deviceID is now ON');
				}

			});
		}
	} catch (err) {
		logme(err);
		successCB("Error");
	}
}

function updateStateForAllDevices() {
	for (var index in devices) {
		(function(index) {
			var device = devices[index];
			if (device.type == "gpio") {
				gpio.read(device.pin, function(err, state) {
					device.state = state ? true : false
				})
			} else if(device.type=="telldus"){
				/// TODO: Fix status for telldus devices
			}
		})(index)
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
	res.sendfile("public/index.html");
})


// Setting upp socket.io....
io.on('connection', function(socket) {
	console.log('a user connected, starting init task');

	// Connection setup
	socket.emit("init", devices);

	//Turning on/off
	socket.on('toggleDevice', function(deviceID) {
		toggleDevice(deviceID, function(deviceID, state) {
			socket.emit("status", {
				deviceID: deviceID,
				pin: pin,
				state: state
			});
			socket.broadcast.emit("status", {
				deviceID: state,
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