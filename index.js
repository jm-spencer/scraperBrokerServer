
const net = require('net');

//callback here is called on event "connection," and returns a socket object to the connection
const server = net.createServer( socket => { // Server functionality; pipes connection data to stdout

    //notify presence of new connection
    console.log('Client at ', socket.address().address);
    
    //send a message to the client and pipe client data to the terminal
    socket.write('hello\r\n');
    socket.pipe(process.stdout);

    //assign event callbacks
    socket.on('error', (err) => {
        console.error(err);
    });

    socket.on('end', () => {
        server.getConnections( (err,n) => { // Log disconnections and active clients
            if(err) console.error(err);
            console.log('Client disconnected (',n,'active )');
        });

    });
});

server.on('error', (err) => { // Error handling
    console.error(err);
});

server.listen(8081, () => { // Server listens on port 8081
    console.log('Server bound');
});
