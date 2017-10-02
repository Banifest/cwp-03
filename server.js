const net = require('net');
const path = require('path');
const fs = require("fs");


const port = 10124;

let seed = 826;
let activeClient = 0;

const clientType =
{
    QA: 0,
    FILES: 1,
    REMOTE: 2
};

function writeLog(str, client)
{
    fs.appendFileSync(`log\\${client.id.toString()}.log`, str.toString() + '\n\r')
}

function isAuthClient(data, client)
/**
 * @param data
 * @param client
 * @returns {boolean}
 */
{
    if(!client.QA && !client.FILES && !client.REMOTE)
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

function choiseAction(data, client)
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
            console.log("files");

            let fileName = "";
            let dirName = "";
            data = Buffer.from(data, "base64");
            JSON.parse(data, (k, v) => {

                console.log(k);
                console.log(v);
                if (k === "fileName")
                {
                    fileName = `${process.env.CWP}\\${client.id}\\${v}`;
                    dirName = `${process.env.CWP}\\${client.id}`;

                }
                else if (k === "info")
                {
                    console.log(fileName);
                    fs.stat(dirName, (err, stats) =>
                    {
                        if (!stats) {
                            fs.mkdir(dirName, () =>
                            {
                                fs.writeFile(fileName, v, (err) =>
                                {
                                    console.log(err);
                                });
                            });
                        }
                        else {
                            fs.writeFile(fileName, v, (err) =>
                            {
                                console.log(err);
                            });
                        }
                    });
                }
            });
            break;
        case clientType.REMOTE:

            break;
    }

}

const server = net.createServer((client) =>
{
    console.log('Client connected');
    client.setEncoding('base64');

    client.on('data', (data) =>
    {
        console.log(data);
        console.log('\n\n\n');

        if(isAuthClient(data, client))
        {
            choiseAction(data, client);
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