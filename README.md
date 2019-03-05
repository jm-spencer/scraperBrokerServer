# CHC Snow Day Botnet
**2019 Cyber Security Project**

## Contributors
- Jason Walter (walterj21@chcstudent.com)
- Joseph Spencer (spencerj21@chcstudent.com)

## About
This is the GitHub repository for the Calvert Hall Snow Day Botnet. The network checks for snow days and pushes a message to the Calvert Hall Discord when one is announced. Included within are the server, which functions as a broker for ping-scheduling, and the client, which pings the Calvert Hall website to check for a snow day. The project is written in Javascript, and executed natively with Node.js.

## Security
The botnet uses TLS encryption to secure traffic, and client verification as well as protection against snow day spoofing are both in development.

## Licensing
*Do whatever you want with the code, it sucks anyway.*
*Just make sure to shout us out or whatever.*

## Logging
The terminal uses color codes to see the state of operation at a glance
Black text, white  background: inbound/outbound data
White text, red    background: error
"     "   , green  background: scheduling
"     "   , yellow background: queer message
"     "   , blue   background: initialization
"     "   , purple background: controlled error (eg. force shutdown)

## Hidden directories
There are two directories essential to operation, `/config/` and `/certs/`

config contains `server.json` and `client.json`, both of which are settings for their respective programs
certs contains a pair of keys named `public-cert.pem` and `private-key.pem`


template for server.json:
```json
{
    "prefix": {"message", "disconnect", "shutdown", "register"},
    "token",
    "announcementChannels": [],
    "useEveryone": false
}
```

template for client.json
```json
{
    "serverAddress"
    "prefix": {"disconnect", "id"}
}
```