
const net = require('net');
const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

var lastNotification = '';
target = 2;

// Define switch cases
const disconnectPrefix = 'END';
const pingPrefix = `PNG`;

function connect() { // Connect

    async function scrape() { // Scraping - Adapted from original Snow Day Bot

        switch(target) {
            case 0:
                return rp('https://www.calverthall.com/page').catch((e) => console.error('\x1b[41m%s\x1b[0m',e));

            case 1:
                return fs.readFileSync('./Calvert Hall - Normal.html');

            case 2:
                return fs.readFileSync('./Calvert Hall - Snow Day.html');

            default:
                console.error('\x1b[41m%s\x1b[0m', `[${Date()}] INVALID TARGET: ${target}`);

        }
    }

    async function parse() { // Parse message - Adapted from original Snow Day Bot

        let $ = cheerio.load(await scrape());
        var notification = $('.message').first().text().trim();
        if(notification == lastNotification) return;
        lastNotification = notification;
        if(!notification) return;
        client.write(`MSG ${notification}`); // Update latest message on server

    }

    const client = new net.Socket();
    client.connect({port: 8081}, {host: 'localhost'}, () => { // Change host variable according to server location

        console.log(`[${Date()}] CONNECTING`);
        client.setEncoding('utf8');

        setInterval( () => {
            parse();
            client.write(`PNG [${Date()}]`);
        }, 2000);

    });

    client.on('data', (res) => { // Handle data

        let message = res.slice(0, 3);
        switch(message) {
            case disconnectPrefix:
                console.log(res);
                console.log(`[${Date()}] EMERGENCY DISCONNECT`);
                client.end()
                break;

            case pingPrefix:
                console.log(res); // Log ping time in console
                break;

            default:
                console.log(res);
        }

    });

    client.on('end', () => { // Reconnect on `end` event

        console.log(`[${Date()}] DISCONNECTED FROM SERVER`);
        connect();

    });

    client.on(`error`, () => { // Reconnect on an error

        connect();

    });
}

connect();