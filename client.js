
const net = require('net');
const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

var lastNotification = '';
target = 2;
var active;
var pDef = 2000;
var interval = null;
var timeout = null;

// Define switch cases
const disconnectPrefix = 'END';
const activePrefix = `ACT`;

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

        console.log(`${Date()} Start`);
        let $ = cheerio.load(await scrape());
        var notification = $('.message').first().text().trim();
        if(notification == lastNotification) return;
        lastNotification = notification;
        if(!notification) return;
        client.write(`MSG ${notification}`); // Update latest message on server

    }

    async function pSched(){ // Schedule theh ping interval

        let lowRand = (Math.random() * ((pDef*.5) - (pDef*.05)) + (pDef*.05));

        timeout = setTimeout( () => {
            interval = setInterval(parse, pDef);
        }, Math.random() * (pDef - lowRand) + lowRand);
    }

    async function antiSched(){ // Remove scheduling to avoid stupid dumb loops / memory leaks / duped clients

            clearInterval(interval);
            clearTimeout(timeout);

    }

    const client = new net.Socket();
    client.connect({port: 8081}, {host: 'localhost'}, () => { // Change host variable according to server location

        console.log(`[${Date()}] CONNECTED TO SERVER`);
        client.setEncoding('utf8');

        let lowRand = (Math.random() * ((pDef*.5) - (pDef*.05)) + (pDef*.05));

        timeout = setTimeout( () => { // Delay registration to avoid pDef being something that is not a number
            client.write(`REG`); // Register with the server
        }, Math.random() * (pDef - lowRand) + lowRand);



    });

    client.on(`data`, (res) => { // Handle data

        let message = res.slice(0, 3);

        switch(message) {

            case disconnectPrefix: // Abort client if there is an emergency disconnect signal
                console.log(res);
                console.log(`[${Date()}] EMERGENCY DISCONNECT`);
                client.end()
                break;

            case activePrefix: // Inform client of number of active clients for ping scheduling
                active = res.slice(4, 8).trim();

                pDef = active * 2000;

                let numCheck = isNaN(pDef);

                if(pDef < 2000) break;
                if(numCheck != false) break;
                console.log(pDef);

                antiSched();
                pSched();

                break;

            default:
                console.log(res);

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