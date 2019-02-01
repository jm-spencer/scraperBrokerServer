
const net = require('net');
const fs = require('fs');

// Define switch cases
var MSG = 'MSG';
var PNG = 'PNG';
var END = 'END';
var UWU = 'UWU';

//callback here is called on event "connection," and returns a socket object to the connection
const server = net.createServer( (socket) => { // Server functionality; pipes connection data to stdout

    //notify presence of new connection
    console.log('Client at ', socket.address().address);
    
    //send a message to the client and pipe client data to the terminal
    socket.write('hello\r\n');

    //assign event callbacks

    socket.setEncoding('ascii');
    socket.on('data', (res) => {

        var message = res.slice(0, 3);

        switch(message) {
            case MSG:
                // Post message to Discord
                console.log('Snow day! Posting message to Discord');
                break;

            case PNG:
                // Distribute ping-time data
                console.log('Ping-Time Data received - Distributing...');
                break;

            case END:
                // Stop communicating with bots
                console.log('Emergency communications shutoff - Disconnecting from bots...');
                break;

            case UWU:
                // Shut down the server
                console.log('Code UWU! Shutting down!');
                process.exit();
                break;

            default:
                // Log queer messages
                console.log('Queer message - Logging...');
                fs.appendFileSync('LOG', '[' + Date() + '] ' + res);
        }

    });

    socket.on('error', (err) => {
        console.error(err);
    });

    socket.on('end', () => {
        server.getConnections( (err,n) => { // Log disconnections and active clients
            if(err) console.error(err);
            console.log('Client disconnected (',n,'active )');
        });

    });
});

server.on('error', (err) => { // Error handling
    console.error(err);
});

server.listen(8081, () => { // Server listens on port 8081
    console.log('Server bound');
});
