'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import LeftColumn from '../../components/LeftColumn';
import MiddleColumn from '../../components/MiddleColumn';
import RightColumn from '../../components/RightColumn';

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState('BTCUSDT');

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex h-screen pt-16"> {/* pt-16 to account for navbar height */}
        <div className="w-1/4 p-4">
          <LeftColumn onStockSelect={setSelectedStock} />
        </div>
        <div className="w-2/4 p-4">
          <MiddleColumn selectedStock={selectedStock} />
        </div>
        <div className="w-1/4 p-4">
          <RightColumn />
        </div>
      </div>
    </div>
  );
}