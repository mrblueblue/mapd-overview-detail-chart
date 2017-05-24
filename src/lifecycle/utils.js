
export function xDomainExtract (unit, [min, max]) {
  switch (unit) {
    case "year":
      return [
        min.getFullYear(),
        max.getFullYear()
      ]
    case "quarter":
      return [1, 4] // eslint-disable-line no-magic-numbers
    case "isodow":
      return [1, 7] // eslint-disable-line no-magic-numbers
    case "month":
      return [1, 12] // eslint-disable-line no-magic-numbers
    case "day":
      return [1, 31] // eslint-disable-line no-magic-numbers
    case "hour":
      return [0, 23] // eslint-disable-line no-magic-numbers
    case "minute":
      return [0, 59] // eslint-disable-line no-magic-numbers
    default:
      return [1, 7] // eslint-disable-line no-magic-numbers
    }
}
