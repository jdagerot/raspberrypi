var socket = io();


$(document).ready(function() {
	$("#lampsList").on("click", "div>div", function() {
		console.log("Sending toggle event");
		var $this = $(this);
		console.log($this);
		var deviceId = $this.attr("data-deviceId");
		console.log("Toggling pin" + deviceId);
		socket.emit('ToggleLamp', deviceId);
	});



	socket.on("status", function(args) {
		var obj = $("div.bulb[data-deviceId='" + args.deviceId + "']");
		//obj.html(obj.attr("data-color") + ": " + (args.state ? " Lyser " : " Lyser inte "));
		obj.toggleClass("bulb-active", args.state);
		console.log("status change");
		console.log(args);

	});


	// This gets a list of all devices
	socket.on("init", function(devices) {
		for (var deviceID in devices) {
			var device = devices[deviceID];
			$("#lampsList").append(
				'<div class="col-xs-3"><div data-deviceId="' + deviceID + '" data-color="' + device.color + '" class="bulb ' + device.css + '">&nbsp;</div>' + '<span class="state"></span>' + '</div></div>'
			);
		}

	});
});