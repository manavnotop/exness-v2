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

export interface UserType {
  email: string,
  balance: number,
  openTrades: Trade[]
}

export type UserStore = Record<string, UserType>

export interface Trade {
  id: string;
  asset: string;
  type: "long" | "short";
  quantity: number;
  leverage: number;
  slippage: number;
  openPrice: number;
  decimal: number;
}

export enum AssetSymbols {
  SOL = 'SOL_USDC',
  ETH = 'ETH_USDC',
  BTC = 'BTC_USDC',
}

export type PriceStore = Partial<Record<AssetSymbols, FilteredData>>