var gpio = require("pi-gpio"),
	telldus = require('telldus'),
	Q = require('q');

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
		type: "gpio",
		deviceId: 1
	},
	"2": {
		pin: 11,
		color: "Red",
		css: "bulb-red",
		type: "gpio",
		deviceId: 2
	},
	"3": {
		pin: 13,
		color: "Grön",
		css: "bulb-green",
		type: "gpio",
		deviceId: 3

	},
	"4": {
		pin: 1, // This equivalents to ID in the telldus world
		name: "Höglampa vardagsrum",
		type: "telldus",
		css: "bulb-yellow",
		deviceId: 4
	}

};

//todo 1 (general) +0:  We should not use "lamps" as a variable in the future
var devices = lamps;

for(d in devices) {
	device = devices[d];
	if(device.type=="gpio") {
		gpio.open(device.pin,"out");
	}
}

// Eases up when going to production
function logme() {
	var a = arguments;
	console.log(a, a);
}

function openGPIOPromise(device) {
	var deferred = Q.defer();
	gpio.open(device.pin, "out", function(err) {
		if(err) {
			deferred.resolve(device);
		} else {
			deferred.resolve(device);
		}
	});
	return deferred.promise;
}

function closeGPIOPromise(device) {
	var deferred = Q.defer();
	gpio.close(device.pin, function(err) {
		if(err) {
			deferred.resolve(device);
		} else {
			deferred.resolve(device);
		}
	});
	return deferred.promise;
}

// Updates the provided device with it's state
function readGPIOPromise(device) {
	var deferred = Q.defer();
	console.log("Start rerading on pin %s", device.pin);
	gpio.read(device.pin, function(err, value) {
		if (err) {
			deferred.reject(err);
		}
		console.log("Reading done, state is" + value);
		device.state = value == "1";
		deferred.resolve(device);
	});
	return deferred.promise;
}

function writeGPIOPromise(device) {

	var deferred = Q.defer();
	console.log("About to write %s to %s", device.state, device.color)
	gpio.write(device.pin, device.state, function(err) {
		console.log("Done writing %s to pin %s on device %s", device.state, device.pin, device.color);
		deferred.resolve(device);
	});
	return deferred.promise;
}

function invertState(device) {
	var deferred = Q.defer();
	console.log("Reverting state");
	device.state = !device.state;
	deferred.resolve(device);
	return deferred.promise;
}

function checkStatusForAll() {

}


// Called with two arguments, the pin and a callback
function toggleLamp(deviceId) {
	var deferred = Q.defer();
	var device = devices[deviceId];
	if (device.type == "gpio") {
		try {
			readGPIOPromise(device)
				.then(invertState)
				.then(writeGPIOPromise)
				.then(deferred.resolve)
		} catch (err) {
			deferred.reject(err);
		}
	} else if (device.type == "telldus") {
		//todo 2 (general) +0: Add support for telldus devices
		deferred.reject();
	}
	return deferred.promise;
}



// Server setup
var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

// Open up the GPIO-ports.
//todo 3 (general) +0: Make this aware of the devices list

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendfile("index.html");
})


// Setting upp socket.io....
io.on('connection', function(socket) {
	console.log('a user connected, starting init task');

	socket.emit("init", devices);


	socket.on('ToggleLamp', function(deviceId, type) {
		toggleLamp(deviceId).then(function(device) {
			console.log("Back to cb with deviceId " + device.deviceId);
			socket.emit("status", {
				deviceId: device.deviceId,
				state: device.state
			});
			socket.broadcast.emit("status", {
				deviceId: device.deviceId,
				state: device.state
			});
		});
	});


});

// Here we go.
http.listen(8080, function() {
	console.log('listening on *:8080');
});