var express = require("express");
var router = express.Router();
var mongo = require("mongodb");
var app = express();
var assert = require("assert");
var exphbs  = require("express-handlebars");


var url = "mongodb://localhost:27017/NBA"

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('views'));

// Get all teams
app.get('/', function (req, res, next) {
  var resultArray = [];
  var date = Date.now();
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('connected');
    var cursor = db.collection("Team").find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc)
    }, function() {
      var time = Date.now() - date;;
      insertLogs(date, 'findTeams', time);
      db.close();
      console.log('connection closed');
      res.render('index', {'title': 'All teams', 'teams': resultArray});
      console.log(resultArray);
    });
  });
});

// Get team's played games (using team's id)
app.get('/team:id', function (req, res) {
  var id = parseInt(req.params.id);
  var date = Date.now();
  mongo.connect(url, function(err, db) {
    db.collection("Game").aggregate([
      {
        $match:{
          $or: [
            { "Team1.TeamId": id },
            { "Team2.TeamId": id }
          ]
        }
      }
    ]).toArray(function(err, result) {
      if (err) throw err;
      var time = Date.now() - date;;
      insertLogs(date, 'teamGames', time);
      res.setHeader('Content-Type', 'application/json');
      console.log(result);
      res.send({'game': result});
      db.close();
    });
  });
});

// Get players (using game's id)
app.get('/infos:id', function (req, res) {
  var id = parseInt(req.params.id);
  var date = Date.now();
  mongo.connect(url, function(err, db) {
    db.collection("Actions").aggregate([
      {
        $match: {
          "GameId": id
        }
      },
      { 
        $group: { 
          "_id":"$Player.PlayerName", 
          "score":{$sum:"$Points"} 
        } 
      },  
      { 
        $sort: { 
          "score":-1 
        } 
      },  
      { 
        $limit: 5
      }
    ]).toArray(function(err, result) {
      if (err) throw err;
      var time = Date.now() - date;;
      insertLogs(date, 'top5players', time);
      res.setHeader('Content-Type', 'application/json');
      console.log(result);
      res.send({'infos': result});
      db.close();
    });
  });
});


// Get games (using game's id)
app.get('/game:id', function (req, res) {
  var id = parseInt(req.params.id);
  var date = Date.now();
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('connected');
    var cursor = db.collection("Game").aggregate([
          {
            $match:{
              "GameId": id
            }
          }
        ])
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc)
    }, function() {
      var time = Date.now() - date;;
      insertLogs(date, 'gameInfos', time);
      db.close();
      console.log('connection closed');
      res.render('game', {'id': resultArray[0].GameId ,'title': resultArray[0].Team1.TeamName + ' VS ' + resultArray[0].Team2.TeamName, 'game': resultArray});
      console.log(resultArray);
    });
  });
});

// Get all players
app.get('/player', function (req, res, next) {
  var resultArray = [];
  var date = Date.now();
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('connected');
    var cursor = db.collection("Player").find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc)
    }, function() {
      var time = Date.now() - date;;
      insertLogs(date, 'findPlayers', time);
      db.close();
      console.log('connection closed');
      res.render('player', {'title': 'All players', 'players': resultArray});
      console.log(resultArray);
    });
  });
});

// Get actions's played (using player's id)
app.get('/playerInfos:id', function (req, res) {
  var date = Date.now();
  var id = parseInt(req.params.id);
  mongo.connect(url, function(err, db) {
    db.collection("Actions").aggregate([
      {
        $match:{
          "Player.PlayerId": id
        }
      }
    ]).toArray(function(err, result) {
      if (err) throw err;
      var time = Date.now() - date;
      insertLogs(date, 'playerInfos', time);
      res.setHeader('Content-Type', 'application/json');
      console.log(result);
      res.send({'player': result});
      db.close();
    });
  });
});

// Get logs
app.get('/admin', function (req, res, next) {
  var resultArray = [];
  var date = Date.now();
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('connected');
    var cursor = db.collection("logs").find().sort({date: -1}).limit(100);
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc)
    }, function() {
      var time = Date.now() - date;;
      insertLogs(date, 'findLogs', time);
      db.close();
      console.log('connection closed');
      res.render('admin', {'title': 'Admin', 'logs': resultArray});
      console.log(resultArray);
    });
  });
});

function insertLogs(date, query, time) {
  var new_log = {
    "date" : date,
    "query" : query,
    "time" : time
  };

  mongo.connect(url, function(err, db) {
    if (err) throw err;
    db.collection('logs').insertOne(new_log, function(err,res) {
      if(err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
}

// Start server
var server = app.listen(3000, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log("Application Cloud listening at http://localhost:%s/", port);
});
