import React from 'react';
import { TrendingUp, TrendingDown, Minus, Wheat } from 'lucide-react';

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
    <div
      style={{
        backgroundColor: 'var(--glass-bg, rgba(30,30,30,0.8))',
        backdropFilter: 'var(--glass-blur, blur(16px))',
        WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>Crop Prices</h3>
      </div>

      {/* Desktop table */}
      <div className="nuru-crop-table-desktop" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Crop', 'Region', 'Price/kg', 'Change'].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
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
                style={{
                  borderBottom: i < data.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(34,197,94,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#22C55E',
                        flexShrink: 0,
                      }}
                    >
                      <Wheat size={16} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#FFFFFF' }}>{row.crop}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '0.875rem', color: '#9CA3AF' }}>{row.region}</td>
                <td style={{ padding: '14px 24px', fontSize: '0.875rem', color: '#FFFFFF', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {formatTZS(row.pricePerKg)}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      color: row.change > 0 ? '#22C55E' : row.change < 0 ? '#EF4444' : '#6B7280',
                    }}
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
      <div className="nuru-crop-table-mobile" style={{ display: 'none' }}>
        {data.map((row, i) => (
          <div
            key={row.id}
            style={{
              padding: '16px 24px',
              borderBottom: i < data.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wheat size={14} style={{ color: '#22C55E' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#FFFFFF' }}>{row.crop}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px', display: 'block' }}>{row.region}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>{formatTZS(row.pricePerKg)}</div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: row.change > 0 ? '#22C55E' : row.change < 0 ? '#EF4444' : '#6B7280',
                  marginTop: '2px',
                }}
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
