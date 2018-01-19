# AppCloud-nba-dataset

> Le but de cet exercice est de développer une application avec des données réelles. Nous avons défini les requêtes les plus pertinentes par rapport à ce jeu de données, intégré dans une application dédiée, et défini des vues en fonction des rôles.

## Jeu de données

https://relational.fit.cvut.cz/dataset/NBA

## Téchnologies
- node.js
- mongodb

## Installation


```
git clone https://github.com/raphaelsebb/AppCloud-nba-dataset.git
```

Ajoutez les fichiers JSON contenus dans `bdd` dans une base de données mongodb que vous devez appeler `NBA` (connectée sur le port `27017`).

```
sudo mongod
```
```
npm install mongodb@2.2.33
npm install express
npm install assert
npm install express-handlebars
node index.js
```

Rendez-vous sur http://localhost:3000/

## Fonctionnalités

#### Page 1 : index

Sur la page index vous pouvez séléctionner l'équipe de votre choix.
Une fois séléctionnée, un tablaeu contenant l'ensemble des matchs disputés apparait.

Grace aux requêtes :

```javascript
//get all teams
db.collection("Team").find();

//get all games of the selected team (using team's id)
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

En cliquant sur les boutons `Game details`, vous pouvez vous rendre sur une deuxième page.

#### Page 2 : game


 Vous obtenez différentes informations telles que : l'équipe vainqueur, le lien du match sur le site de la NBA ou encore le top 5 des meilleurs joueurs du match.

```javascript
//get game informations (using game's id)
db.collection("Game").aggregate([
  {
    $match:{
      "GameId": id
    }
  }
])

//get the 5 best players of the game (using game's id)
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
#### Page 3 : player

Sur cette page, vous pouvez séléctionner le joueur de votre choix.
Une fois séléctionné, un tableau contenant l'ensemble de ses actions pour chaque match disputé.

```javascript
//get all players
db.collection("Player").find();

//get all actions played by the selected player (using player's id)
db.collection("Actions").aggregate([
  {
    $match:{
      "Player.PlayerId": id
    }
  }
])
```

#### Page 4 : admin

Cette page permet de consulter les logs de toutes les requêtes.

```javascript
//get 100 last logs
db.collection("logs").find().sort({date: -1}).limit(100);
```
