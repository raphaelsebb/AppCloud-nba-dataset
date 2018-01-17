# AppCloud-nba-dataset

Le but de cet exercice est de développer une application avec des données réelles. Nous avons défini les requêtes les plus pertinentes par rapport à ce jeu de données, intégré dans une application dédiée, et défini des vues en fonction des rôles.

## Jeu de données

https://relational.fit.cvut.cz/dataset/NBA

## Installation

Télécharger le dossier `bdd` et ajoutez les JSON à votre base de données mongodb.

```
npm install -all
```
```
sudo mongod
```

Rendez-vous sur http://localhost:3000/

## Fonctionnalités

Sur la page index vous pouvez séléctionner l'équipe de votre choix.
Une fois séléctionnée, un tableux contenant l'ensembles des matchs disputés apparait.

Grace à la requête :

```javascript
db.collection("Team").find();

db.collection("Game").aggregate([
  {
    $match:{
      $or: [
        { "Team1.TeamId": id },
        { "Team2.TeamId": id }
      ]
    }
  }
])
```

En cliquant sur l'un des matchs, vous pour voir le détail match grace à un lien qui affichera alors l'équipe gagnante ainsi que les 5 meilleurs joueurs du match.

```javascript
db.collection("Game").aggregate([
  {
    $match:{
      "GameId": id
    }
  }
])

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
])
```

meilleur joueur du match 2
db.Actions.find({"GameId": 2}).sort({Points:-1}).limit(1)
