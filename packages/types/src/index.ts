export type BackpackDataType = {
  A: string,
  B: string,
  E: number,
  T: number,
  a: string,
  b: string,
  e: string,
  s: string,
  u: number,
}

export type FilteredData = {
  ask_price: number,
  bid_price: number,
  decimal: number,
}

export type PriceUpdate = {
  SOL : FilteredData,
  BTC: FilteredData,
  ETH: FilteredData
}