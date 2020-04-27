// подключение express
const express = require("express");
var path = require('path');
// создаем объект приложения
const app = express();
const jsonParser = express.json();
// const mongo = require("mongodb");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://Oleksii:Mymongodb99@cluster0-en4yj.mongodb.net/test?retryWrites=true&w=majority";
const mongoClient = new MongoClient(url, { useNewUrlParser: true });
let lux;
let ledOn;
var getLux = function(lux){
  return {
    lux: lux
  }
}
var getLedOn = function(ledOn){
  return {
    ledOn: ledOn
  }
}

// const db = require('./config/db');
// const db = require('mongodb').Db;
// const port = 3000;
// require('./routes')(app, {});

// mongoClient.connect(function(err, client){
    //
    // const db = client.db("sensordb");
    // const collection = db.collection("lights");
    // let light = {level: "250", date: "10.12.2019"};
    // collection.insertOne(light, function(err, result){
    //
    //     if(err){
    //         return console.log(err);
    //     }
    //     console.log(result.ops);
    //     client.close();
    // });


    // if(err) return console.log(err);
    // dbClient = client;
    // app.locals.collection = client.db("sensordb").collection("lights");
// });


  mongoClient.connect(function(err, client){

    // let light = {level: "100", date: "100"};

    setInterval(function(){
      const db = client.db("sensordb");
      const collection = db.collection("lights");
      let light = {level: getLux.lux, date: new Date().toISOString(),isLedOn: getLedOn.ledOn};
    collection.insertOne(light, function(err, result){

        if(err){
            return console.log(err);
        }
        console.log(result.ops);
        // client.close();
    });

    },3000);

    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("sensordb").collection("lights");
  });



app.get("/esp/lights/last", function(req, res){

      const collection = req.app.locals.collection;
      collection.findOne({}, {sort:{$natural:-1}}, function(err, lights){

          if(err) return console.log(err);
          res.send(lights);
      });

  });


app.get("/esp/lights", function(req, res){

    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, lights){

        if(err) return console.log(err);
        res.send(lights);
    });

});

app.post("/esp/lights", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);

    const lightLevel = req.body.level;
    const lightDate = req.body.date;
    const lightLedOn = req.body.isLedOn;
    const light = {level: lightLevel, date: lightDate, isLedOn: lightLedOn};

    const collection = req.app.locals.collection;
    collection.insertOne(light, function(err, result){

        if(err) return console.log(err);
        res.send(light);
    });
});


// MongoClient.connect(db.url, (err, database) => {
//   if (err) return console.log(err)
//   require('./routes')(app, database);
// })

app.set('view engine', 'html');
// определяем обработчик для маршрута "/"
// app.get("/", function(req, res){
//   res.sendFile('index.html', {root: path.join(__dirname, '/')});
// });


app.get('/esp', function(req, res) {
  let data = req.query.lux;
  // res.send(data);
  let context = {title:"api",message:"root"}
  res.sendFile(__dirname + '/index.html',context)

getLux.lux = parseFloat(req.query.lux, 2);
getLedOn.ledOn = parseInt(req.query.ledOn);
  console.log('Got body:', req.query.lux);
  console.log('LedOn:', req.query.ledOn);
  // console.log(lux);
  // res.sendStatus(200);
});



// начинаем прослушивать подключения на 3000 порту
app.listen(3000);
