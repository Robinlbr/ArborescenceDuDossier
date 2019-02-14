import m from "mithril"
import List from "C:/Users/Dimi/Documents/GitHub/GestionFichier/myapp/src/list.js"
import Chart from "C:/Users/Dimi/Documents/GitHub/GestionFichier/myapp/src/chart.js"
var root = document.body
List.loadList()
Chart.loadList()
m.route(root,"",{
    "/liste" : m.mount(root,List),
    "/chart" : m.mount(document.head,Chart)
})

