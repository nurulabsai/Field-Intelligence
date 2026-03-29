import React from 'react';

interface ConstraintValues {
  pests: number;
  diseases: number;
  drought: number;
  flooding: number;
}

interface ConstraintSeverityGridProps {
  value: ConstraintValues;
  onChange: (value: ConstraintValues) => void;
}

type ConstraintKey = keyof ConstraintValues;

interface SeverityLevel {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

const severityLevels: SeverityLevel[] = [
  { label: 'None', value: 0, color: '#6B7280', bgColor: 'rgba(107,114,128,0.3)' },
  { label: 'Low', value: 1, color: '#22C55E', bgColor: 'rgba(34,197,94,0.2)' },
  { label: 'Moderate', value: 2, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.2)' },
  { label: 'High', value: 3, color: '#F97316', bgColor: 'rgba(249,115,22,0.2)' },
  { label: 'Critical', value: 4, color: '#EF4444', bgColor: 'rgba(239,68,68,0.2)' },
];

const constraints: { key: ConstraintKey; label: string }[] = [
  { key: 'pests', label: 'Pests' },
  { key: 'diseases', label: 'Diseases' },
  { key: 'drought', label: 'Drought' },
  { key: 'flooding', label: 'Flooding' },
];

const ConstraintSeverityGrid: React.FC<ConstraintSeverityGridProps> = ({
  value,
  onChange,
}) => {
  const handleSelect = (constraintKey: ConstraintKey, severity: number) => {
    onChange({ ...value, [constraintKey]: severity });
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '90px repeat(5, 1fr)',
          gap: '6px',
          marginBottom: '8px',
          padding: '0 2px',
        }}
      >
        <div />
        {severityLevels.map((level) => (
          <div
            key={level.value}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#6B7280',
              fontWeight: 500,
            }}
          >
            {level.label}
          </div>
        ))}
      </div>

      {/* Constraint rows */}
      {constraints.map((constraint) => (
        <div
          key={constraint.key}
          style={{
            display: 'grid',
            gridTemplateColumns: '90px repeat(5, 1fr)',
            gap: '6px',
            marginBottom: '8px',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              color: '#FFFFFF',
              fontWeight: 500,
            }}
          >
            {constraint.label}
          </span>
          {severityLevels.map((level) => {
            const isSelected = value[constraint.key] === level.value;
            return (
              <button
                key={level.value}
                onClick={() => handleSelect(constraint.key, level.value)}
                style={{
                  height: '36px',
                  borderRadius: '8px',
                  border: isSelected
                    ? `2px solid ${level.color}`
                    : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: isSelected
                    ? level.bgColor
                    : 'var(--color-bg-input, #252525)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }
                }}
              >
                <div
                  style={{
                    width: isSelected ? '12px' : '8px',
                    height: isSelected ? '12px' : '8px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? level.color : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.15s ease',
                  }}
                />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ConstraintSeverityGrid;
