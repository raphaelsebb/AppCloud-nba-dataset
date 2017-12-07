var express = require("express");
var router = express.Router();
var mongo = require("mongodb");
var app = express();
var assert = require("assert");
var exphbs  = require('express-handlebars');


var url = "mongodb://localhost:27017/NBA"

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('views'));

app.get('/', function (req, res, next) {
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('connected');
    var cursor = db.collection("Team").find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc)
    }, function() {
      db.close();
      console.log('connection closed');
      res.render('index', {'title': 'All teams', 'teams': resultArray});
      console.log(resultArray);
    });
  });
});

app.get('/team:id', function (req, res) {
  var id = parseInt(req.params.id);
  mongo.connect(url, function(err, db) {
    db.collection("Actions").aggregate([
      {
        $match:{
          "TeamId" : id
        }
      },
      {$lookup: {
          from: "Player",
          localField: "PlayerId",
          foreignField: "PlayerId",
          as: "playerInfo"
      }},
      {
        $unwind: "$playerInfo"
      },
      // {$lookup: {
      //     from: "Game",
      //     localField: "GameId",
      //     foreignField: "GameId",
      //     as: "gameInfo"
      // }},
      // {
      //   $unwind: "$gameInfo"
      // },
      {$lookup: {
          from: "Team",
          localField: "TeamId",
          foreignField: "TeamId",
          as: "teamInfo"
      }},
      {
        $unwind: "$teamInfo"
      },
      {
        $project: {
          "teamInfo.TeamId": 1,
          "teamInfo.TeamName": 1,
          "playerInfo.PlayerName": 1,
          "playerInfo.PlayerId": 1
        }
      }
    ]).toArray(function(err, result) {
      if (err) throw err;
      res.setHeader('Content-Type', 'application/json');
      console.log(result);
      res.send({'result': result});
      db.close();
    });
  });
});

var server = app.listen(3000, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log("Application Cloud listening at http://localhost:%s/", port);
});
