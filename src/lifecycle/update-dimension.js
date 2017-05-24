export default function updateDimension (field, extent) {
  const binParams = this.group().binParams()
  const dimension = this.crossfilter().dimension(field)
  const group = dimension.group().reduceCount()
  const linkedChart = this.rangeChart() || this.focusChart()

  binParams[0].binBounds = extent
  this.dimension(dimension).group(group)
  this.binParams(binParams)

  if (linkedChart) {
    linkedChart
      .dimension(dimension)
      .group(dimension.group().reduceCount())
      .binParams(binParams)
  }

  return this.redrawGroup()
}
