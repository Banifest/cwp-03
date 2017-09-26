const net = require('net');
const fs = require("fs");
const shuffle = require('shuffle-array');
const port = 8124;

const client = new net.Socket();

process.on('uncaughtException', function (err) {
    console.log(err);
});

class pair{
    constructor(f, s)
    {
        this.first = f;
        this.second = s;
    }
}

client.setEncoding('utf8');

let questions = [];
client.connect(port, function() {
    fs.readFile("qa.json", (err, file)=> {
        JSON.parse(file, (q, a) => {
            if (q != undefined || a != {}) {
                questions.push(new pair(q, a));
            }
        });
        questions.pop();
        shuffle(questions);
        console.log('Connected');
        client.write('QA');
    });
});


let iter = 0;
client.on('data', function(data) {
    if(data === 'ACK' )
    {
        client.ACK = true;
        console.log(questions[iter].first);
        client.write(questions[iter].first);
        iter++;
    }
    else if (client.ACK === true && iter < questions.length)
    {
        console.log(data.toString());
        console.log(questions[iter - 1].second === data.toString() ? 'верно':'ложь')
        console.log(questions[iter].first);
        client.write(questions[iter].first);
        iter++;
    }
    else
    {
        console.log(data.toString());
        console.log(questions[iter - 1].second === data.toString() ? 'верно':'ложь')
        client.destroy();
    }
});

client.on('close', function() {
    console.log('Connection closed');
});