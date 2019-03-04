const tls = require('tls');
const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();

const config = require('./config/server.json');

function Missive(tag, content) {    // Construct the Missive class
    this.tag = tag;
    this.content = content;
}


var socketRegistry = []; // Define misc. variables
var idFinder = 0;

async function removeSocket(s){
    s.destroy();

    idFinder = 0;
    let index = socketRegistry.indexOf(s);

    if(index !== -1) {  // Don't log or refresh the schedule if the client is not registered
        socketRegistry.splice(index, 1);   // Remove socket from registry

        console.log(`[${Date()}] Client at ${s.remoteAddress} disconnected, (${socketRegistry.length} active)`);

        socketRegistry.forEach((connectionSocket) => {  // Update client ID information
            if (!connectionSocket.destroyed) {
                let id = new Missive('ID', idFinder);
                id['active'] = socketRegistry.length;
                id['interval'] = 2000;
                connectionSocket.write(JSON.stringify(id));
                idFinder++;
            }else{
                console.error(`[${Date()}] Registry holding destroyed socket`);
            }
        });
    }
}

//client.login(config.token);

console.log("\x1b[44m%s\x1b[0m","Initializing...");
//client.on("ready", () => {
    console.log("\x1b[44m%s\x1b[0m","Initialized");

    var server = tls.createServer({
       key: fs.readFileSync('certs/private-key.pem'),   // Private key
       cert: fs.readFileSync('certs/public-cert.pem')   // Public certificate
    }, (socket) => {   // Callback here is called on event 'connection,' and returns a socket object to the connection

        //timeout = setTimeout(() => {    // Destroy the socket if the client does not register
        //    let index = socketRegistry.indexOf(socket);
        //    if(index == -1) socket.destroy();
        //}, 5000);

        socket.setEncoding('utf8');
        socket.on('data', (req) => {    // Assign event callbacks
            let obj = {};
            try {   // Error handling for JSON strings
                obj = JSON.parse(req);
            } catch(err) {
                let index = socketRegistry.indexOf(socket);
                if(index !== -1) console.error(`[${Date()}] Bad string from ${socket.remoteAddress}`); // Don't log noise from ghost clients
                return;
            }

            switch (obj.tag) {
                case config.prefix.message: // Log snow message and post it to Discord
                    if (obj.content == fs.readFileSync('lastNotification.log')) break;
                    console.log(`[${Date()}] Snow day! ${obj.content}`);

                  /*  for(let channelId of config.announcementChannels){
                        client.channels.get(channelId).send((config.useEveryone ? "@everyone " : "") + obj.content).catch(console.error);
                    }*/

                    fs.writeFileSync('lastNotification.log', obj.content);

                    break;

                case config.prefix.disconnect: // Stop communication with the bots
                    let end = new Missive('END', `[${Date()}] END SIGNAL`)
                    console.log(`[${Date()}] Emergency communications shutoff - Disconnecting from bots...`);

                    socketRegistry.forEach((connectionSocket) => {if (!connectionSocket.destroyed) connectionSocket.write(JSON.stringify(end))});
                    break;

                case config.prefix.shutdown: // Shut down the server
                    console.log(`[${Date()}]  Code ${config.prefix.shutdown}! Shutting down!`);
                    process.exit();
                    break;

                case config.prefix.register: // Add new clients to the network, inform all clients of new ping schedule
                    socketRegistry.push(socket);    // Add new socket to the registry
                    idFinder = 0;
                    console.log(`[${Date()}] Client at ${socket.remoteAddress} connected (${socketRegistry.length} active)`);

                    socketRegistry.forEach((connectionSocket) => {
                        if (!connectionSocket.destroyed) { 
                            let id = new Missive('ID', idFinder);
                            id['active'] = socketRegistry.length;
                            id['interval'] = 2000;
                            connectionSocket.write(JSON.stringify(id));
                            idFinder++;
                        }else{
                            console.error(`[${Date()}] Registry holding destroyed socket`);
                        }
                    });
                    break;

                default:
                    console.log(`[${Date()}] Queer message - Logging...`);  // Log queer messages
                    fs.appendFile('LOG', `[${Date()}] - ${req.tag}: ${req.content}`, (e) => console.error('\x1b[41m%s\x1b[0m', e));
            }
        });

        socket.on('error', (e) => console.error('\x1b[41m%s\x1b[0m', e));

        socket.on('end', () => {
            removeSocket(socket);
        });

        
        socket.on('timeout', () => {
            removeSocket(socket);
        });
    });

    server.on('error', (e) => console.error('\x1b[41m%s\x1b[0m', e));

    server.listen(8081, () => { // Server listens on port 8081
        console.log(`[${Date()}] Server bound`);
    });
//});
