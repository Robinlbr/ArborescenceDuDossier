# Afficher une arborescence de fichier sur une page web
<br/> 

<p>Vous désirez afficher sur une page web, à l'aide du Javascript, une arborescence de fichier permettant de voir plus facilement le contenu d'un ou plusieurs dossiers ?</p><p>Pour se faire, vous allez avoir besoin d'un serveur (permettant de récupérer le contenu de votre dossier), et de Mithril (permettant de créer une application web monopage).<p/>
<p>Tout d'abord, installez Mithril.</p>
<br/>

##  Installation de Mithril 
<p> 
Mithril.js est un framework JavaScript moderne qui permet de faire des applications monopage.
Pour pouvoir utiliser mithril, il vous faut installer node. <p/> 
<p>
Pour cela rendez-vous sur le site de node : https://nodejs.org/fr/ et téléchargez node.js. 
Lancez l'installation de node et suivez les indications qu'il vous donne. <p/> 
<p>
Ensuite nous allons nous préoccupez de mithril.
Créez ou ouvrez le dossier où vous allez réaliser votre application. Ensuite ouvrez votre invite de commande. <p/> 
Vous devez générer un fichier package.json décrivant la configuration de votre projet, pour cela tapez cette commande :
<br/> 

    npm init 
    
 npm (Node Package Manager) est le gestionnaire de paquets officiel de Node.js.
 La commande npm init va générer un fichier package.json qui décrit la configuration de votre projet.
<br/> 
Ensuite installer les outils nécessaire :
<br/> 

    npm install mithril
    npm install webpack webpack-cli 
    
 <br/>  
 Lien vers mithril : https://mithril.js.org/
 
 
Ajouter une entrée "start" à la section scripts dans package.json : 

    {
      // ...
      "scripts": {
      "start": "webpack src/index.js --output bin/app.js -d --watch"
      }
    }
    
 <br/>    
Créer un dossier src et insérez dans un fichier index.js le code suivant :
    
    import m from "mithril";
    m.render(document.body, "hello world");

<br/> 
Ensuite créer un fichier index.html avec ce contenu :

    <!DOCTYPE html>
    <body>
    <script src="bin/app.js"></script>
    </body>
    
<br/>     
Lancer dans le powershell la commande :

    npm start
    
<br/>     
Pour vérifier que mithril soit bien installé, ouvrez index.html avec votre navigateur.


<br/> 
<br/> 

## Récupérer l'arborescence de notre dossier

<br/> 
Nous allons afficher sur une page web, une arborescence et une liste d'un système de fichiers.
Commençons par le contrôleur, c'est celui ci qui va lire dans notre système de fichiers, et nous renvoyer en JSON l'arborescence.
Le contrôleur doit ressembler à ca :
    
    // gfcontroleur.js
    var fs = require('fs');//appele du module file systeme pour permettre d'acceder au fichier ou dossier 
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
        var files = fs.readdirSync(dir);//lit dans les dossier

        for (var i in files){ parcours le dossier   
            var chemin = dir + '/' + files[i];  //selectionne le contenu du dossier
            if (fs.statSync(chemin).isFile()){//si c'est un fichier
                result[files[i]] = {};//ajout dans l'objet un objet vide avec pour clé le fichier
            }
            else if(fs.statSync(chemin).isDirectory()){  si c'est un dossier
                result[files[i]] = grapheFiles(chemin, result, dossier);//on rappel la fonction 
            }    
        }     
    return result;//on renvoie l'objet
    }
    module.exports = { Controller }
  
<br/>   
C'est au serveur que l'on demandera la réponse. Le serveur doit alors demander au contrôleur l'arborescence.
Voila à quoi doit ressembler le serveur : 

    //gfserveur.js
    var http = require("http");//appel du module http pour créer un serveur
    var fs = require('fs');//appel du module fs 
    var express = require('express');//appel du module express pour utiliser des routes
    var app = express();
    var controleur = require("./gfcontroleur");//appel du controleur
    app.use(function(req, res, next) {//autorise le serveur a envoyer 
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

<br/> 
Pour recevoir cette réponse côté client, nous devons alors envoyer une requête au serveur. Nous voulons afficher deux versions différentes de l'arborescence, une en liste et une autre en charte. Nous allons alors avoir deux modules.

<br/> 
<br/> 

## Module chart.js

Pour commencer, vous devez ajouter à votre index.html cette ligne de code dans le head :

    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    
<br/>     
et celle-ci dans le body :
    
    <div id="chart_div"></div>
    
<br/>     
Ensuite nous allons créer le fichier src/chart.js qui va envoyer la requête au serveur et traité la réponse JSON pour l'afficher en charte.
Pour pouvoir utiliser mithril il vous faut d'abord l'importer en utilisant le code suivant : 
    
    import m from "mithril"
    
 <br/>    
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
     
 <br/>     
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

<br/> 
Il nous reste plus qu'à appeler le résultat dans l'index.js, avec le code suivant :

    //src/index.js
    import m from "mithril"
    import Chart from "../src/chart.js"
    Chart.loadList()
    m.mount(document.head,Chart)
    
<br/>  
Changez votre code dans l'index.html comme ceci :

    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <title>Systeme de fichier</title>
      </head>
      <body>
        <script src="bin/app.js"></script>
        <div id="chart_div"></div>
      </body>
    </html>
  <br/>
Pour tester, lancer votre serveur avec la commande suivante : 

    node gfserveur.js
    
 <br/>    
Et lancez la page index.html sur votre navigateur.
<br/> 
N'oubliez pas de mettre à jour votre app.bin avec la commande : 
    
    npm start
<br/>

## Module list.js
Maintenant que notre google chart est fonctionelle nous allons passer à la liste.<br/>
Comme pour la charte, nous allons envoyer une requête au serveur pour avoir l'arborcence en JSON.<br/>
Copiez ce code dans votre "src/list.js".

    import m from "mithril"
    var List = {
        list: [],
        loadList: function(){
            return m.request({
                method:"GET",
                url:"http://127.0.0.1:5000/",
                withCredentials: false,
                dataType: "jsonp"
            })
            .then(function(result){
                List.list = result
            })

        },
    }
  <br/>
    
Ensuite nous allons faire la fonction qui renverra l'arborescence JSON en forme de liste : 
    
    //src/list.js
    function afficheListe(objet){
        var liste = []
        var liste2 = []
        for(var x in objet){
            if (Object.keys(objet[x]).length == 0){
                liste.push(m("li",x))
            }
            else{
                liste.push(m("li",x))
                liste2 = afficheListe(objet[x])
                liste.push(m("ul",liste2))
            }
        }
        return liste
   
<br/>
Et pour finir terminer, ajouter la fonction "view" permettant de l'afficher. <br/>
Ajoutez ce bout de code, à la suite de la fonction loadList();
    
        view: function(){
            var uneliste = afficheListe(List.list)
                return m("div",{id:"liste"},
                m("ul",uneliste)) 
        }
        
 <br/>       
Voici à quoi dans ressembler le code final :

    import m from "mithril"
    var List = {
        list: [],
        loadList: function(){
            return m.request({
                method:"GET",
                url:"http://127.0.0.1:5000/",
                withCredentials: false,
                dataType: "jsonp"
            })
            .then(function(result){
                List.list = result
            })

        },
        view: function(){
            var uneliste = afficheListe(List.list)
                return m("div",{id:"liste"},
                m("ul",uneliste)) 
        }
    }
    function afficheListe(objet){
        var liste = []
        var liste2 = []
        for(var x in objet){
            if (Object.keys(objet[x]).length == 0){
                liste.push(m("li",x))
            }
            else{
                liste.push(m("li",x))
                liste2 = afficheListe(objet[x])
                liste.push(m("ul",liste2))
            }
        }
        return liste
    } 
    export default List

il faut maintenant finaliser l'index.js qui doit ressembler à ça :

    //src/index.js
    import m from "mithril"
    import List from "../src/list.js"
    import Chart from "../src/chart.js"
    List.loadList()
    Chart.loadList()

    m.route(document.body, "",
    {
        "/liste" : m.mount(document.body, List),
        "/chart" : m.mount(document.head, Chart)
    })


    
<br/>
<br/> 
Remettez à jour le app.js :
    
    npm start
<br/>
Pour tester, lancer votre serveur avec la commande suivante : 

    node gfserveur.js
    
 <br/>    
Et lancez la page index.html sur votre navigateur.
<br/> 
