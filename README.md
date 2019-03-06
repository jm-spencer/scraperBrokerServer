# CHC Snow Day Botnet
**2019 Cyber Security Project**

## Contributors
- Jason Walter (walterj21@chcstudent.com)
- Joseph Spencer (spencerj21@chcstudent.com)

## About
This is the GitHub repository for the Calvert Hall Snow Day Botnet. The network checks for snow days and pushes a message to the Calvert Hall Discord when one is announced. Included within are the server, which functions as a broker for ping-scheduling, and the client, which pings the Calvert Hall website to check for a snow day. The project is written in Javascript, and is executed natively with Node.js.

## Security
The botnet uses TLS encryption to secure traffic, and client verification as well as protection against snow day spoofing are both in development.

## Logging
Console output is color-coded in order to display the state of operations at a glance.
- White background: inbound/outbound data
- Red background: error
- Green background: scheduling information
- Yellow background: queer message
- Blue background: initialization information
- Purple background: controlled error (eg. forced shutdown)

## Hidden directories
There are two directories essential to operation: `./config/` and `./certs/`. These directories, as well as their content files, should be manually created.

`./config/` contains `server.json` and `client.json`, both of which determine settings for their respective programs.
`./certs/` contains the public and private keys for the client and server, named `public-cert.pem` and `private-key.pem`, respectively.


Template for server.json:

    {
        "prefix": {"message", "disconnect", "shutdown", "register"}, // Prefixes to use for server-client communication (default recommended)
        "token": "", // Your Discord bot token
        "announcementChannels": [], // Discord channels to announce on
        "useEveryone": false // Boolean for pinging with '@everyone'
    }


Template for client.json:

    {
        "serverAddress": "" // The location of a server, in string format
        "prefix": {"disconnect", "id"} // Prefixes to use for server-client communication (default recommended)
    }

## Licensing
*Do whatever you want with the code, it sucks anyway.*
*Just make sure to shout us out or whatever.*