const net = require('net');
const readline = require('readline-sync')

const options = {
    port: 4000,
}

const client = net.createConnection(options)

client.on('connect', ()=>{
    console.log('Conexión satisfactoria!!')
    sendLine()
})

client.on('data', (data)=>{
    console.log('El servidor dice:' + data)
    sendLine()
})

client.on('error', (err)=>{
    console.log(err.message)
})

function sendLine() {
    var line = readline.question('\ndigite alguna cosa\t')
    if (line == "0") {
        client.end()
    }else{
        const buf = Buffer.from([1, 2, 3, 4]);
        client.write(line)
    }
}