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

        console.log(`[${Date()}]\x1b[42m Client at ${s.remoteAddress} disconnected, (${socketRegistry.length} active)\x1b[0m`);

        socketRegistry.forEach((connectionSocket) => {  // Update client ID information
            if (!connectionSocket.destroyed) {
                let id = new Missive('ID', idFinder);
                id['active'] = socketRegistry.length;
                id['interval'] = 2000;
                connectionSocket.write(JSON.stringify(id));
                idFinder++;
            }else{
                console.error(`[${Date()}]\x1b[41m Registry holding destroyed socket\x1b[0m`);
            }
        });
    }
}

//client.login(config.token);

console.log(`\x1b[44mInitializing...\x1b[0m`);
//client.on("ready", () => {
    console.log(`\x1b[44mInitialized\x1b[0m`);

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
                if(index !== -1) console.error(`[${Date()}]\x1b[41m Bad string from ${socket.remoteAddress}\x1b[0m`); // Don't log noise from ghost clients
                return;
            }

            switch (obj.tag) {
                case config.prefix.message: // Log snow message and post it to Discord
                    if (obj.content == fs.readFileSync('lastNotification.log')) break;
                    console.log(`[${Date()}]\x1b[47m\x1b[30m Snow day! ${obj.content}\x1b[0m`);

                  /*  for(let channelId of config.announcementChannels){
                        client.channels.get(channelId).send((config.useEveryone ? "@everyone " : "") + obj.content).catch(err => 
                            console.error(`[${Date()}]\x1b[41m Error reporting snow day to ${channelId}: ${err}\x1b[0m`);
;                        );
                    }*/

                    fs.writeFileSync('lastNotification.log', obj.content);

                    break;

                case config.prefix.disconnect: // Stop communication with the bots
                    let end = new Missive('END', `[${Date()}] END SIGNAL`)
                    console.log(`[${Date()}]\x1b[45m Emergency communications shutoff - Disconnecting from bots...\x1b[0m`);

                    socketRegistry.forEach((connectionSocket) => {if (!connectionSocket.destroyed) connectionSocket.write(JSON.stringify(end))});
                    break;

                case config.prefix.shutdown: // Shut down the server
                    console.log(`[${Date()}]\x1b[45m Code ${config.prefix.shutdown}! Shutting down!\x1b[0m`);
                    process.exit();
                    break;

                case config.prefix.register: // Add new clients to the network, inform all clients of new ping schedule
                    socketRegistry.push(socket);    // Add new socket to the registry
                    idFinder = 0;
                    console.log(`[${Date()}]\x1b[42m Client at ${socket.remoteAddress} connected (${socketRegistry.length} active)\x1b[0m`);

                    socketRegistry.forEach((connectionSocket) => {
                        if (!connectionSocket.destroyed) { 
                            let id = new Missive('ID', idFinder);
                            id['active'] = socketRegistry.length;
                            id['interval'] = 2000;
                            connectionSocket.write(JSON.stringify(id));
                            idFinder++;
                        }else{
                            console.error(`[${Date()}]\x1b[41m Registry holding destroyed socket\x1b[0m`);
                        }
                    });
                    break;

                default:
                    console.log(`[${Date()}]\x1b[43m Queer message - Logging...\x1b[0m`);  // Log queer messages
                    fs.appendFile('LOG', `[${Date()}], ${socket.remoteAddress} - ${req.tag}: ${req.content}`, (err) => console.error(`[${Date()}]\x1b[41m Log ${err}\x1b[0m`));
            }
        });

        socket.on('error', (err) => console.error(`[${Date()}]\x1b[41m Socket ${err}\x1b[0m`));

        socket.on('end', () => {
            removeSocket(socket);
        });

        
        socket.on('timeout', () => {
            removeSocket(socket);
        });
    });

    server.on('error', (err) => console.error(`[${Date()}]\x1b[41m Server ${err}\x1b[0m`));

    server.listen(8081, () => { // Server listens on port 8081
        console.log(`[${Date()}]\x1b[44m Server bound\x1b[0m`);
    });
//});
