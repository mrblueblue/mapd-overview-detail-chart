import {xDomainExtract} from "./utils"

const ANY_NUMBER = 400

export default function updateTimeBin ({type, unit}, extent) {
  const linkedChart = this.rangeChart() || this.focusChart()

  if (type === "extract") {
    const binParams = this.group().binParams()
    binParams[0].timeBin = unit
    binParams[0].extract = true

    this.binParams(binParams)
    this.timeBinInputVal(unit)
    this.x(d3.scale.linear().domain(xDomainExtract(unit, binParams[0].binBounds)))
    this.xAxis().scale(this.x())

    if (linkedChart) {
      linkedChart.binParams(binParams)
      linkedChart.timeBinInputVal(unit)
      linkedChart.x(d3.scale.linear().domain(xDomainExtract(unit, binParams[0].binBounds)))
      linkedChart.xAxis().scale(linkedChart.x())
    }
  } else if (type === "datetrunc") {
    const binParams = this.group().binParams()
    binParams[0].timeBin = unit
    binParams[0].extract = false
    binParams[0].numBins = ANY_NUMBER

    this.binParams(binParams)
    this.timeBinInputVal(unit)
    this.x(d3.time.scale.utc().domain(binParams[0].binBounds))
    this.xAxis().scale(this.x())

    if (linkedChart) {
      linkedChart.binParams(binParams)
      linkedChart.timeBinInputVal(unit)
      linkedChart.x(d3.time.scale.utc().domain(binParams[0].binBounds))
      linkedChart.xAxis().scale(linkedChart.x())
    }
  }

  this.redrawGroup()
}
