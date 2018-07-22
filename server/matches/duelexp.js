
var teams=[{'id':1,'GameId':2},{'id':2,'GameId':2},{'id':5,'GameId':2},{'id':6,'GameId':2}];


let indexes= new Array(teams.length);
    let userids=[];
    for (var i=0;i<indexes.length;i++){
          indexes[i]=i+1;
          userids[i+1]= teams[i].id; 
    }
     console.log(indexes);
     console.log(userids);
   
const Duel= require('duel');

 function duelcomp(participants){
    
     let round1=duelDouble.findMatches({ s: 1, r: 1 });
     let pairings = round1.map(function(a){
          let pair= a.p;
          return {p: pair.map(function(b){
              return userids[b];
          }), id:a.id}
     }) ;
     console.log(pairings);
     return pairings;
   }
   
   var duelDouble = Duel(teams.length, {last: Duel.LB, short: true })
   //console.log(duelDouble.matches);
   
//    duelDouble.matches.forEach(function (m) {
//     duelDouble.score(m.id, [1, 0]);
//     console.log(duelDouble.matches.id);
//   });
//console.log();
duelDouble.score(duelDouble.matches[0].id, [1, 0]);  
matches= duelcomp(teams);

 function results(match, winner ){
    if(winner==match.p[0]){
        return [1,0];
    }
    return [0,1];
 }  

 let result= results(matches[0],1);
 console.log(result);
duelDouble.score(matches[0].id,result);

console.log(duelDouble.findMatches({ s: 1, r: 2 }));
console.log(duelDouble.matches);

var struct={'id': duelDouble.matches[0].id,'round':1,'player1':5,'player2':6,'winner':null,'tournamentid':21}

console.log(struct);

var mtch={'id':struct.id, p:[userids.indexOf(struct.player1),userids.indexOf(struct.player2)]}

console.log(mtch);
console.log(duelDouble.upcoming(2))