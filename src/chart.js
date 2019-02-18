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