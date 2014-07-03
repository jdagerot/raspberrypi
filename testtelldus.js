var telldus = require('telldus');

telldus.getDevices(function(err,devices) {
  if ( err ) {
    console.log('Error: ' + err);
  } else {
    // A list of all configured devices is returned
    console.log(devices);
  }
});