# Documentation tuto 
## Crée une page avec mithril 
Pour pouvoir utiliser mithril il faut d'abord avoir installer node. Pour cela il faut vous rendre sur le site de node qui est le suivant : et télécharger node.js. Lancez l'installation de node et suivez les indications qu'il vous donne. Une fois node installé il vous faut installer mithril. Créez ou ouvrez le dossier où vous allez réaliser votre application. Ensuite ouvrez votre invite de commande. Vous devez d'abord initialiser le répertoire en package npm avec la commande suivante : 

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
