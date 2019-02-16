const net = require('net');
const fs = require('fs');

function Missive(tag, content) {    // Construct the Missive class
    this.tag = tag;
    this.content = content;
}

const messagePrefix = `MSG`;    // Define incoming Missive tags
const disconnectPrefix = `END`;
const shutdownPrefix = `UWU`;
const registerPrefix = `REG`;

var lastNotification = ``;  // Define misc. variables
var socketRegistry = [];
var idFinder = 0;

const server = net.createServer((socket) => {   // Callback here is called on event 'connection,' and returns a socket object to the connection
    socketRegistry.push(socket);    // Add new socket to the registry

    socket.setEncoding('utf8');
    socket.on('data', (req) => {    // Assign event callbacks
        try {   // Error handling for JSON strings
            JSON.parse(req);
        } catch(err) {
            console.error("Bad String");
            return;
        }

        let obj = JSON.parse(req); // Convert JSON string to an object

        switch (obj.tag) {
            case messagePrefix: // Log snow message and post it to Discord
                if (obj.content == lastNotification) break;
                console.log(`[${Date()}] Snow day! ${obj.content}`);

                // Add stuff

                lastNotification = obj.content;

                break;

            case disconnectPrefix: // Stop communication with the bots
                let end = new Missive('END', `[${Date()}] END SIGNAL`)
                console.log(`[${Date()}] Emergency communications shutoff - Disconnecting from bots...`);

                socketRegistry.forEach((connectionSocket) => {if (!connectionSocket.destroyed) connectionSocket.write(JSON.stringify(end))});
                break;

            case shutdownPrefix: // Shut down the server
                console.log(`[${Date()}]  Code ${shutdownPrefix}! Shutting down!`);
                process.exit();
                break;

            case registerPrefix: // Add new clients to the network, inform all clients of new ping schedule
                server.getConnections((err, n) => {
                    idFinder = 0;

                    if (err) console.error(err);
                    console.log(`[${Date()}] Client at ${socket.remoteAddress} connected (${n} active)`);

                    socketRegistry.forEach((connectionSocket) => {
                        if (!connectionSocket.destroyed) { 
                            let id = new Missive('ID', idFinder);
                            id['active'] = n;
                            connectionSocket.write(JSON.stringify(id));
                            idFinder++;
                        }
                    });
                });
                break;

            default:
                console.log(`[${Date()}] Queer message - Logging...`);  // Log queer messages
                fs.appendFile('LOG', `[${Date()}] - ${req.tag + req.content}`, (e) => console.error('\x1b[41m%s\x1b[0m', e));
        }

    });

    socket.on('error', (e) => console.error('\x1b[41m%s\x1b[0m', e));

    socket.on('end', () => {
        let index = socketRegistry.indexOf(socket);
        if(index !== -1) socketRegistry.splice(index, 1);

        server.getConnections((err, n) => { // Log disconnections and active clients
            idFinder = 0;

            if (err) console.error(err);
            console.log(`[${Date()}] Client at ${socket.remoteAddress} disconnected (${n} active)`);

            socketRegistry.forEach((connectionSocket) => {
                if (!connectionSocket.destroyed) {
                    let id = new Missive('ID', idFinder);
                    id['active'] = n;
                    connectionSocket.write(JSON.stringify(id));
                    idFinder++;
                }
            });
        });
    });
});

server.on('error', (e) => console.error('\x1b[41m%s\x1b[0m', e));

server.listen(8081, () => { // Server listens on port 8081
    console.log(`[${Date()}] Server bound`);
});