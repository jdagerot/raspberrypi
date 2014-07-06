var socket = io();


function logme() {
	console.log(arguments);
}
function svgLoaded() {
	var svgEmbed = document.querySelector("#svgObject");
	var svgDocument = svgEmbed.getSVGDocument();

$("[id='rect4132']", svgDocument).each(function(){

	style = $(this).attr("style");
	styles = style.split(";");
	console.log(styles);
	var newStyle = {};
	for(s in styles) {
		var sp = styles[s].split(":");
		console.log(sp);
		newStyle[sp[0]] = sp[1]; 
	}

	newStyle.fill = "#FF0000";

	var style = "";
	for(s in newStyle) {
		ns = newStyle[s];
		style += s + ":" + ns + ";";
	}

	console.log(style);
	$(this).attr("style",style);

});
	$(svgEmbed).attr("viewBox","0 0 128 128");
	$(svgEmbed).attr("height",128);
	$(svgEmbed).attr("width",128);
	svgDocument.scale(20);
	console.log(	$("svg",svgDocument).attr("width"))
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

	var svgEmbed = document.querySelector("#svgObject");
	svgEmbed.addEventListener("load", svgLoaded);


});



