// gfcontroleur.js
var fs = require('fs');
clog= console.log;
var lechemin = './dossier';

var Controller = 
{
    Files: function(){ 
    var result = grapheFiles(lechemin);
    return result;
    }
}
function grapheFiles (dir, result, dossier){
    var result = {};
    var files = fs.readdirSync(dir);

    for (var i in files){   
        var chemin = dir + '/' + files[i];  
        if (fs.statSync(chemin).isFile()){
            result[files[i]] = {};
        }
        else if(fs.statSync(chemin).isDirectory()){  
            result[files[i]] = grapheFiles(chemin, result, dossier);
        }    
    }     
return result;
}
module.exports = { Controller }