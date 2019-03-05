const tls = require('tls');
const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

const config = require('./config/client.json');

var lastNotification = '';
var target = 2;
var pDef, interDef; 
var interval, timeout = null;

function Missive(tag, content) { // Construct the Missive class
    this.tag = tag;
    this.content = content;
}


function connect() { // Connect  
    
    lastNotification = '';

    async function scrape() { // Scraping - Adapted from original Snow Day Bot
        switch (target) {
            case 0:
                return rp('https://www.calverthall.com/page').catch((err) => console.error(`[${Date()}] \x1b[41mRequest ${err}\x1b[0m`));

            case 1:
                return fs.readFileSync('html/Calvert Hall - Normal.html');

            case 2:
                return fs.readFileSync('html/Calvert Hall - Snow Day.html');

            default:
                console.error(`[${Date()}] \x1b[43mINVALID TARGET: ${target}\x1b[0m`);
        }
    }

    async function parse() { // Parse message - Adapted from original Snow Day Bot
        let $ = cheerio.load(await scrape());
        let msg = new Missive('MSG', $('.message').first().text().trim());
        if (msg.content == lastNotification) return;
        lastNotification = msg.content;
        if (!msg.content) return;
        console.log(`[${Date()}] \x1b[47m\x1b[30mOutbound data: ${msg.content}\x1b[0m`);
        client.write(JSON.stringify(msg)); // Update latest message on server
    }

    async function pSched() { // Schedule the ping interval
        console.log(`[${Date()}] \x1b[42mScheduling ping with interval {${interDef}} and offset {${pDef}}\x1b[0m`);
        timeout = setTimeout(() => {
            parse();
            interval = setInterval(parse, interDef);
        }, pDef);
    }

    async function antiSched() { // Remove scheduling to avoid stupid dumb loops / memory leaks / duped clients
        clearInterval(interval);
        clearTimeout(timeout);
    }

    const client = tls.connect({
        port: 8081,
        host: config.serverAddress,
        key: fs.readFileSync('certs/private-key.pem'),  // Private key
        cert: fs.readFileSync('certs/public-cert.pem'), // Public certificate
        rejectUnauthorized: false   // Getting error from self-signed certificate, as it is not trusted. This fixes that.
    },
        () => {
        console.log(`[${Date()}] \x1b[44mCONNECTED TO SERVER\x1b[0m`);
        client.setEncoding('utf8');

        timeout = setTimeout(() => { // Delay registration to avoid a broken interval
            let reg = new Missive('REG', null);
            client.write(JSON.stringify(reg)); // Register with the server
        }, 500);
    });

    client.on(`data`, (res) => { // Handle data
        let obj = JSON.parse(res);

        switch (obj.tag) {
            case config.prefix.disconnect: // Abort client if there is an emergency disconnect signal
                console.log(`[${Date()}] \x1b[45mEMERGENCY DISCONNECT\x1b[0m`);
                client.end()
                break;

            case config.prefix.id: // Inform client of number of active clients for ping scheduling
                pDef = obj.content * obj.interval;
                interDef = obj.active * obj.interval;

                antiSched();
                pSched();
                break;
            default:
                console.log(`[${Date()}] \x1b[43mQueer message - ${obj.tag}: ${obj.content}\x1b[0m`);
                break;
        }
    });

    client.on('end', () => { // Reconnect on `end` event
        console.log(`[${Date()}] \x1b[41mDISCONNECTED FROM SERVER\x1b[0m`);
        antiSched();
        connect();
    });

    client.on(`error`, (err) => { // Reconnect on an error
        console.error(`[${Date()}] \x1b[41mSocket ${err}\x1b[0m`);

        antiSched();
        connect();
    });
}

connect();
