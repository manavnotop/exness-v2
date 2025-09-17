'use client';

import { useState } from 'react';

export default function RightColumn() {
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [quantity, setQuantity] = useState('');
  const [margin, setMargin] = useState('');
  const [leverage, setLeverage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log({ tradeType, quantity, margin, leverage });
    alert(`Trade submitted: ${tradeType} position with quantity: ${quantity}, margin: ${margin}, leverage: ${leverage}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h2 className="text-lg font-bold mb-4">Trade</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Trade Type</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="tradeType"
                value="long"
                checked={tradeType === 'long'}
                onChange={() => setTradeType('long')}
              />
              <span className="ml-2">Long</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="tradeType"
                value="short"
                checked={tradeType === 'short'}
                onChange={() => setTradeType('short')}
              />
              <span className="ml-2">Short</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Margin</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            placeholder="Enter margin"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Leverage</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md"
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
            placeholder="Enter leverage"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Submit Trade
        </button>
      </form>
    </div>
  );
}