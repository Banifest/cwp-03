const net = require('net');
const fs = require('fs');


const shuffle = require('shuffle-array');
const port = 10124;

const client = new net.Socket();

console.log(process.env)

process.on('uncaughtException', function (err) {
    console.log(err);
});

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

class pair{
    constructor(f, s)
    {
        this.first = f;
        this.second = s;
    }
}

client.setEncoding('utf8');

let files = [];
client.connect(port, function() {
    client.write('REMOTE');
    console.log('Connected');

});


let iter = 0;
client.on('data', function(data) {
    if(data === 'ACK' )
       {
           client.ACK = true;
           console.log(files[iter].first);
           client.write(files[iter].first);
           iter++;
       }
       else if (client.ACK === true && iter < files.length)
       {
           console.log(data.toString());
           console.log(files[iter - 1].second === data.toString() ? 'верно':'ложь')
           console.log(files[iter].first);
           client.write(files[iter].first);
           iter++;
       }
       else
       {
           console.log(data.toString());
           console.log(files[iter - 1].second === data.toString() ? 'верно':'ложь')
           client.destroy();
       }
});


client.on('close', function() {
    console.log('Connection closed');
});