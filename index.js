
const net = require('net');

const server = net.createServer( (c, n) => { // Server functionality; pipes connection data to stdout

    c.on('end', () => {

        server.getConnections( (err,n) => { // Log disconnections and active clients
            
            if(err) console.error(err);
    
            console.log('client disconnected (',n,'active )');
        
        });

    });

    c.write('hello\r\n');
    c.pipe(process.stdout);

});

server.on('error', (err) => { // Error handling

    throw err;

});

server.listen(8081, () => { // Server listens on port 8081

    console.log('server bound');

});

server.on('connection', () => { // Log connections and active clients

    server.getConnections( (err,n) => {

        if(err) console.error(err);

        console.log('client connected (',n,'active )');
    
    });
    

});
