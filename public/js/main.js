var socket = io();
var lamps = [{
		color: "Röd",
		pin: 1,
		css: "bulb-red"
	}, {
		color: "Grön",
		pin: 3,
		css: "bulb-green"
	}, {
		color: "Blå",
		pin: 2,
		css: "bulb-blue"
	}, {
		color: "Gul",
		pin: 4,
		css: "bulb-yellow"
	}

];


$(".bulb").click(function() {
	var $this = $(this);
	var pin = $this.attr("data-pin");
	console.log("Toggling pin" + pin);
	socket.emit('ToggleLamp', pin);
});



socket.on("status", function(args) {
	var obj = $("div.bulb[data-pin='" + args.pin + "']");
	//obj.html(obj.attr("data-color") + ": " + (args.state ? " Lyser " : " Lyser inte "));
	obj.toggleClass("bulb-active", args.state);
	console.log("status change");
	console.log(args);

});


// This gets a list of all devices
socket.on("init", function(devices) {
	for(var deviceID in devices) {
		var device = devices[deviceID];
		$("#lampsList").append(
			'<div class="col-xs-3"><div data-pin="' + deviceID + '" data-color="' + device.color + '" class="bulb ' + device.css + '">&nbsp;</div>' + '<span class="state"></span>' + '</div></div>'
		);
	}

});