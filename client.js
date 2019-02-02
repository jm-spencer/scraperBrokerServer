const net = require('net');

// Define switch cases
const messagePrefix = 'MSG';
const pingPrefix = 'PNG';
const disconnectPrefix = 'END';

// Establish a connection to the server
const client = net.createConnection({port: 8081}, {host: 'localhost'}, () => { // Change host variable according to server location

    console.log('[CONNECTING]');
    client.write('PNG'); // Fake ping report for testing purposes

});

// Data event handler
client.on('data', (res) => {

    client.setEncoding('ascii');

    let message = res.slice(0, 3);
    switch(message) {
        case disconnectPrefix:
            console.log(res.toString());
            console.log('[EMERGENCY DISCONNECT]');
            client.end()
            break;

        default:
            console.log(res.toString());
    }

});

// End event handler
client.on('end', () => {

    console.log('[DISCONNECTED FROM SERVER]');

});