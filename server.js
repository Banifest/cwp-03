const net = require('net');
const path = require('path');
const fs = require("fs");
const crypto = require('crypto');

const port = 10124;

let seed = 826;
let activeClient = 0;

const TEST_CASE = '{' +
    '"name":"aaa.txt",' +
    '"info":"TeStEsT"' +
    '}';

console.log(JSON.parse(TEST_CASE).name);


const clientType =
{
    QA: 0,
    FILES: 1,
    REMOTE: 2
};

function writeLog(str, client)
{
    fs.appendFileSync(`log\\${client.id.toString()}.log`, str.toString() + '\n\r');
}

function isAuthClient(data, client)
{
    if(!client.TYPE)
    {
        client.id = Date.now() + seed++;
        writeLog(`id = ${client.id.toString()}`, client);

        if(activeClient < process.env.MAX_CWP)
        {
            switch (data)
            {
                case 'QA':
                    client.TYPE = clientType.QA;
                    break;
                case 'FILES':
                    client.TYPE = clientType.FILES;
                    break;
                case 'REMOTE':
                    client.TYPE = clientType.REMOTE;
                    break;
            }
            activeClient++;
            client.write('ACK');

            writeLog(`ACK`, client);
        }
        else
        {
            client.write('DEC');
            client.ACK = false;

            writeLog(`DEC`, client);
        }
        return false;
    }
    else
    {
        return true;
    }
}

function chooseAction(data, client)
{
    switch (client.TYPE)
    {
        case clientType.QA:
            writeLog(`Вопрос - ${data.toString()}`, client);
            if (Math.random() > 0.5)
            {
                writeLog(`ответ - да`, client);
                client.write('да');
            }
            else
            {
                writeLog(`ответ - нет`, client);
                client.write('нет');
            }
            break;
        case clientType.FILES:

            arr = data.replace(/\n/g, '').split('}');
            arr.pop();
            //console.log(arr);

            for(let i = 0; i<arr.length;i++)
            {
                console.log(arr[i]);
                let resultParse = JSON.parse(arr[i]+'}');
                console.log(resultParse);
                let dirName = `${process.env.CWP}\\${client.id}`;
                let fileName = dirName + '\\' + resultParse.fileName;

                fs.stat(dirName, (err, stats) =>
                {
                    if (!stats)
                    {
                        fs.mkdir(dirName, () =>
                        {
                            fs.writeFile(fileName, resultParse.info, 'base64', (err) =>
                            {
                                //console.log(err);
                            });
                        });
                    }
                    else
                    {
                        fs.writeFile(fileName, resultParse.info, 'base64', (err) =>
                        {
                            //console.log(err);
                        });
                    }
                });
            }
            break;
        case clientType.REMOTE:
            const arg = data.split(' ');

            switch (arg[0])
            {
                case 'COPY':
                    console.log('COPY');
                    fs.createReadStream(arg[1]).pipe(fs.createWriteStream(arg[2])).on('close', ()=>
                    {
                        client.write("OK");
                    });
                    break;
                case 'ENCODE':
                    const cipher = crypto.createCipher('aes192', arg[3]);
                    fs.createReadStream(arg[1]).pipe(cipher).pipe(fs.createWriteStream(arg[2]),()=>
                    {
                        client.write("OK");
                    });
                    break;
                case 'DECODE':
                    const decipher = crypto.createDecipher('aes192', arg[3]);
                    fs.createReadStream(arg[1]).pipe(decipher).pipe(fs.createWriteStream(arg[2]),()=>
                    {
                        client.write("OK");
                    });
                    break;
            }
            break;
    }
}

const server = net.createServer((client) =>
{
    console.log('Client connected');
    client.setEncoding('utf-8');

    client.on('data', (data) =>
    {
        client.setNoDelay(true);
        console.log(data);
        console.log('\n\n\n');

        if(isAuthClient(data, client))
        {
            chooseAction(data, client);
        }

    });

    client.on('end', () =>
    {
        console.log('Client disconnected');
        activeClient--;
        writeLog(`Client disconnected`, client);
    });
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});