import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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

export function useInfiniteKlines(symbol: string, interval: Interval, pageSize = 200) {
  return useInfiniteQuery<{ data: Kline[]; oldestTimeSec: number | null }, Error>({
    queryKey: ['infinite-klines', symbol, interval, pageSize],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('symbol', mapToBinanceSymbol(symbol));
      params.set('interval', interval);
      
      // For the first page, load only 40 candles to show initially
      // For subsequent pages, load the full pageSize
      const limit = pageParam ? pageSize : 100;
      params.set('limit', String(limit));

      // pageParam represents endTime (ms) for Binance; we request window that ends before this
      if (pageParam) {
        params.set('endTime', String(pageParam));
      }

      const url = `${KLINES_BASE}?${params.toString()}`;
      const { data } = await axios.get(url);
      const klines = data as Kline[];

      // Determine the next pageParam as the ms of the first candle - 1ms
      const oldest = klines[0];
      const oldestTimeSec = oldest ? oldest.time : null;
      return { data: klines, oldestTimeSec };
    },
    getNextPageParam: (lastPage) => {
      // lastPage.oldestTimeSec is in seconds; Binance expects ms
      if (!lastPage.oldestTimeSec) return undefined;
      return lastPage.oldestTimeSec * 1000 - 1;
    },
    initialPageParam: undefined,
    staleTime: 60_000,
    enabled: Boolean(symbol && interval),
  });
}