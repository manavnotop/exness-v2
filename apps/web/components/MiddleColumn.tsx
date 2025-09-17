import ChartContainer from './ChartContainer';

export default function MiddleColumn({ selectedStock = 'BTCUSDT' }: { selectedStock?: string }) {
  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="h-1/2 p-4">
        <h2 className="text-lg font-bold mb-4">Price Chart</h2>
        <div className="h-[calc(100%-2rem)]">
          <ChartContainer symbol={selectedStock} />
        </div>
      </div>
      <div className="h-1/2 p-4 border-t">
        {/* Empty space for future content */}
      </div>
    </div>
  );
}