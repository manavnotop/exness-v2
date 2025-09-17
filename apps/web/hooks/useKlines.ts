import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const KLINES_BASE = '/api/binance/klines'; // Use our own API proxy

export type Interval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export type Kline = {
  time: number; // seconds
  open: number;
  high: number;
  low: number;
  close: number;
};

export function mapToBinanceSymbol(symbol: string): string {
  // Convert internal USDC markets to Binance USDT markets
  if (symbol.endsWith('USDC')) return symbol.replace('USDC', 'USDT');
  return symbol;
}

export function intervalToSeconds(interval: Interval): number {
  switch (interval) {
    case '1m':
      return 60;
    case '5m':
      return 5 * 60;
    case '15m':
      return 15 * 60;
    case '1h':
      return 60 * 60;
    case '4h':
      return 4 * 60 * 60;
    case '1d':
      return 24 * 60 * 60;
  }
}

export function useKlines(symbol: string, interval: Interval, limit = 100) {
  return useQuery({
    queryKey: ['klines', symbol, interval, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('symbol', mapToBinanceSymbol(symbol));
      params.set('interval', interval);
      if (limit) params.set('limit', String(limit));
      const url = `${KLINES_BASE}?${params.toString()}`;
      console.log('[klines] request', { url });
      const { data } = await axios.get(url);
      console.log('[klines] response', data);
      return data as Kline[];
    },
    staleTime: 60_000,
    enabled: Boolean(symbol && interval),
  });
}