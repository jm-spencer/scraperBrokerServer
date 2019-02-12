const net = require('net');
const fs = require('fs');

// Missive class constructor
function missive(tag, content) {

    this.tag = tag;
    this.content = content;

}

// Define switch cases
const messagePrefix = `MSG`;
const disconnectPrefix = `END`;
const shutdownPrefix = `UWU`;
const registerPrefix = `REG`;

var lastNotification = ``;

var socketRegistry = [];

// Callback here is called on event 'connection,' and returns a socket object to the connection
const server = net.createServer((socket) => {

    // Add to registry
    socketRegistry.push(socket);

    // Assign event callbacks
    socket.setEncoding('utf8');
    socket.on('data', (req) => {

        // Error handling for JSON strings
        try {
            JSON.parse(req);
        } catch(err) {
            console.error("Bad String");
            return;
        }

        // Convert JSON string to an object
        let obj = JSON.parse(req);

        switch (obj.tag) {

            case messagePrefix:
                // Post message to Discord
                if (obj.content == lastNotification) break;
                console.log(`[${Date()}] Snow day! ${obj.content}`);

                // Add stuff

                lastNotification = obj.content;

                break;

            case disconnectPrefix:
                // Stop communicating with bots

                // New missive instance
                let end = new missive('END', `[${Date()}] END SIGNAL`)
                console.log(`[${Date()}] Emergency communications shutoff - Disconnecting from bots...`);

                socketRegistry.forEach((connectionSocket) => {

                    if (!connectionSocket.destroyed) {
                        connectionSocket.write(JSON.stringify(end));

                    }
                });
                break;

            case shutdownPrefix:
                // Shut down the server
                console.log(`[${Date()}]  Code ${shutdownPrefix}! Shutting down!`);
                process.exit();
                break;

            case registerPrefix:
                // Log connections and active clients
                server.getConnections((err, n) => {

                    let act = new missive('ACT', n);

                    if (err) console.error(err);
                    console.log(`[${Date()}] Client at ${socket.remoteAddress} connected (${n} active)`);

                    socketRegistry.forEach((connectionSocket) => {

                        if (!connectionSocket.destroyed) {

                            connectionSocket.write(JSON.stringify(act));

                        }
                    });

                });
                break;

            default:
                // Log queer messages
                console.log(`[${Date()}] Queer message - Logging...`);
                fs.appendFile('LOG', `[${Date()}] - ${req.tag + req.content}`, (e) => console.error('\x1b[41m%s\x1b[0m', e));

        }

    });

    socket.on('error', (e) => console.error('\x1b[41m%s\x1b[0m', e));

    socket.on('end', () => {

        server.getConnections((err, n) => { // Log disconnections and active clients

            // New missive instance
            let act = new missive('ACT', n);

            if (err) console.error(err);
            console.log(`[${Date()}] Client at ${socket.remoteAddress} disconnected (${n} active)`);
            socketRegistry.forEach((connectionSocket) => {

                if (!connectionSocket.destroyed) {

                    connectionSocket.write(JSON.stringify(act));

                }
            });

        });

    });
});

server.on('error', (e) => console.error('\x1b[41m%s\x1b[0m', e));

server.listen(8081, () => { // Server listens on port 8081

    console.log(`[${Date()}] Server bound`);

});