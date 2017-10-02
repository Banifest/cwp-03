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
    client.write('FILES');
    console.log('Connected');
    for(let i = 2; i<process.argv.length; i++)
    {
        fs.readdir(`${process.argv[i]}`,  (err, files) => {
            for(const file of files)
            {
                let str = `${process.argv[i]}${file}`;
                fs.stat(str, (err, st) => {
                    if(st.isFile())
                    {
                        files.push(str);
                        console.log(str);
                        fs.readFile(str, "base64", (err, dataFiles) => {
                            s = (`{\n"fileName":"${file}",\n"info":"${dataFiles.toString().replace(/\n/g,"").replace(/\r/g,"")}"\n}`);
                            console.log(s);
                            client.write(new Buffer(s, "base64"));
                        });
                    }
                });
            }
        });
    }
});


let iter = 0;
client.on('data', function(data) {
    /*   if(data === 'ACK' )
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
   */
});


client.on('close', function() {
    console.log('Connection closed');
});