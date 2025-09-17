import { NextRequest } from 'next/server';
import axios from 'axios';

type BinanceKline = [
  number, // open time in ms
  string, // open
  string, // high
  string, // low
  string, // close
  ...unknown[]
];

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval');
  const limit = searchParams.get('limit') || '100';
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');

  if (!symbol || !interval) {
    return new Response(
      JSON.stringify({ error: 'Missing symbol or interval parameter' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const binanceUrl = 'https://fapi.binance.com/fapi/v1/klines';
    const params = new URLSearchParams({
      symbol,
      interval,
      limit,
    });

    // Forward optional pagination params if provided (Binance expects ms)
    if (startTime) params.set('startTime', startTime);
    if (endTime) params.set('endTime', endTime);

    const response = await axios.get<BinanceKline[]>(`${binanceUrl}?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Transform the data to match our Kline interface
    const klines = response.data.map((d: BinanceKline) => ({
      time: Math.floor(Number(d[0]) / 1000), // Convert milliseconds to seconds
      open: Number(d[1]),
      high: Number(d[2]),
      low: Number(d[3]),
      close: Number(d[4]),
    }));

    return new Response(JSON.stringify(klines), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching klines:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch klines data' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}