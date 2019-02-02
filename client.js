const net = require('net');
const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

var lastNotification = '';
target = 2;

// Define switch cases
const disconnectPrefix = 'END';

// Scraping - Adapted from original Snow Day Bot
async function scrape() {

    switch(target) {
        case 0:
            return rp('https://www.calverthall.com/page').catch((e) => console.error("\x1b[41m%s\x1b[0m",e));

        case 1:
            return fs.readFile('./Calvert Hall - Normal.html',(e) => console.error("\x1b[41m%s\x1b[0m",e));

        case 2:
            return fs.readFile('./Calvert Hall - Snow Day.html',(e) => console.error("\x1b[41m%s\x1b[0m",e));

        default:
            console.error("\x1b[41m%s\x1b[0m", `invalid target: ${target}`);

    }
}

// Parse message - Adapted from original Snow Day Bot
async function owo() {

    let $ = cheerio.load(await scrape());
    let notification = $('.message').first().text().trim();
    if(notification == lastNotification) return;
    lastNotification = notification;
    if(!notification) return;
    console.log(notification); // Log for testing purposes

}

// Establish a connection to the server
const client = net.createConnection({port: 8081}, {host: 'localhost'}, () => { // Change host variable according to server location

    console.log('[CONNECTING]');
    client.write('PNG'); // Fake ping report for testing purposes

    client.setEncoding('ascii');

    owo(); // Scrape the CHC site and parse the banner message, if any

});

// Data event handler
client.on('data', (res) => {

    let message = res.slice(0, 3);
    switch(message) {
        case disconnectPrefix:
            console.log(res);
            console.log('[EMERGENCY DISCONNECT]');
            client.end()
            break;

        default:
            console.log(res);
    }

});

// End event handler
client.on('end', () => {

    console.log('[DISCONNECTED FROM SERVER]');

});
