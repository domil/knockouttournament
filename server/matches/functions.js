
// Not important just for experimentation work


var db = require('../db/db.js');
var logic = require('../db/logic.js');
var q= require('q');


// return db.Participant.findAll( { where: {TournamentId: 1} })
// .then (function(participants) {
  
//   var players = participants;

//   return db.Match.findAll( { where: { tournamentId: 1 } })
//   .then(function (matches) {

//       var abandonedParents = [];

//       var firstRoundMatches = [];
//       for (var k = 0; k < matches.length; k++ ) {
//         if (matches[k].round === 1) {
//           firstRoundMatches.push(matches[k]);
//         }
//       }

//       for ( var i = 0; i < firstRoundMatches.length; i++ ) {
        
//         var player = new Array(4);
        
//         for(j=0;j<4;j++){
//           if ( players.length > 0 ) 
//          player[j]= players.shift(); 
//          else 
//            break; 
//         }
        
//        //var parentId = firstRoundMatches[i].ParentId;
      

//           if(player[3] != null){
//             firstRoundMatches[i].updateAttributes({ 
//                    PlayerOneId: player[0].dataValues.UserId,
//                    PlayerTwoId: player[1].dataValues.UserId,
//                    PlayerThreeId:player[2].dataValues.UserId,
//                    PlayerFourId:player[3].dataValues.UserId
//                  });
//           } else if (player[0] && player[1] && player[2] && !player[3]) {
//               firstRoundMatches[i].updateAttributes({ 
//                 PlayerOneId: player[0].dataValues.UserId,
//                 PlayerTwoId: player[1].dataValues.UserId,
//                 PlayerThreeId:player[2].dataValues.UserId
//                });
//              } else if (player[0] && player[1] && !player[2] && !player[3]) {
//               firstRoundMatches[i].updateAttributes({ 
//                 PlayerOneId: player[0].dataValues.UserId,
//                 PlayerTwoId: player[1].dataValues.UserId
//                });
//               }
//               else if (player[0] && !player[1] && !player[2] && !player[3]) {
//                 firstRoundMatches[i].updateAttributes({ 
//                   PlayerOneId: player[0].dataValues.UserId
//                  });
//                 } else
//                 firstRoundMatches[i].destroy();
      
//             }
//       // send the results
//      // res.status(200).status(matches);
//     console.log(matches);
//     })
//   .catch(function (error) {
//     console.error(error);
//   });
// })
// .catch(function (error) {
// console.log("error packing the first round matches");
// console.error(error);
// })





db.Tournament.find( { where: { shortname: "kheloJito" } })
        .then(function (tournament) {
          tournament.StatusId = 1;
          tournament.teamsInMatch=2;
          tournament.save();
      });