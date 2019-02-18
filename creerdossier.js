// gfcontroleur.js
var fs = require('fs');
var c = require('./Config')
clog= console.log;
var lechemin = c.dossier;

var Controller = 
{
    lefichier: function(){ 
        creerlefichier();
    },
    ledossier: function(){
        creerledossier();
    }
}


function creerlefichier(lechemin, lenom){
    fs.appendFile('mynewfile1.txt', ' This is my text.', function (err) {
      if (err) throw err;
      console.log('Updated!');
    });

}

function creerledossier(lechemin, lenom){
    if (!fs.existsSync(lechemin)){
        fs.mkdirSync(lechemin);
    }
}


module.exports = { Controller }