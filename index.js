
const NetcatServer = require('netcat/server');
const NetcatClient = require('netcat/client');
const ncs = new NetcatServer();
const ncc = new NetcatClient();

const Discord = require('discord.js');

const client = new Discord.Client();

ncs.port(8081).k().listen().pipe(process.stdout); // Pipe all incoming data from port 8081 to standard output; keep the connection alive after a termination
console.log(process.stdout); // Display standard output

ncs.port(8081).k().listen().on('data', (socket, chunk) => { // Alternative event based method to the above
    console.log(chunk);
});