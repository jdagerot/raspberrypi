var socket = io();


function logme() {
	console.log(arguments);
}

$(document).ready(function() {
	$("#lampsList").on("click", "div>div", function() {
		logme("Sending toggle event");
		var $this = $(this);
		logme($this);
		var deviceId = $this.attr("data-deviceId");
		logme("Toggling pin" + deviceId);
		socket.emit('ToggleLamp', deviceId);
	});



	socket.on("status", function(args) {
		var obj = $("div.bulb[data-deviceId='" + args.deviceId + "']");
		//obj.html(obj.attr("data-color") + ": " + (args.state ? " Lyser " : " Lyser inte "));
		obj.toggleClass("bulb-active", args.state);
	});


	// This gets a list of all devices
	socket.on("init", function(devices) {
		$("#lampsList").html('');
		for (var deviceID in devices) {
			var device = devices[deviceID];
			$("#lampsList").append(
				'<div class="col-xs-3"><div data-deviceId="' + deviceID + '" data-color="' + device.color + '" class="bulb ' + device.css + '">&nbsp;</div>' + '<span class="state"></span>' + '</div></div>'
			);
			if(device.state) {
				var obj = $("div.bulb[data-deviceId='" + device.deviceId + "']").addClass("bulb-active");
			}
		}

	});

	socket.on("connect", function(){
		$("#connectionStatus").html("WE ARE CONNECTED");
	});
	socket.on("disconnect", function(){
		$("#connectionStatus").html("WE ARE DISCONNECTED");
	});
});

