'use client';

import { useState } from 'react';

export default function LeftColumn({ onStockSelect }: { onStockSelect?: (symbol: string) => void }) {
  // Dummy stock data with proper Binance symbols
  const stockData = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', bid: 63250.25, ask: 63255.75 },
    { symbol: 'SOLUSDT', name: 'Solana', bid: 152.80, ask: 152.95 },
    { symbol: 'ETHUSDT', name: 'Ethereum', bid: 3450.60, ask: 3452.20 }
  ];

  const [selectedStock, setSelectedStock] = useState('BTCUSDT');

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
    if (onStockSelect) {
      onStockSelect(symbol);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-4 h-full">
        <h2 className="text-lg font-bold mb-4">Market Prices</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Stock</th>
              <th className="text-left py-2">Bid</th>
              <th className="text-left py-2">Ask</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((stock, index) => (
              <tr 
                key={index} 
                className={`border-b cursor-pointer hover:bg-gray-100 ${selectedStock === stock.symbol ? 'bg-blue-50' : ''}`}
                onClick={() => handleStockClick(stock.symbol)}
              >
                <td className="py-2">{stock.name}</td>
                <td className="py-2">${stock.bid.toFixed(2)}</td>
                <td className="py-2">${stock.ask.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}