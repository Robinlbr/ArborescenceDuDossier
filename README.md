# Documentation tuto 
## Installer mithril
Pour pouvoir utiliser mithril il faut d'abord avoir installer node. Pour cela il faut vous rendre sur le site de node qui est le suivant : <https://nodejs.org/fr/> et télécharger node.js. Lancez l'installation de node et suivez les indications qu'il vous donne. Une fois node installé il vous faut installer mithril. Créez ou ouvrez le dossier où vous allez réaliser votre application. Ensuite ouvrez votre invite de commande. Vous devez d'abord initialiser le répertoire en package npm avec la commande suivante : 

    npm init --yes 
    
Ensuite installer les outils nécessaire :

    npm install mithril@next --save 
    npm install webpack webpack-cli --save-dev
    
Ajouter une entrée "start" à la section scripts dans package.json : 

    {
      // ...
      "scripts": {
      "start": "webpack src/index.js --output bin/app.js -d --watch"
      }
    }
crée un dossier src et crée un fichier index.js dedans
    
    import m from "mithril";
    m.render(document.body, "hello world");

crée un index.html : 

    <!DOCTYPE html>
    <body>
    <script src="bin/app.js"></script>
    </body>

lancer avec la commande :

    npm start
    
ouvrir index.html avec votre navigateur.

## Creer une page avec mithril

Nous allons creer une page qui affiche une arborescence et une liste d'un systeme de fichier.
commençons par l'arborescence. Tout d'abord nous allons creer notre server node.js 
le serveur appelera une methode qui sera dans notre controleur que l'on appelera gfcontroleur.js qui doit ressembler à ça :
    
    // gfcontroleur.js
    var fs = require('fs');
    clog= console.log;
    var lechemin = 'l'emplacement do votre dossier mère';

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
  
du coté serveur notre code ressemble a ça : 

    //gfserveur.js
    var http = require("http");
    var fs = require('fs');
    var express = require('express');
    var app = express();
    var controleur = require("./gfcontroleur");
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", null);
      res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
      next();
    });
    app.get('/', (req, res) => {
      var result = controleur.Controller.enGraphe();
      res.json(result);
    });
    app.get('/liste', function (req, res) {
      var leresult = controleur.Controller.enListe();
      clog(leresult);
      var lestring = "";
      leresult.forEach(function(element) {
       lestring = lestring + element;
      });
      res.send(lestring);
    })
    app.listen(5000, function () {
      console.log('Example app listening on port 5000!')
    })
    http.createServer(function(request, response) {
      response.end('ok');
    }).listen(8000);
    console.log('Server running at http://127.0.0.1:8000/');
    module.exports = {fs}
