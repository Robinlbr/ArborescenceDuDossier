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
    app.listen(5000, function () {
      console.log('Example app listening on port 5000!')
    })
    http.createServer(function(request, response) {
      response.end('ok');
    }).listen(8000);
    console.log('Server running at http://127.0.0.1:8000/');
    module.exports = {fs}

Maintenant que le coté serveur est ok nous allons passer du coté qui client qui va faire une requête au serveur pour récupérer l'objet du serveur qui contient notre systeme de fichier et qui va le transformer en arboréscence ou en liste html. nous allons commencer par l'arboréscence.

Pour commencer devez ajouter a votre index.html crée lors de l'installation de mithril cette ligne de code dans le head :

    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    
et celle-ci dans le body :
    
    <div id="chart_div"></div>
    
Ensuite nous allons creer le fichier src/chart.js qui va faire la requete et traité l'objet pour l'afficher en arboréscence.
Pour pouvoir utiliser mithril il vous faut d'abord l'importer en utilisant le code suivant : 
    
    import m from "mithril"
    
Nous pouvons donc maintenant creer la fonction qui envera une requete a notre serveur :

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
Maintenant que nous avons récuperé notre objet il nous faut le traiter avec la fonction drawchart :
    
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
Vous avez sans doûte remarqué que nous utilisons un tableau nommé r dans notre fonction nous allons donc le déclarer et nous allons aussi afficher notre arboréscence :

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
    
 voici notre code final de chart.js mais vous ne pouvez pas encore le lancer car il faut utiliser l'index.js qui ressemble à ça :
    
    import m from "mithril"
    import Chart from "emplacement de votre fichier"
    Chart.loadlist()
    m.mount(document.head,Chart)
    
Lancer votre serveur avec la commande suivante : 

    node gfserveur.js
    
Puis lancer votre index.html et votre arborécsence s'affichera.
