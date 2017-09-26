const net = require('net');
const fs = require("fs");
const port = 8124;

let seed = 826;

function writeLog(str, client) {
    fs.appendFileSync(`${client.id.toString()}.log`, str.toString() + '\n\r')
}

const server = net.createServer((client) => {
    console.log('Client connected');
    client.setEncoding('utf8');

    client.on('data', (data) => {
        if(!client.ACK)
        {
            client.id = Date.now() + seed++;
            writeLog(`id = ${client.id.toString()}`, client);
            if(data === 'QA')
            {
                client.write('ACK');
                client.ACK = true;

                writeLog(`ACK`, client);
            }
            else
            {
                client.write('DEC');
                client.ACK = false;

                writeLog(`DEC`, client);
            }
        }
        else
        {
            writeLog(`Вопрос - ${data.toString()}`, client);
            if(Math.random()>0.5)
            {
                writeLog(`ответ - да`, client);
                client.write('да');
            }
            else
            {
                writeLog(`ответ - нет`, client);
                client.write('нет');
            }
        }
    });

    client.on('end', () =>
    {
        console.log('Client disconnected')
        writeLog(`Client disconnected`, client);
    });
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});