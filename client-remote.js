const net = require('net');
const fs = require('fs');


const shuffle = require('shuffle-array');
const port = 10124;

const client = new net.Socket();

process.on('uncaughtException', function (err)
{
    console.log(err);
});



let command = "";
let origAddress = "";
let copyAddress = "";
let key = "";


client.setEncoding('utf8');

let files = [];
client.connect(port, function()
{
    command = process.argv[2];
    origAddress = process.argv[3];
    copyAddress = process.argv[4];
    key = process.argv[5];

    client.write('REMOTE');
    console.log('Connected');
});





let iter = 0;
client.on('data', function(data) {
    if(data === 'ACK' )
    {
        client.ACK = true;
        console.log("ACK");
        client.write(`${command} ${origAddress} ${copyAddress} ${key}`);
    }
    else if(data === "OK")
    {
        client.destroy();
    }
    else
    {
        client.destroy();
    }
});


client.on('close', function()
{
    console.log('Connection closed');
});