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

// Get teams
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

// Get team's membres (using team'id)
// app.get('/team:id', function (req, res) {
//   var id = parseInt(req.params.id);
//   mongo.connect(url, function(err, db) {
//     db.collection("Actions").aggregate([
//       {
//         $match:{
//           "TeamId" : id
//         }
//       },
//       {$lookup: {
//           from: "Team",
//           localField: "TeamId",
//           foreignField: "TeamId",
//           as: "TeamInfo"
//       }},
//       {
//         $unwind: "$TeamInfo"
//       },
//       {
//         $project: {
//           "TeamInfo.TeamId": 1,
//           "TeamInfo.TeamName": 1,
//           "Player.PlayerName": 1,
//           "Player.PlayerId": 1
//         }
//       }
//     ]).toArray(function(err, result) {
//       if (err) throw err;
//       res.setHeader('Content-Type', 'application/json');
//       console.log(result);
//       res.send({'team': result});
//       db.close();
//     });
//   });
// });

// Get team's scores (using team'id)
app.get('/team:id', function (req, res) {
  var id = parseInt(req.params.id);
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
      res.setHeader('Content-Type', 'application/json');
      console.log(result);
      res.send({'game': result});
      db.close();
    });
  });
});


// Start server
var server = app.listen(3000, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log("Application Cloud listening at http://localhost:%s/", port);
});
