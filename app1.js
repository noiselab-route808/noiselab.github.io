/*  CENSEO Noise Lab Project checklist
[x] - Implement middleware node enviroment
[x] - Control logic for LD831 triggering to BeamformX
[ ] - Set up remote test environment params (host and port variables)
[ ] - Create LAN db for logging
[ ] - Index TEST ID with PROJECT ID
[ ] - Detail API specs for URL pos and get methods
*/

'use strict'
const cors = require('cors');
const express = require('express');
const Telnet = require('telnet-client')
const app = express();
const fs = require('fs');
const path = require('path');


// Telnet Middleware
var connection = new Telnet()
var params = {
  host: '192.168.1.199', // will be 192.168.1.199 in Lab using eth01 
  port: 9431,
  shellPrompt: /^BeamformX: (Log, Stop, Pause, or Resume)?/,
  timeout: 3000};

var objTelnet = {
  runConnect : async function() {
    try {
        await connection.connect(params);
        console.log('BeamformX host connected');
      } catch(error) {
        console.log('error connecting');
      }
  },
   runEnd : async function() {
    try {
        await connection.end();
        let hostConnected = false;
        console.log('BeamformX host disconnected');
      } catch(error) {
        console.log('error somewhere');
      }
  },
  log : async function() {
    try {
      await connection.exec('Log');
      console.log('Log commmand sent');
      } catch(error) {
        console.log('error logging');  
      }
  },
  stop : async function() {
    try {
      await connection.exec('Stop');
      console.log('Stop commmand sent');
      } catch(error) {
        console.log('error on stop');  
      }
  },
  resume : async function() {
    try {
      await connection.exec('Resume');
      console.log('Resume commmand sent');
      } catch(error) {
        console.log('error on resume');  
      }
  },
  pause : async function() {
    try {
      await connection.exec('Pause');
      console.log('Pause commmand sent');
      } catch(error) {
        console.log('error pausing');  
      }
  }
}
// Callback Routes
var cbRunConnect = function (req, res, next) {
  console.log('cbRunConnnect');
  objTelnet.runConnect();
  next();
}
var cbRunEnd = function (req, res, next) {
  console.log('cbRunEnd');
  objTelnet.runEnd();
  next();
}

var cbSequence = function (req, res, next) {
  console.log('cbRunConnnect');
  triggerSeq();
  next();
}
/* -----------------------------------------------------
The combined trigger sequence works while a
connection to the BeamfommX host is active.  Command
Log, after 3 seconds Stop is sent, then after 1 second
Resume is sent
*/
function triggerStop() {
    return new Promise(resolve => {
    setTimeout(function() {
      objTelnet.stop();
      resolve("Stop")
      console.log("Stop command sent")
    }, 5000)
  })
}
function triggerResume() {
    return new Promise(resolve => {
    setTimeout(function() {
      objTelnet.resume();
      resolve("Resume")
      console.log("Resume command sent")
    }, 1000)
  })
}

var triggerSeq = async function() {
  objTelnet.log();
  console.log('==SEQUENTIAL TRIGGER==') // send log instantly
  const stop = await triggerStop()
  console.log(stop) // runs 5 seconds after 1.

  const resume = await triggerResume()
  console.log(resume) // runs 6 seconds after 1.
}

//Program Stack
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//To Connect
app.get('/c', cbRunConnect, function (req, res){
  res.json({msg: 'This is CORS-enabled for all origins!'})
  console.log('cbRunConnect get response');
});
app.get('/e', cbRunEnd, function (req, res){
  res.json({msg: '/e route!'})
  console.log('cbRunEnd get response');
});

app.post('/seq', cbSequence, function (req,res){
  res.json({msg: '/seq route!'})
  console.log('cbTriggerSeq posted');
});

//Posts For Logging
function logData() {
const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}
}


/*
******************************************
var write = fs.createWriteStream('test.txt');
response = {
name: '',
id: ''
}
writer.write(JSON.stringify(response));
*******************************************

// write_stream.js

const fs = require('fs');

let writeStream = fs.createWriteStream('secret.txt');

// write some data with a base64 encoding
writeStream.write('aef35ghhjdk74hja83ksnfjk888sfsf', 'base64');

// the finish event is emitted when all data has been flushed from the stream
writeStream.on('finish', () => {
    console.log('wrote all data to file');
});

// close the stream
writeStream.end();

OR
// write_stream.js

const fs = require('fs');

let writeStream = fs.createWriteStream('secret.txt');

// write some data with a base64 encoding
writeStream.write('aef35ghhjdk74hja83ksnfjk888sfsf', 'base64');

// the finish event is emitted when all data has been flushed from the stream
writeStream.on('finish', () => {
    console.log('wrote all data to file');
});

// close the stream
writeStream.end();


*********************read

let rawdata = fs.readFileSync(path.resolve(__dirname, 'censeodb.json'));
let noise_data = JSON.parse(rawdata);
console.log(noise_data);
*********************write
let rawdata = fs.readFileSync('censeodb.json');
let noise_data = JSON.parse(rawdata);


*/

//Network Broadcasting
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`app host listening on ${PORT}`));
