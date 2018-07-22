var db = require('../db/db.js');
var logic = require('../db/logic.js');
var q= require('q');
var async = require('async');

module.exports = {

  
  allMatches: function(req, res, next) {

    db.Match.findAll({include: [
      db.Tournament, 
      { model: db.User, as: 'Winner' },
      { model: db.User, as: 'PlayerOne' },
      { model: db.User, as: 'PlayerTwo' }
    ]})
    .then(function(matches){
      res.status(200).send(matches);
    });
  },

  updateMatch: function(req, res, next) {

    // If the tournament is completed
      // you can't do anything anymore
    // otherwise you can update the stuff

    var updateMatch = req.body[0];
    var updateWinner = req.body[1];
    var matchIndex = req.body[2];
    //var numberRounds = req.body[3];

    //console.log(numberRounds);

    return db.Match.find( { where: { id: updateMatch.id } })
    .then(function (match) {
      if(updateWinner.id != match.PlayerOneId && updateWinner.id != match.PlayerTwoId)
        res.status(403).send("This player was not part of this match");
      else {

      match.WinnerId = updateWinner.id;
      match.StatusId = 3;
      match.save();

      // if final round
      return db.Tournament.find({where : {id : match.TournamentId}})
      .then(function(tournament){

      if ( match.round === tournament.rounds ) {
        // update tournament
        // then you need to update the state of the tournament to COMPLETED
        // and set the tournament winner to the person's name

        console.log("It's the final round");
          tournament.WinnerId = match.WinnerId; 
          tournament.StatusId = 3;
          tournament.save();
        
          res.status(200).send(tournament);
        
      }
     else {

        //Once the winner is selected, then it needs to go into the parent match
        return db.Match.find( { where: { id: match.ParentId } })
        .then(function (nextMatch) {

          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
          console.log("matchIndex is: ", matchIndex);

          if ( matchIndex % 2 !== 0 ) {
            nextMatch.PlayerOneId = match.WinnerId;
            nextMatch.save();
          } else {
            nextMatch.PlayerTwoId = match.WinnerId;
            nextMatch.save();
          }

        })
        .then(function(){
          return db.Match.findAll({include: [
          db.Tournament, 
          { model: db.User, as: 'Winner' },
          { model: db.User, as: 'PlayerOne' },
          { model: db.User, as: 'PlayerTwo' }
          ]})
          .then(function(matches){
            res.status(200).send(matches);
          });
        });
        
      }
    })
    }

    });

  },

  createMatch: function (round, parentId, tournamentId) {

    if (round === 0) {
      return;
    }

    return db.Tournament.find( { where: { id: tournamentId } })
    .then(function (tournament) {
      
      if ( tournament.StatusId === 1) {
       var eventDate = tournament.startTime;
       var event = new Date(eventDate); 
       var date = event.getDate() + Math.floor(round/3.5);
        var min  = event.getMinutes() + ((round-1)%3)*(tournament.sessionTime);
        event.setDate(date);
        event.setMinutes(min);
        return db.Match.create( {
          TournamentId: tournamentId,
          round: round,
          StatusId: 1,
          ParentId: parentId,
          PlayerOneId: null,
          PlayerThreeId: null,
          PlayerFourId: null,
          PlayerTwoId: null,
          WinnerId: null,
          startTime:event
        });

      }

    });

  },

  createMatchRecursively: function (round, parentId, tournamentId,teams) {

    var matchArray = [];

    if (round === 0) {
      return;
    }

    // check the tournament id
    return db.Tournament.find( { where: { id: tournamentId } })
    .then(function (tournament) {
      
      // add the check for status of 1
      if ( tournament.StatusId === 1 ) {
         var eventDate = tournament.startTime;
        var event = new Date(eventDate); 
       var date = event.getDate() + Math.floor(round/3.5);
        var min  = event.getMinutes() + ((round-1)%3)*(tournament.sessionTime);
        event.setDate(date);
        event.setMinutes(min);

        //return Promise.all([
          var promises = [];
          for(i=0;i<teams;i++)
          {
               console.log('creating matches in for loop');
          var promise= db.Match.create( {
            TournamentId: tournamentId,
            round: round,
            StatusId: 1,
            ParentId: parentId,
            PlayerOneId: null,
            PlayerTwoId: null,
            PlayerThreeId: null,
            PlayerFourId: null,
            WinnerId: null,
            startTime:event
          })
          promises.push(promise);
        }
          // db.Match.create( {
          //   TournamentId: tournamentId,
          //   round: round,
          //   StatusId: 1,
          //   ParentId: parentId,
          //   PlayerOneId: null,
          //   PlayerTwoId: null,
          //   WinnerId: null,
          //   startTime:event
          // })
       // ])
       q.all(promises)
        .then(function (matches) {
          console.log('creating matches recursively');
          // return Promise.all([
          //   module.exports.createMatchRecursively(round - 1, matches[0].dataValues.id, tournamentId )
          // ])
          // .then(function() {
          //   return Promise.all([
          //     module.exports.createMatchRecursively(round - 1, matches[1].dataValues.id, tournamentId )
          //   ]);
          // });
         
          // for(j=0;j<teams;j++){
          //   return Promise.all([
          //  module.exports.createMatchRecursively(round - 1, matches[j].dataValues.id, tournamentId )
          // ]);
          // }

          async.mapSeries(matches, function(match,callback){
            console.log('calling that function*************')
            console.log('*************', match.dataValues.id);
            return Promise.all([
              module.exports.createMatchRecursively(round - 1, match.dataValues.id, tournamentId )
             ])
             .then(function(){
               callback();
             })
          })
        })
        
      }
    });

  },

 

  generateBracket: function(req, res, next) {
    
    // RESET
      // db.Tournament.find( { where: { shortname: req.body.shortname } })
      //   .then(function (tournament) {
      //     tournament.StatusId = 1;
      //     tournament.save();
      // });

    // ACTUAL
    var tournamentId = req.body.id;
    var tournamentStatus = req.body.StatusId;
    //var sessionTime = req.body.sessionTime;
    var numRounds = 0;
    var teams=0;
    var playerCount=0;
    // need to make sure that status is 2 or 3

    console.log("STATUS!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log('******',tournamentStatus);
    console.log(req.body);
    if ( tournamentStatus === 1 ) {
      
      // Get all the participants in this tournament
     
    return db.Participant.findAll( { where: {TournamentId: tournamentId} })
        .then (function(participants) {
             playerCount = participants.length;
            console.log('!!!!!!!!participants', playerCount);
           return db.Tournament.find( { where: { id: req.body.id } })
          })
            .then(function(tournament){
             teams= tournament.teamsInMatch;
            // calculate the number of rounds in tournament
              console.log('teams = ',teams)
              numRounds = logic.numberOfRounds(playerCount,teams);
              console.log('numrounds', numRounds);
            
          // Create the final match
              console.log('creating final match');
              return module.exports.createMatch(numRounds, null, tournamentId);
        })
        .then(function (createdMatch) {

          if (numRounds > 1) {
            console.log('creating recursive matches');
            return module.exports.createMatchRecursively(numRounds- 1, createdMatch.id, tournamentId,teams);
          }
        
        })
        .then(function () {
          return db.Tournament.find( { where: { id: req.body.id } })
        })
            .then(function (tournament) {
              tournament.StatusId = 2;
              tournament.rounds=numRounds;
              tournament.save();
          
          // pack the first round matches with participants          
           return db.Participant.findAll( { where: {TournamentId: tournamentId} })
          .then (function(participants) {
            
            var players = participants;

            return db.Match.findAll( { where: { tournamentId: tournamentId } })
            .then(function (matches) {

                var abandonedParents = [];

                var firstRoundMatches = [];
                for (var k = 0; k < matches.length; k++ ) {
                  if (matches[k].round === 1) {
                    firstRoundMatches.push(matches[k]);
                  }
                }
               
               for( var i = 0; i < firstRoundMatches.length; i++ ) {
                  console.log('value of 1st round matches ', i);
                  var player = new Array(4);
                  // var playerTwo = null;
                  // var playerThree = null;
                  // var playerFour = null;

                  // if ( players.length > 0 ) {
                  //   playerOne = players.shift();
                  // }

                  // if ( players.length > 0 ) {
                  //   playerTwo = players.shift();
                  // }
                  for(j=0;j< tournament.teamsInMatch ;j++){
                    if ( players.length > 0 ) 
                   player[j]= players.shift(); 
                   else 
                     break; 
                  }
                  
                  // if ( playerOne && playerTwo ) {                  
                  //   firstRoundMatches[i].updateAttributes({ 
                  //     PlayerOneId: playerOne.dataValues.UserId,
                  //     PlayerTwoId: playerTwo.dataValues.UserId
                  //   });
                  // } else if (playerOne || playerTwo ) {
                  //   firstRoundMatches[i].updateAttributes({ 
                  //     PlayerOneId: playerOne.dataValues.UserId
                  //   });
                  // } else {
                    
                  //   // var parentId = firstRoundMatches[i].ParentId;
                  //   // abandonedParents.push(parentId);
                  //   firstRoundMatches[i].destroy();
                  // }

                    if(player[3] != null){
                      firstRoundMatches[i].updateAttributes({ 
                             PlayerOneId: player[0].dataValues.UserId,
                             PlayerTwoId: player[1].dataValues.UserId,
                             PlayerThreeId:player[2].dataValues.UserId,
                             PlayerFourId:player[3].dataValues.UserId
                           });
                    } else if (player[0] && player[1] && player[2] && !player[3]) {
                        firstRoundMatches[i].updateAttributes({ 
                          PlayerOneId: player[0].dataValues.UserId,
                          PlayerTwoId: player[1].dataValues.UserId,
                          PlayerThreeId:player[2].dataValues.UserId
                         });
                       } else if (player[0] && player[1] && !player[2] && !player[3]) {
                        firstRoundMatches[i].updateAttributes({ 
                          PlayerOneId: player[0].dataValues.UserId,
                          PlayerTwoId: player[1].dataValues.UserId
                         });
                        }
                        else if (player[0] && !player[1] && !player[2] && !player[3]) {
                          firstRoundMatches[i].updateAttributes({ 
                            PlayerOneId: player[0].dataValues.UserId
                           });
                          } else
                          firstRoundMatches[i].destroy();
                
                      }
                     
                        res.status(200).status(matches);
                     
                // send the results
                
            })
            .catch(function (error) {
              console.error(error);
            });
        })
        .catch(function (error) {
          console.log("error packing the first round matches");
          console.error(error);
          });
        });
      } // close if statement
  }

};
