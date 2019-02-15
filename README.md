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
    
<p> npm (Node Package Manager) est le gestionnaire de paquets officiel de Node.js.
 La commande npm init va générer un fichier package.json qui décrit la configuration de votre projet.
<p/>
<p>
Ensuite vous allez devoir organiser votre application en modules, pour pouvoir appeler lors de l'ouverture de votre page, le module que vous désirez afficher.
<p/> 

    npm install mithril --save
    npm install webpack webpack-cli --save-dev
   
 Lien vers mithril : https://mithril.js.org/
  <br/>
  Webpack permet d'organiser votre application en modules. Lien vers webpack : https://webpack.js.org/.
 <br/>  
 
 
Vous allez devoir ajouter une entrée "start" à la section scripts dans package.json : 

    {
      // ...
      "scripts": {
      "start": "webpack src/index.js --output bin/app.js -d --watch"
      }
    }
 <p>  Ce script va permettre lorsque l'on lance la commande **npm start** de lire le fichier src/index.js et de créer le fichier app.js en fonction de l'index.js.</p>
 <br/>    

## Récupérer l'arborescence de votre dossier

<br/> 
<p>Vous allez à présent récupérer le contenu de votre dossier. 
Tout d'abord, créer un dossier que vous nommerez "dossier" à la racine de votre application. C'est dans ce répertoire que vous déposerez le dossier dont vous désirez l'arborescence.</p>
<p>
Rappelez vous, c'est au serveur que vous demanderez de fournir l'arborescence. Mais avant cela, vous avez besoin d'un script permettant de traiter le contenu de votre dossier.
 </p>
 <p>
 Voici un exemple de comment récupérer le contenu de son dossier et le renvoyer en un objet Javascript (le mettre en un objet Javascript sera plus simple pour ensuite le transformer en JSON):</p>
    
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
  
<br/>   

Cette fonction sera appelée et récupérée par le serveur. Vous allez donc avoir besoin de créer un serveur. Voici à quoi devrez ressembler votre serveur :

    //gfserveur.js
    var http = require("http");
    var fs = require('fs');
    var controleur = require("./gfcontroleur");
    
    Console.log(controleur.Controller.Files());

    http.createServer(function(request, response) {
      response.end('ok');
    }).listen(8000);

<br/> 

Voilà, vous avez réussi à récupérer le contenu de votre dossier. Vous pouvez tester en allumant votre serveur à l'aide de Node. Ouvrez le powershell de votre application, et lancez votre serveur à l'aide de la commande suivante : 

    node gfserveur.js
<p>(remplacez "gfserveur.js" par le nom de votre serveur).</p>
<p>En théorie, vous devriez avoir affiché dans le powershell, le contenu du dossier.</p>
    
<br/> 

## Module chart.js

Nous allons reprendre l'exemple de la chart de google pour notre exemple à nous : https://developers.google.com/chart/interactive/docs/gallery/orgchart
Pour commencer, vous devez ajouter à votre index.html cette ligne de code dans le head :

    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    
<br/>     
et celle-ci dans le body :
    
    <div id="chart_div"></div>
car comme vous l'avez vu le script de google la chart est construit dans le head et envoyé dans la div "chart_div" 
    
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
