require("../lib/charting/mapdc.css")
require("../styles/chart.css")

import * as dc from "../lib/charting/src/index"
import {xDomainExtract} from "./lifecycle/utils"
import updateDimension from "./lifecycle/update-dimension"
import updateTimeBin from "./lifecycle/update-bin"

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 50
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 200

let CF = null

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
      expression: column,
      agg_mode:"min",
      name: "minimum"
    },
    {
      expression: column,
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
  CF = cf
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

      focusChart.updateDimension = updateDimension.bind(focusChart)
      focusChart.updateTimeBin = updateTimeBin.bind(focusChart)

      focusChart.crossfilter = () => cf
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

window.dc = dc

function setupListeners () {
  const datetruncSelection = document.getElementById("datetrunc")
  const extractSelection = document.getElementById("extract")
  const chartSelection = document.getElementById("chart")
  const dimensionSelection = document.getElementById("dimension")

  datetruncSelection.addEventListener("change", () => {
    const focus = dc.chartRegistry.list()[1]
    const extent = focus.group().binParams()[0].binBounds
    focus.updateTimeBin({
      type: "datetrunc",
      unit: datetruncSelection.value
    }, extent)
  })

  extractSelection.addEventListener("change", () => {
    const focus = dc.chartRegistry.list()[1]
    const extent = focus.group().binParams()[0].binBounds
    focus.updateTimeBin({
      type: "extract",
      unit: extractSelection.value
    }, extent)

  })

  chartSelection.addEventListener("change", () => {
    console.log(chartSelection.value)
  })

  dimensionSelection.addEventListener("change", () => {
    const field = dimensionSelection.value
    return minMax(CF, field)
      .then((bounds) => {
        const focus = dc.chartRegistry.list()[1]
        focus.updateDimension(field,[bounds.minimum, bounds.maximum] )
      })
  })
}

connect()
  .then(createCrossfilter)
  .then(init)
  .then(lines)
  .then(dc.renderAllAsync)
  .then(setupListeners)
