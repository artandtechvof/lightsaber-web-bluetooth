#!/usr/bin/env node

var express = require('express');
app = express();
server = require('http').createServer(app);
io = require('socket.io').listen(server);

//start bridge server on localhost port 8080
server.listen(8080);

io.sockets.on('connection', function (socket) {
        socket.on('message', function (data) {
                //brightness = data2.value;
               
                //var buf = new Buffer.alloc(1);
                //buf.writeUInt8(brightness, 0);
                serWrite(serPort, data + '\n');
				console.log(`Received WebUSB message: ${data}`);
               
                //io.sockets.emit('led', {value: brightness});   
        });

        socket.on('status', function (data) {
                //brightness = data2.value;
               
                //var buf = new Buffer.alloc(1);
                //buf.writeUInt8(brightness, 0);
				//console.log(`WebUSB Status request Rx`);
               
			   while ( !queue.isEmpty() ) {
				 io.sockets.emit('status', queue.peek());
				 queue.dequeue();		
				 console.log(`Sending Status to WebUSB`);
			   }
        });
       
        //socket.emit('led', {value: brightness});
});
 
console.log("Web Server Started on 'http://localhost:8080'");


var opn = require('opn');

const { Select } = require('enquirer')
const args = require('commander')
const SerialPort = require('@serialport/stream')
//const { version } = require('package.json')
const { OutputTranslator } = require('./output-translator')
SerialPort.Binding = require('@serialport/bindings')

var serPort;

var Queue = require('queue-fifo');
var queue = new Queue();

const makeNumber = input => Number(input)

args
  //.version(version)
  .usage('[options]')
  .description('A basic terminal interface for communicating over a serial port. Pressing ctrl+c exits.')
  .option('-l --list', 'List available ports then exit')
  .option('-p, --path <path>', 'Path of the serial port')
  .option('-b, --baud <baudrate>', 'Baud rate default: 9600', makeNumber, 9600)
  .option('--databits <databits>', 'Data bits default: 8', makeNumber, 8)
  .option('--parity <parity>', 'Parity default: none', 'none')
  .option('--stopbits <bits>', 'Stop bits default: 1', makeNumber, 1)
  .option('--no-echo', "Don't print characters as you type them.")
  .parse(process.argv)

const listPorts = async () => {
  const ports = await SerialPort.list()
  for (const port of ports) {
    console.log(`${port.path}\t${port.pnpId || ''}\t${port.vendorId || ''}`)
  }
}

const askForPort = async () => {
  const ports = await SerialPort.list()
  if (ports.length === 0) {
    console.error('No ports detected and none specified')
    process.exit(2)
  }

  //listPorts();
  //await(5000);   


  const answer = await new Select({
    name: 'serial-port-selection',
    message: 'Select a serial port to open (use up down key to scroll if multiple serial ports are available)',
    choices: ports.map((port, i) => ({
      value: `[${i + 1}]\t${port.path}\t${port.vendorId || ''}`,
      name: `${port.path} `.concat(`${port.vendorId}`.replace('16C0','Teensy')).replace('1209','Proffieboard'),
    })),
    required: true,
  }).run()
  return answer
}

const createPort = path => {
  path = `${path}`.split(' ')[0];

  console.log(`Opening serial port: ${path} echo: ${args.echo}`)

  const openOptions = {
    baudRate: args.baud,
    dataBits: args.databits,
    parity: args.parity,
    stopBits: args.stopbits,
  }

  const port = new SerialPort(path, openOptions)
  return port
}

const serWrite = function(_port, data){
    _port.write(data)
	console.log('Sending serial data');
}

const showData = () => {
	console.log('aardbei');
	serWrite(serPort, 'on');
}

const doSerial = port =>{

  //const output = new OutputTranslator()
  //output.pipe(showData)
  //port.pipe(output)
  	
 port.on('data', function (data) {
  reply = data.toString('utf8');
  queue.enqueue(reply);
  console.log('Rx serial Data:', reply)
 })
	
  port.on('error', err => {
    console.error('Error', err)
    process.exit(1)
  })

  port.on('close', err => {
    console.log('Closed', err)
    process.exit(err ? 1 : 0)
  })
  process.stdin.setRawMode(true)
  process.stdin.on('stdin data', input => {
    for (const byte of input) {
      // ctrl+c
      if (byte === 0x03) {
        port.close()
        process.exit(0)
      }
    }
    //port.write(input)
	serWrite(port, input)
    if (args.echo) {
      process.stdout.write(input.toString('utf8'))
    }
  })
  process.stdin.resume()

  process.stdin.on('end', () => {
    port.close()
    process.exit(0)
  })
}

const run = async () => {
  if (args.list) {
    listPorts()
    return
  }
  const path = args.path || (await askForPort())
  //await createPort(path)
  serPort = createPort(path)
  //opn('./app.html');
  var cmd=require('node-cmd')
  cmd.get('pwd',
      function(err, data, stderr){
          console.log('the current working dir is : ',data)
      }
    );
  cmd.get('http-server ./ -p 8081 -c-1 --cors',
      function(err, data, stderr){
          console.log('res: ',data)
      }
    );
  opn('http://localhost:8081/app.html')
  await doSerial(serPort)
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})



// const express = require('express');
// const app = express();
// var http_port = 8080;

// app.get('/', function (req, res) {

    // return res.send('Working');
 
// })

// app.get('/:action', function (req, res) {
    
   // var action = req.params.action || req.param('action');
	
	// console.log(action);
	// if (action == 'favicon.ico'){
		// console.log('haha gevangen!!');
	// }
	// else {	
		// serWrite(serPort, action + '\n');
	// }
	
    // res.send
		
    // //if(action == 'led'){
    // //    //arduinoSerialPort.write("on\n");
    // //    return res.send('saber is on!');
    // //} 
    // //if(action == 'off') {
    // //    //arduinoSerialPort.write("off\n");
    // //    return res.send("saber is off!");
    // //}
    
    // return res.send('Action: ' + action);
 
// });

// app.listen(http_port, function () {
  // console.log('Example app listening on port http://0.0.0.0:' + http_port + '!');
// });