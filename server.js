// set dependencies
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const bodyParser = require('body-parser');

// enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// create timesheets upload API endpoint
app.post('/timesheets/upload', function(req, res){
  res.status(201).send({message: "This is the POST /timesheets/upload endpoint"});
})

// launch the API Server at localhost:8080
app.listen(8080);