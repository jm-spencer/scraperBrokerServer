
const NetcatServer = require('netcat/server');
const NetcatClient = require('netcat/client');
const ncs = new NetcatServer();
const ncc = new NetcatClient();

const Discord = require('discord.js');

const client = new Discord.Client();

ncs.port(8081).k().listen().on('data', (socket, chunk) => { // Event based listener; listens on port 8081 and outputs received packets in hex
    console.log(chunk);
});