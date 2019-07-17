'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });

var urlSchema = mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: Number
});

var URL = mongoose.model('URL', urlSchema);
var dns = require('dns');
var indexOfShorturl = 0;


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", function (req, res) {
  var find = URL.findOne({original_url: req.body.url}, (err, data) => {
      if(data != null) res.json({"original_url": data.original_url, "short_url": data.short_url});
      else {    
          var check = dns.lookup(req.body.url.slice(8), function (err, addresses, family) {
          if (addresses != undefined) {
            URL.countDocuments({}, function( err, count){
              let url = new URL({"original_url": req.body.url, "short_url": count+1});
              url.save();
              res.json({"original_url": url.original_url, "short_url": url.short_url});
            });

          } else {
            res.json({"error":"invalid URL"});
          }
        });
        
      }
    });
  
});


app.get("/api/shorturl/:num", function (req, res) {
  var find = URL.findOne({short_url: Number(req.params.num)}, (err, data) => {
    console.log(data.original_url);
    res.writeHead(301,{Location: data.original_url});
    res.end();
  }
);
  
});




app.listen(port, function () {
  console.log('Node.js listening ...');
});