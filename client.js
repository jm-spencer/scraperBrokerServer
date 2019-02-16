const net = require('net');
const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

var lastNotification = '';
target = 2;
var pDef;
var interDef; 
var interval = null;
var timeout = null;

// Missive class constructor
function Missive(tag, content) {

    this.tag = tag;
    this.content = content;

}

// Define switch cases
const disconnectPrefix = 'END';
const idPrefix = 'ID';

function connect() { // Connect

    async function scrape() { // Scraping - Adapted from original Snow Day Bot

        switch (target) {
            case 0:
                return rp('https://www.calverthall.com/page').catch((e) => console.error('\x1b[41m%s\x1b[0m', e));

            case 1:
                return fs.readFileSync('./Calvert Hall - Normal.html');

            case 2:
                return fs.readFileSync('./Calvert Hall - Snow Day.html');

            default:
                console.error('\x1b[41m%s\x1b[0m', `[${Date()}] INVALID TARGET: ${target}`);

        }
    }

    async function parse() { // Parse message - Adapted from original Snow Day Bot

        console.log(`${Date()} Start`);
        let $ = cheerio.load(await scrape());
        let msg = new Missive('MSG', $('.message').first().text().trim());
        if (msg.content == lastNotification) return;
        lastNotification = msg.content;
        if (!msg.content) return;
        client.write(JSON.stringify(msg)); // Update latest message on server

    }

    async function pSched() { // Schedule theh ping interval

        timeout = setTimeout(() => {
            interval = setInterval(parse, interDef);
        }, pDef);
    }

    async function antiSched() { // Remove scheduling to avoid stupid dumb loops / memory leaks / duped clients

        clearInterval(interval);
        clearTimeout(timeout);

    }

    const client = new net.Socket();
    client.connect({
        port: 8081
    }, {
        host: 'localhost'
    }, () => { // Change host variable according to server location

        console.log(`[${Date()}] CONNECTED TO SERVER`);
        client.setEncoding('utf8');

        let lowRand = (Math.random() * ((pDef * .5) - (pDef * .05)) + (pDef * .05));

        timeout = setTimeout(() => { // Delay registration to avoid pDef being something that is not a number
            let reg = new Missive('REG', null);
            client.write(JSON.stringify(reg)); // Register with the server
        }, Math.random() * (pDef - lowRand) + lowRand);

    });

    client.on(`data`, (res) => { // Handle data

        let obj = JSON.parse(res);

        switch (obj.tag) {

            case disconnectPrefix: // Abort client if there is an emergency disconnect signal
                console.log(obj.content);
                console.log(`[${Date()}] EMERGENCY DISCONNECT`);
                client.end()
                break;

            case idPrefix: // Inform client of number of active clients for ping scheduling

                pDef = obj.content * 2000;
                interDef = obj.active * 2000;

                let numCheck = isNaN(pDef);

                if (numCheck != false) break;
                console.log(pDef);

                antiSched();
                pSched();

                break;

            default:
                console.log(obj.content);

        }

    });

    client.on('end', () => { // Reconnect on `end` event

        antiSched();
        console.log(`[${Date()}] DISCONNECTED FROM SERVER`);
        connect();

    });

    client.on(`error`, () => { // Reconnect on an error

        antiSched();
        connect();

    });
}

connect();