
const net = require('net');

const server = net.createServer( (c, n) => {

    // 'connection' listener
    console.log('client connected');

    c.on('end', () => {
        console.log('client disconnected');
    });

    c.write('hello\r\n');
    c.pipe(process.stdout);

});

server.on('error', (err) => {

    throw err;

});

server.listen(8081, () => {

    console.log('server bound');

});

// Attempt to grab the number of connections upon a successful connection; does not currently work
server.on('connection', () => {

    server.getConnections( (n) => {

        console.log('there are', +n, 'connections');
    
    });
    

});