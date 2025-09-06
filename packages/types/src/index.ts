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
  SOL: FilteredData,
  BTC: FilteredData,
  ETH: FilteredData
}

export interface Balance {
  amount: number,
  currency: string
}

export interface OpenTrade {
  id: string;
  openPrice: number;
  closePrice?: number;
  leverage: number;
  pnl: number;
  asset: PriceUpdate['SOL'] | PriceUpdate['ETH'] | PriceUpdate['BTC'];
  liquidated: boolean;
  createdAt: Date;
}