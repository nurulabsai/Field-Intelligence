import React from 'react';
import { TrendingUp, TrendingDown, Minus, Wheat } from 'lucide-react';
import { cn } from '../../../design-system';

interface CropPrice {
  id: string;
  crop: string;
  region: string;
  pricePerKg: number;
  change: number;
}

interface CropPriceTableProps {
  data: CropPrice[];
}

function formatTZS(amount: number): string {
  return `TZS ${amount.toLocaleString('en-TZ')}`;
}

const CropPriceTable: React.FC<CropPriceTableProps> = ({ data }) => {
  return (
    <div className="bg-bg-glass backdrop-blur-[var(--glass-blur)] border border-border-glass rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-border-glass">
        <h3 className="text-base font-semibold text-white">Crop Prices</h3>
      </div>

      {/* Desktop table */}
      <div className="nuru-crop-table-desktop overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Crop', 'Region', 'Price/kg', 'Change'].map(h => (
                <th
                  key={h}
                  className="py-3 px-6 text-left text-xs font-semibold text-text-tertiary uppercase tracking-[0.05em] border-b border-border-glass"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  'transition-colors duration-[var(--transition-base)] hover:bg-white/[0.02]',
                  i < data.length - 1 && 'border-b border-border-light',
                )}
              >
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
                      <Wheat size={16} />
                    </div>
                    <span className="text-sm font-medium text-white">{row.crop}</span>
                  </div>
                </td>
                <td className="py-3.5 px-6 text-sm text-text-secondary">{row.region}</td>
                <td className="py-3.5 px-6 text-sm text-white font-semibold tabular-nums">
                  {formatTZS(row.pricePerKg)}
                </td>
                <td className="py-3.5 px-6">
                  <div
                    className={cn(
                      'flex items-center gap-1 text-sm font-semibold',
                      row.change > 0 ? 'text-success' : row.change < 0 ? 'text-error' : 'text-text-tertiary',
                    )}
                  >
                    {row.change > 0 ? <TrendingUp size={14} /> : row.change < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                    <span>{row.change > 0 ? '+' : ''}{row.change}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="nuru-crop-table-mobile hidden">
        {data.map((row, i) => (
          <div
            key={row.id}
            className={cn(
              'py-4 px-6 flex justify-between items-center',
              i < data.length - 1 && 'border-b border-border-light',
            )}
          >
            <div>
              <div className="flex items-center gap-2">
                <Wheat size={14} className="text-success" />
                <span className="text-sm font-medium text-white">{row.crop}</span>
              </div>
              <span className="text-xs text-text-tertiary mt-0.5 block">{row.region}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{formatTZS(row.pricePerKg)}</div>
              <div
                className={cn(
                  'text-xs font-semibold mt-0.5',
                  row.change > 0 ? 'text-success' : row.change < 0 ? 'text-error' : 'text-text-tertiary',
                )}
              >
                {row.change > 0 ? '+' : ''}{row.change}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nuru-crop-table-desktop { display: none !important; }
          .nuru-crop-table-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default CropPriceTable;
