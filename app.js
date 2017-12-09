var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    express = require('express'), 
    app = express(),
    bodyParser = require('body-parser'),
    co = require('co'),
    moment = require('moment'),
    config = require('./config');

var port = config.port || 8000;
var app_name = "TokenData Callback";

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.post("/api/tokendata",function(req,res,next){
    if(!req.query.type || req.query.type == null) res.status(404).json({Message:"Error type"});
    if(!req.query.token || req.query.token != config.token) res.status(404).json({Message:"Error Token!"});
    let s = req.body;
    co(function*() {
        s.apptype = yield delSpace(req.query.type);
        s.apptype = encodeURIComponent(s.apptype);
        s.timestamp = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var db = yield MongoClient.connect('mongodb://localhost:27017/tokendata');
        var collection = db.collection("cb");
        var r = yield collection.insertOne(s);
        db.close();
    }).catch((err)=>{
        console.error(err.stack);
    });
    res.status(200).json({Message:"test ok"});
});

app.use("/",function(req,res,next){
    res.status(404).json({Message : "API Method not found/allowed"});
});

app.listen(port, function(){
    console.log(app_name, 'info', 'Listening to port: ' + port ,  '[@'+moment(new Date()).format('YYYY-MM-DD HH:mm:ss')+"]");
  });

var delSpace = function* (text){
    var output = text.trim();
    var output = output.replace(/\s+/g,'');
    return output;
};
