
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

// Grab the current number of connections upon every successful connection
server.on('connection', () => {

    server.getConnections( (err,n) => {
        if(err) console.error(err);

        console.log('there are', +n, 'connections');
    
    });
    

});