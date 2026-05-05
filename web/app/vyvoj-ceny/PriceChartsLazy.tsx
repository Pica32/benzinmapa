'use client';
import dynamic from 'next/dynamic';

const PriceCharts = dynamic(() => import('./PriceCharts'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400">Načítám grafy...</p>
      </div>
    </div>
  ),
});

export default PriceCharts;
