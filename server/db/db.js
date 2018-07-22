var logic = require('./logic');
//var dbconfig = require('../config/dbconfig.js');
//var Sequelize = require('sequelize');
/*
var dbname = dbconfig.production.database || dbconfig.development.database;
var dbuser = dbconfig.production.username || dbconfig.development.username;
var dbpw = dbconfig.production.password || dbconfig.development.password;

var orm = new Sequelize(dbname, dbuser, dbpw, {
  host: dbconfig.production.host || dbconfig.development.host, 
  port: dbconfig.production.port || dbconfig.development.port
}); */
/*
var orm = new Sequelize('enwitraDB', null, null, {
  dialect: "sqlite",
  storage: './enwitra.db',
});
*/

var Sequelize = require('sequelize');
var orm = new Sequelize('sql_testing', 'domil@domilserver', 'qwert12345!', {
  host: 'domilserver.database.windows.net',
  dialect: 'mssql',
  driver: 'tedious',
  options: {
    encrypt: true,
    database: 'sql_testing'
  },
  port: 1433,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  dialectOptions: {
    encrypt: true
  }
});






orm
.authenticate()
.then(function(err) {
  console.log('Connection has been established successfully.');
}, function (err) {
  console.log('Unable to connect to the database:', err);
});



var Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

///////////////////////////////////////////////////////
// Schema + Initialization with test data
///////////////////////////////////////////////////////

var User = orm.define('User', {
  first: { type: Sequelize.STRING, allowNull: false },
  last: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, allowNull: false, unique: true },
  salt: { type: Sequelize.STRING, allowNull: false },
  password: { type: Sequelize.STRING, allowNull: false }
}, {
  instanceMethods: {
    comparePasswords: function(candidatePassword, cb) {
      bcrypt.compare(candidatePassword, this.getDataValue('password'), function(err, isMatch) {
        if (err) {
          cb(err, null);
        } else {
          cb(null, isMatch);
        }
      });
    }
  } 
});

User.addHook('beforeCreate', 'hashPassword', function(user, options, next){
  
  console.log("hashing the password");
  
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {

    if (err) {
      return next(err);
    }

    console.log("salt is: ", salt);

    bcrypt.hash(user.password, salt, null, function(err, hash){
      if (err) {
        return next(err);
      }

      console.log("hash is: ", hash);
      user.set('password', hash);
      user.set('salt', salt);
      next();
    });
  });
});


var Game = orm.define('Game', {
  name: { type: Sequelize.STRING, allowNull: false, unique: true }
});

var Type = orm.define('Type', {
  name: { type: Sequelize.STRING, allowNull: false, unique: true }
});

var Status = orm.define('Status', {
  name: { type: Sequelize.STRING, allowNull: false, unique: true }
});

var Tournament = orm.define('Tournament', {
  name: { type: Sequelize.STRING, allowNull: false },
  shortname: { type: Sequelize.STRING, allowNull: false, unique: true },
  rounds:{ type: Sequelize.INTEGER, allowNull: true },
 sessionTime:{ 
  type: Sequelize.INTEGER, 
  allownull:false
},
startTime: { 
  type: Sequelize.STRING, 
  allownull:false
},
teamsInMatch:{ type: Sequelize.INTEGER, allowNull: false },

});

Tournament.belongsTo(User, { as: 'Owner' });
Tournament.belongsTo(User, { as: 'Winner' });
Tournament.belongsTo(Game);
Tournament.belongsTo(Type);
Tournament.belongsTo(Status);

var Participant = orm.define('Participant', {
});

Participant.belongsTo(Tournament);
Participant.belongsTo(User);

var Match = orm.define('Match', {
  round: { type: Sequelize.INTEGER, allowNull: false },
  startTime: { 
    type: Sequelize.DATE, 
         defaultValue: Sequelize.NOW 
}
});

Match.belongsTo(Tournament);
Match.belongsTo(Match, { as: 'Parent'});
Match.belongsTo(User, { as: 'PlayerOne'});
Match.belongsTo(User, { as: 'PlayerThree'});
Match.belongsTo(User, { as: 'PlayerFour'});
Match.belongsTo(User, { as: 'PlayerTwo'});
Match.belongsTo(User, { as: 'Winner'});
Match.belongsTo(Status);

Promise.all([
  User.sync(),
  Game.sync(),
  Type.sync(),
  Status.sync()
])
.then(function(){
  return Tournament.sync();
})
.then(function(){
  return Participant.sync();
})
.then(function(){
  return Match.sync();
})
.then(function(){
  return Status.findOrCreate({ where: { name: 'Upcoming' } });
})
.then(function(){
  return Status.findOrCreate({ where: { name: 'In Progress' } });
})
.then(function(){
  return Status.findOrCreate({ where: { name: 'Completed' } });
})
.then(function(){
  Type.findOrCreate({ where: { name: 'Single Elimination' } });


  // Games
  Game.findOrCreate({ where: { name: 'Ping Pong' } });
  Game.findOrCreate({ where: { name: 'Beer Pong' } });
  Game.findOrCreate({ where: { name: '3x3 Basketball' } });

  // Types
  

});

exports.User = User;
exports.Game = Game;
exports.Type = Type;
exports.Status = Status;
exports.Tournament = Tournament;
exports.Participant = Participant;
exports.Match = Match;
