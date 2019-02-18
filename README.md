# Afficher une arborescence de fichier sur une page web
<br/> 

<p>Vous désirez afficher sur une page web, à l'aide du Javascript, une arborescence de fichier permettant de voir plus facilement le contenu d'un ou plusieurs dossiers ?</p><p>Pour se faire, vous allez avoir besoin d'un serveur (permettant de récupérer le contenu de votre dossier), et de Mithril (permettant de créer une application web monopage).<p/>
<p>Avant de commencer quoique ce soit, vous avez besoin de récupérer le contenu de votre dossier :</p>
<br/>

## Récupérer l'arborescence de votre dossier

<br/> <p>
  Tout d'abord, vous allez avoir besoin de Node. Node est une plateforme permettant de développer des applications en utilisant du JavaScript. <br/>
Rendez vous sur le site de node : https://nodejs.org/fr/ et téléchargez node.js. 
 Lancez l'installation de node et suivez les indications qu'il vous donne.<p/> 
Vous devez générer un fichier package.json décrivant la configuration de votre projet, pour cela tapez cette commande :
<br/> 

    npm init 
    
<p> npm (Node Package Manager) est le gestionnaire de paquets officiel de Node.js.
 La commande npm init va générer un fichier package.json qui décrit la configuration de votre projet.
<p>
Rappelez vous, c'est au serveur que vous demanderez de fournir l'arborescence. Mais avant cela, vous avez besoin d'un script permettant de traiter le contenu de votre dossier.
 </p>
 <p>
 Créez un fichier gfcontroleur.js qui permet de récupérer le contenu de votre dossier et le renvoyer en un objet Javascript :</p>
 <p>Vous pouvez installer ce module ici : https://github.com/AxelLy/ArborescenceDuDossier/blob/master/gfcontroleur.js</p>
 <p>Il vous faut installer Config.js : https://github.com/AxelLy/ArborescenceDuDossier/blob/master/Config.js que vous mettrez à la racine de votre application. Cela vous permet de changer le nom du dossier par défaut.</p>
    
    // gfcontroleur.js
    var fs = require('fs');
    var c = require('./Config')
    clog= console.log;
    var lechemin = c.dossier;

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
    
    console.log(controleur.Controller.Files());

    http.createServer(function(request, response) {
      response.end('ok');
    }).listen(8000);

<br/> 

Voilà, vous avez réussi à récupérer le contenu de votre dossier. Vous pouvez tester en allumant votre serveur à l'aide de Node. Ouvrez le powershell de votre application, et lancez votre serveur à l'aide de la commande suivante : 

    node gfserveur.js
<p>(remplacez "gfserveur.js" par le nom de votre serveur).</p>
<p>Si tout a bien était configuré, vous devriez avoir affiché dans le powershell, le contenu du dossier.</p>
    
<br/> 

## Affichage sur une page web 

<p> Vous avez bien récupérer le contenu de votre répertoire, mais son résultat est difficile à interpréter. De plus, l'afficher sur le PowerShell n'est pas plaisant.</p>
<p> Vous pouvez donc pour faciliter sa lecture, l'afficher sur une page web. Nous avons décidé de vous donner deux exemples d'affichage, une en liste, et la seconde en Google Chart.
</p>
<p> Mais d'abord, vous allez avoir besoin de Mithril. </p>

###  Installation de Mithril 
<p>  
Mithril.js est un framework JavaScript moderne qui permet de faire des applications monopage.<p/> 

<p>
Vous allez devoir organiser votre application en modules, pour pouvoir appeler lors de l'ouverture de votre page, le module que vous désirez afficher.
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
 <p>  Ce script va permettre lorsque l'on lance la commande **npm start** de lire le fichier src/index.js et de créer le fichier app.js en fonction de l'index.js. Créez donc un dossier "src"dans lequel vous insérerez votre index.js que vous pouvez télécharger ici : https://github.com/AxelLy/ArborescenceDuDossier/blob/master/src/index.js</p>
 <br/>    



## Les modules :


<p>
Dans notre exemple, vous allez avoir besoin de deux modules. Le premier traitant et transformant le résultat en liste (que nous appelerons module list.js), l'autre l'a transformant en Google Chart (que nous apelerons module chart.js).</p>
<p>
Le fichier index.js va seulement servir d'intermédiaire entre les scripts Javascript (permettant de transformer le contenu du dossier en liste/chart) et la page HTML sur laquelle ils seront affichés.</p>

<p> Avant d'installer les différents modules, vous devez faire quelques modifications au serveur. Ce dernier doit retourner le contenu du dossier en JSON lorsqu'on l'appelle. </p>
  <p> Vous allez avoir besoin d'express.js, express est un framework qui fournit un ensemble de fonctionnalités robuste pour les applications Web, notamment pour les routes. <br/> Tapez cette commande dans le PowerShell de votre application, pour pouvoir l'installer : </p>
  
    npm install express --save
 <br/>Lien du site : https://expressjs.com/fr/.
 
 <p> Ensuite modifier le serveur, voici à quoi il doit désormais ressembler : </p>
 <p> Vous pouvez récupérer le code ici : https://github.com/AxelLy/ArborescenceDuDossier/blob/master/gfserveur.js </p>
 
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
        var result = controleur.Controller.Files();
        res.json(result);
      });
      app.listen(5000, function () {
        console.log('Example app listening on port 5000!')
      })
      http.createServer(function(request, response) {
        response.end('ok');
      }).listen(8000);

<p> Il ne vous reste plus qu'à installer les modules. </p>
<br/>

### Module chart.js

<p>
  
Google Chart permet l'affichage d'une arborescence en arbre, de façon à ce que ce soit plus esthétique.<br/>
Le site Google Chart : https://developers.google.com/chart/interactive/docs/gallery/orgchart.<br/>
    
<br/>     
<p>Récupérez le fichier chart.js ici :https://github.com/AxelLy/ArborescenceDuDossier/blob/master/src/chart.js  <br/>
  Vous modifierez l'adresse par defaut dans Config.js.
Placez le dans un dossier src, ce module comporte 3 fonctions :</br>
    - La fonction loadList() qui permet de récuperer des données sur un serveur.</br>
    - La fonction view() qui va permettre d'afficher votre charte.</br>
    - La fonction darwChart() qui récupère les données du serveur et le transforme en charte.   </p>   


    //src/chart.js
    import m from "mithril"
    var Config = require("../Config")
    var r = []
    var Chart = {
        list: [],
        loadList: function(){
            return m.request({
                method:"GET",
                url: Config.serveur_adress,
                withCredentials: false,
                dataType: "jsonp"
            })
            .then(function(result){
                Chart.list = result
            })

        },
        view: function(){
            google.charts.load('current', {packages:["orgchart"]}),
            google.charts.setOnLoadCallback(drawChart),
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

    
    
Télécharger la page nommée index.html à la racine de l'application ici :
https://github.com/AxelLy/ArborescenceDuDossier/blob/master/index.html

  <br/>
Pour tester, lancer votre serveur avec la commande suivante : 

    node gfserveur.js
    
 <br/>    
Et lancez la page index.html sur votre navigateur.
<br/> 
N'oubliez pas de mettre à jour votre bin/app.js avec la commande : 
    
    npm start
<br/>

### Module list.js
<p>Récuperer le module list.js ici : https://github.com/AxelLy/ArborescenceDuDossier/blob/master/src/list.js et mettez le dans le dossier src. N'oubliez pas de modifier l'adresse du serveur <br/>
Il y a aussi 3 fonctions, les 2 premières sont les mêmes que dans l'autre module, et la dernière est celle qui permet l'affichage en liste.</p>

    import m from "mithril"
    var c = require('../Config')
    var List = {
        list: [],
        loadList: function(){
            return m.request({
                method:"GET",
                url:c.serveur_adress,
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
