'use client';

import { createChart, ColorType, UTCTimestamp, CandlestickSeries, type ISeriesApi, type IChartApi, type Time, type BusinessDay } from 'lightweight-charts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteKlines, type Interval } from '../hooks/useKlines';

interface CandlestickData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartContainerProps {
  symbol?: string;
}

function mapKline(item: {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}): CandlestickData {
  return {
    time: item.time as UTCTimestamp,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  };
}

export default function ChartContainer({ symbol = 'BTCUSDT' }: ChartContainerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [interval, setInterval] = useState<Interval>('5m');
  const { data: pages, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteKlines(symbol, interval, 100);
  const [chartError, setChartError] = useState<string | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const initialRangeSetRef = useRef<boolean>(false);

  function timeToDate(time: Time): Date {
    if (typeof time === 'number') {
      return new Date(time * 1000);
    }
    const d = time as BusinessDay;
    return new Date(Date.UTC(d.year, d.month - 1, d.day));
  }

  // Reset the initial range guard when symbol or interval changes
  useEffect(() => {
    initialRangeSetRef.current = false;
  }, [symbol, interval]);

  const mergedData = useMemo(() => {
    if (!pages) return [];
  
    const flat = pages.pages.flatMap((p) => p.data);
    const sorted = [...flat].sort((a, b) => a.time - b.time);
  
    // Always limit to 40 until user scrolls and we actually append more
    if (!initialRangeSetRef.current) {
      return sorted.slice(-40).map(mapKline);
    }
  
    return sorted.map(mapKline);
  }, [pages]);
  
  

  // Interval options for the dropdown
  const intervalOptions: { value: Interval; label: string }[] = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Set explicit height for the container
    chartContainerRef.current.style.height = '400px';

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: 'black',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      localization: {
        timeFormatter: (time: Time) => {
          const date = timeToDate(time);
          return date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 8,
        tickMarkFormatter: (time: Time) => {
          const date = timeToDate(time);
          return date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        },
      },
    });
    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    seriesRef.current = candlestickSeries as unknown as ISeriesApi<'Candlestick'>;

    // Handle window resize
    const handleResize = () => {
      if (!chartContainerRef.current) return;
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Update chart data when data changes
    const updateChartData = () => {
      if (error) {
        setChartError(error.message || 'Error loading chart data');
        return;
      }

      if (mergedData && mergedData.length > 0) {
        try {
          candlestickSeries.setData(mergedData);

          // On first render for this dataset, show only the most recent 40 candles
          if (!initialRangeSetRef.current && mergedData.length > 0) {
            if (mergedData.length > 40) {
              const recent = mergedData.slice(-40);
              if (recent.length > 0) {
                const from = recent[0]!.time;
                const to = recent[recent.length - 1]!.time;
                chart.timeScale().setVisibleRange({ from, to });
              }
            } else {
              chart.timeScale().scrollToRealTime();
            }
            initialRangeSetRef.current = true;
          }
          setChartError(null);
        } catch (err) {
          setChartError('Error processing chart data');
          console.error('Chart data processing error:', err);
        }
      } else if (!isLoading) {
        setChartError('No data available for this symbol');
      }
    };

    // Initial data update
    updateChartData();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [mergedData, isLoading, error, interval]);

  // Detect when user scrolls/pans near the left edge and fetch older data
  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;

    const handler = () => {
      const timeScale = chart.timeScale();
      const visibleRange = timeScale.getVisibleLogicalRange();
      const visible = timeScale.getVisibleRange();
      // Fallback to logical range if needed
      if (!visibleRange && !visible) return;

      // If scrolled within first 10% of bars, fetch more
      const logical = timeScale.getVisibleLogicalRange();
      if (!logical) return;
      const from = logical.from;
      // When from is close to 0, we are at left edge
      if (from !== null && from < 10 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    const ts = chart.timeScale();
    ts.subscribeVisibleLogicalRangeChange(handler);

    return () => {
      ts.unsubscribeVisibleLogicalRangeChange(handler);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterval(e.target.value as Interval);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading chart data...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Interval selector */}
      <div className="mb-2 flex justify-end">
        <select
          value={interval}
          onChange={handleIntervalChange}
          className="border rounded px-2 py-1 text-sm"
        >
          {intervalOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Chart container */}
      <div 
        ref={chartContainerRef} 
        className="w-full h-full border border-gray-300 rounded-lg overflow-hidden"
      />
      
      {chartError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
          <div className="text-red-500 text-center">
            <div>Error loading chart</div>
            <div className="text-sm mt-1">{chartError}</div>
          </div>
        </div>
      )}
    </div>
  );
}