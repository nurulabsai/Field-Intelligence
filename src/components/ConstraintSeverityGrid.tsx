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
    <div className="font-[Inter,sans-serif]">
      {/* Header row */}
      <div className="grid grid-cols-[90px_repeat(5,1fr)] gap-1.5 mb-2 px-0.5">
        <div />
        {severityLevels.map((level) => (
          <div
            key={level.value}
            className="text-center text-[11px] text-text-tertiary font-medium"
          >
            {level.label}
          </div>
        ))}
      </div>

      {/* Constraint rows */}
      {constraints.map((constraint) => (
        <div
          key={constraint.key}
          className="grid grid-cols-[90px_repeat(5,1fr)] gap-1.5 mb-2 items-center"
        >
          <span className="text-[13px] text-white font-medium">
            {constraint.label}
          </span>
          {severityLevels.map((level) => {
            const isSelected = value[constraint.key] === level.value;
            return (
              <button
                key={level.value}
                onClick={() => handleSelect(constraint.key, level.value)}
                className="h-9 rounded-lg cursor-pointer transition-all duration-150 flex items-center justify-center"
                style={{
                  border: isSelected
                    ? `2px solid ${level.color}`
                    : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: isSelected
                    ? level.bgColor
                    : 'var(--color-bg-input, #252525)',
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
                  className="rounded-full transition-all duration-150"
                  style={{
                    width: isSelected ? '12px' : '8px',
                    height: isSelected ? '12px' : '8px',
                    backgroundColor: isSelected ? level.color : 'rgba(255,255,255,0.1)',
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
