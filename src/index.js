require("@mapd/mapdc/mapdc.css")
import * as dc from "@mapd/mapdc"

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 50
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 200

function connect () {
  const connection = new MapdCon()
    .protocol("https")
    .host("metis.mapd.com")
    .port("443")
    .dbName("mapd")
    .user("mapd")
    .password("HyperInteractive")

  return new Promise((resolve, reject) => {
    return connection.connect((error, result) => {
      return error ? reject(error) : resolve(result)
    })
  })
}

function createCrossfilter (connector) {
  return crossfilter.crossfilter(connector, "flights_donotmodify")
}

function minMax (cf, column) {
  return cf.groupAll().reduceMulti([
    {
      expression: "dep_timestamp",
      agg_mode:"min",
      name: "minimum"
    },
    {
      expression: "dep_timestamp",
      agg_mode:"max",
      name: "maximum"
    }
  ]).valuesAsync(true)
}

function init (cf) {
  dc.countWidget(".data-count")
    .dimension(cf)
    .group(cf.groupAll())

  return minMax(cf, "dep_timestamp")
    .then(bounds => {
      return {
        cf,
        bounds
      }
    })
}

function lines ({cf, bounds}) {
  var timeChartDimension = cf.dimension("dep_timestamp");
      var rangeChartDimension = timeChartDimension

      var timeChartGroup = timeChartDimension.group().reduceCount()
      var rangeChartGroup= rangeChartDimension.group().reduceCount()

      var focusChart = dc.lineChart('.chart3-example')
        .width(w)
        .height(h/2.5)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .brushOn(true)
        .yAxisLabel('# Flights')
        .dimension(timeChartDimension)
        .group(timeChartGroup)
        .isTime(true)
      /* Set the x and y axis formatting with standard d3 functions */

      focusChart
        .x(d3.scale.linear().domain([1, 31]))
        .yAxis().ticks(5);

      focusChart
        .xAxis()
        .scale(focusChart.x())
        .tickFormat((a) => a)
        .orient('top')


      focusChart
        .rangeInput(false)
        .binInput(false)
        .timeBinInputVal("day")
        .binParams([{
           binBounds: [bounds.minimum,bounds.maximum],
           timeBin: "day",
           extract: true
         }, null])

      var rangeChart = dc.lineChart('.chart4-example')
        .width(w)
        .height((h/2.5)/2)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .brushOn(true)
        .xAxisLabel('Departure Time')
        .dimension(rangeChartDimension)
        .group(rangeChartGroup)
        .isTime(true)

      rangeChart
        .x(d3.scale.linear().domain([1, 31]))
        .yAxis().ticks(5);

      rangeChart
        .xAxis()
        .scale(rangeChart.x())
        .tickFormat(a => a)
        .orient('top')

      rangeChart
        .rangeInput(false)
        .binInput(false)
        .timeBinInputVal("day")
        .binParams([{
           binBounds: [bounds.minimum,bounds.maximum],
           timeBin: "day",
           extract: true
        }, null])

      focusChart.rangeChart(rangeChart)
}

connect()
  .then(createCrossfilter)
  .then(init)
  .then(lines)
  .then(dc.renderAllAsync)
