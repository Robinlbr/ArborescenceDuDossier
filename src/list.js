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