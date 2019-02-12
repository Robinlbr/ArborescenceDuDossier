# Documentation tuto 

## Installer mithril

Tout d'abord, pour pouvoir utiliser mithril, il vous faut installer node. Pour cela rendez vous sur le site de node qui est le suivant : <https://nodejs.org/fr/> et télécharger node.js. 
Lancez l'installation de node et suivez les indications qu'il vous donne. Une fois node installé, nous allons installer mithril. Créez ou ouvrez le dossier où vous allez réaliser votre application. Ensuite ouvrez votre invite de commande. 
Vous devez initialiser le répertoire en package npm avec la commande suivante : 

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
    
    
Créer un dossier src et insérez dans un fichier index.js le code suivant :
    
    import m from "mithril";
    m.render(document.body, "hello world");


Ensuite créer un fichier index.html avec ce contenu :

    <!DOCTYPE html>
    <body>
    <script src="bin/app.js"></script>
    </body>
    
    
Lancer avec la commande :

    npm start
    
    
Ouvrez index.html avec votre navigateur.



## Récupérer l'arborescence de notre dossier

Nous allons afficher sur une page web, une arborescence et une liste d'un système de fichiers.
Commençons par le contrôleur, c'est celui ci qui va lire dans notre système de fichiers, et nous renvoyer en JSON l'arborescence.
Le contrôleur doit ressembler à ca :
    
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
  
  
C'est au serveur que l'on demandera la réponse. Le serveur doit alors demander au contrôleur l'arborescence.
Voila à quoi doit ressembler le serveur : 

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
    app.listen(5000, function () {
      console.log('Example app listening on port 5000!')
    })
    http.createServer(function(request, response) {
      response.end('ok');
    }).listen(8000);
    console.log('Server running at http://127.0.0.1:8000/');
    module.exports = {fs}


Pour recevoir cette réponse côté client, nous devons alors envoyer une requête au serveur. Nous voulons afficher deux versions différentes de l'arborescence, une en liste et une autre en charte. Nous allons alors avoir deux modules.


## Module chart.js

Pour commencer, vous devez ajouter à votre index.html cette ligne de code dans le head :

    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    
    
et celle-ci dans le body :
    
    <div id="chart_div"></div>
    
    
Ensuite nous allons créer le fichier src/chart.js qui va envoyer la requête au serveur et traité la réponse JSON pour l'afficher en charte.
Pour pouvoir utiliser mithril il vous faut d'abord l'importer en utilisant le code suivant : 
    
    import m from "mithril"
    
    
Nous pouvons donc maintenant conçevoir la fonction qui enverra une requête GET à notre serveur, et qui nous renverra le résultat dans la variabe "Chart.list".

    //src/chart.js
    var Chart = {
        list: [],
        loadList: function(){
            return m.request({
                method:"GET",
                url:"http://127.0.0.1:5000/",
                withCredentials: false,
                dataType: "jsonp"
            })
            .then(function(result){
                Chart.list = result
            })

        },
     }
     export default Chart
     
     
Désormais, il nous faut traiter ce résultat pour l'afficher en charte. Il vous faut ajouter la fonction view (qui permettra l'affichage sur la page index.html) et la fonction drawChart(qui traite le résultat du serveur pour le transformer en charte).
Voici le code final :
    
    //src/chart.js
    import m from "mithril"
        var r = []
        var Chart = {
            list: [],
            loadList: function(){
                return m.request({
                    method:"GET",
                    url:"http://127.0.0.1:5000/",
                    withCredentials: false,
                    dataType: "jsonp"
                })
                .then(function(result){
                    Chart.list = result
                })

            },
            view: function(){
                google.charts.load('current', {packages:["orgchart"]})
                google.charts.setOnLoadCallback(drawChart)
                drawChart()   
            }
        }
        function drawChart() {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Name')
            data.addColumn('string', 'Manager')
            affichage(Chart.list,null)
            function affichage (tab, leparent)
            {
                for(var x in tab)
                {
                    r.push([x, leparent])
                    if (Object.keys(tab[x]).length !== 0){
                        for (var e in tab[x]){
                        r.push([e, x]);
                        affichage(tab[x][e],e);
                        }
                    }
                }
                  data.addRows(r);
            }
            var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
            chart.draw(data, {allowHtml:true});
        }
        export default Chart


Il nous reste plus qu'à appeler le résultat dans l'index.js, avec le code suivant :
    
    import m from "mithril"
    import Chart from "emplacement de votre fichier"
    Chart.loadlist()
    m.mount(document.head,Chart)
    
    
Pour tester, lancer votre serveur avec la commande suivante : 

    node gfserveur.js
    
    
Et lancez la page index.html sur votre navigateur.


## Module liste.js
