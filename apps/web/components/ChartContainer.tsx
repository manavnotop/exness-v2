'use client';

import { createChart, ColorType, UTCTimestamp, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useKlines, type Interval } from '../hooks/useKlines';

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

export default function ChartContainer({ symbol = 'BTCUSDT' }: ChartContainerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [interval, setInterval] = useState<Interval>('5m');
  const { data, isLoading, error } = useKlines(symbol, interval, 100);
  const [chartError, setChartError] = useState<string | null>(null);

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
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

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

      if (data) {
        try {
          // Convert data to candlestick format
          // The time is already in seconds from the API, so we just cast it
          const candlestickData: CandlestickData[] = data.map(item => ({
            time: item.time as UTCTimestamp, // This is already in seconds
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }));

          // Set data to series
          candlestickSeries.setData(candlestickData);

          // Fit chart to data
          chart.timeScale().fitContent();
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
  }, [data, isLoading, error, interval]);

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