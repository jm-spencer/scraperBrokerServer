
const net = require('net');
const fs = require('fs');

// Define switch cases
const messagePrefix = `MSG`;
const pingPrefix = `PNG`;
const disconnectPrefix = `END`;
const shutdownPrefix = `UWU`;

var lastNotification = ``;

var socketRegistry = [];

// Callback here is called on event 'connection,' and returns a socket object to the connection
const server = net.createServer( (socket) => {

    // Notify presence of new connection
    console.log(`Client at , ${socket.remoteAddress}`);
    
    // Send a message to the client and pipe client data to the terminal
    socket.write(`[CONNECTION ESTABLISHED]\n`);

    // Add to registry
    socketRegistry.push(socket);


    // Assign event callbacks
    socket.setEncoding('utf8');
    socket.on('data', (res) => {

        let message = res.slice(0, 3);

        switch(message) {

            case messagePrefix:
                // Post message to Discord
                let snow = res.substr(4, 2000).trim();
                if(snow == lastNotification) break;
                console.log(`[${Date()}] Snow day! ${snow}`);

                // Add stuff

                lastNotification = snow;

                break;

            case pingPrefix:
                // Distribute ping-time data
                console.log(`[${Date()}] Ping-Time Data received - Distributing...`);

                socketRegistry.forEach( (connectionSocket) => {

                    if(!connectionSocket.destroyed){

                        connectionSocket.write(res);

                    }
                });
                break;

            case disconnectPrefix:
                // Stop communicating with bots
                console.log(`[${Date()}] Emergency communications shutoff - Disconnecting from bots...`);
                
                socketRegistry.forEach( (connectionSocket) => {

                    if(!connectionSocket.destroyed){
                        connectionSocket.write(`END @ [${Date()}]\n`);

                    }
                });
                break;

            case shutdownPrefix:
                // Shut down the server
                console.log(`[${Date()}]  Code ${shutdownPrefix}! Shutting down!`);
                process.exit();
                break;

            default:
                // Log queer messages
                console.log(`[${Date()}] Queer message - Logging...`);
                fs.appendFile('LOG', `[${Date()}] - ${res}`, (e) => console.error('\x1b[41m%s\x1b[0m',e));

        }

    });

    socket.on('error', (e) => console.error('\x1b[41m%s\x1b[0m',e));

    socket.on('end', () => {

        server.getConnections( (err,n) => { // Log disconnections and active clients

            if(err) console.error(err);
            console.log(`[${Date()}] Client at ${socket.remoteAddress} disconnected (${n} active )`);

        });

    });
});

server.on('error', (e) => console.error('\x1b[41m%s\x1b[0m',e));

server.listen(8081, () => { // Server listens on port 8081

    console.log(`[${Date()}] Server bound`);

});
