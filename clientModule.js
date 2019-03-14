// A module that gets passed to client.js

let $;
switch (target) {
    case 0:
        rp('https://www.calverthall.com/page').then(res => {
            $ = cheerio.load(res);
        }).catch((err) => console.error(`[${Date()}] \x1b[41mRequest ${err}\x1b[0m`));
        break;
    case 1:
        $ = cheerio.load(fs.readFileSync('html/Calvert Hall - Normal.html'));
        break;
    case 2:
        $ = cheerio.load(fs.readFileSync('html/Calvert Hall - Snow Day.html'));
        break;
    default:
        console.error(`[${Date()}] \x1b[43mINVALID TARGET: ${target}\x1b[0m`);
}

let msg = new Missive('MSG', $('.message').first().text().trim());
if (msg.content != lastNotification) {
    lastNotification = msg.content;
    if (msg.content) {
        console.log(`[${Date()}] \x1b[47m\x1b[30mOutbound data: ${msg.content}\x1b[0m`);
        client.write(JSON.stringify(msg)); // Update latest message on server
    }
}