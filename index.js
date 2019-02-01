
const net = require('net');
const fs = require('fs');

// Define switch cases
const messagePrefix = 'MSG';
const pingPrefix = 'PNG';
const disconnectPrefix = 'END';
const shutdownPrefix = 'UWU';

var socketRegistry = [];

//callback here is called on event "connection," and returns a socket object to the connection
const server = net.createServer( (socket) => { // Server functionality; pipes connection data to stdout

    //notify presence of new connection
    console.log('Client at ', socket.remoteAddress);
    
    //send a message to the client and pipe client data to the terminal
    socket.write('hello\r\n');

    //add to registry
    socketRegistry.push(socket);


    //assign event callbacks
    socket.setEncoding('ascii');
    socket.on('data', (res) => {

        let message = res.slice(0, 3);

        switch(message) {
            case messagePrefix:
                // Post message to Discord
                console.log('Snow day! Posting message to Discord');
                break;

            case pingPrefix:
                // Distribute ping-time data
                console.log('Ping-Time Data received - Distributing...');

                socketRegistry.forEach( (connectionSocket) => {
                    if(!connectionSocket.destroyed){
                        connectionSocket.write('[' + Date() + '] Ping!');
                    }
                });

                break;

            case disconnectPrefix:
                // Stop communicating with bots
                console.log('Emergency communications shutoff - Disconnecting from bots...');
                break;

            case shutdownPrefix:
                // Shut down the server
                console.log('Code UWU! Shutting down!');
                process.exit();
                break;

            default:
                // Log queer messages
                console.log('Queer message - Logging...');
                fs.appendFile('LOG', '[' + Date() + '] ' + res, console.error);
        }

    });

    socket.on('error', console.error);

    socket.on('end', () => {
        server.getConnections( (err,n) => { // Log disconnections and active clients
            if(err) console.error(err);
            console.log('Client disconnected (',n,'active )');
        });

    });
});

server.on('error', console.error);

server.listen(8081, () => { // Server listens on port 8081
    console.log('Server bound');
});
