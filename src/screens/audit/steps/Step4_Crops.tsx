import React, { useCallback, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, Wheat } from 'lucide-react';

interface Step4Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

interface CropEntry {
  id: string;
  crop_id: string;
  area_ha: string;
  variety: string;
  planting_date: string;
  expected_harvest: string;
}

const CROP_OPTIONS = [
  { value: 'maize', label: 'Maize' },
  { value: 'rice', label: 'Rice' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'sorghum', label: 'Sorghum' },
  { value: 'millet', label: 'Millet' },
  { value: 'cassava', label: 'Cassava' },
  { value: 'sweet_potato', label: 'Sweet Potato' },
  { value: 'beans', label: 'Beans' },
  { value: 'groundnuts', label: 'Groundnuts' },
  { value: 'sunflower', label: 'Sunflower' },
  { value: 'sesame', label: 'Sesame' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'tea', label: 'Tea' },
  { value: 'cashew', label: 'Cashew Nuts' },
  { value: 'tobacco', label: 'Tobacco' },
  { value: 'sisal', label: 'Sisal' },
  { value: 'banana', label: 'Banana' },
  { value: 'coconut', label: 'Coconut' },
  { value: 'pigeon_pea', label: 'Pigeon Pea' },
];

function createEmptyCrop(): CropEntry {
  return {
    id: `crop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    crop_id: '',
    area_ha: '',
    variety: '',
    planting_date: '',
    expected_harvest: '',
  };
}

const Step4_Crops: React.FC<Step4Props> = ({ data, onChange, errors }) => {
  const crops: CropEntry[] = useMemo(() => {
    const raw = data.crops as CropEntry[] | undefined;
    return raw && raw.length > 0 ? raw : [createEmptyCrop()];
  }, [data.crops]);

  const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>({});

  const updateCrops = useCallback((updated: CropEntry[]) => {
    onChange({ crops: updated });
  }, [onChange]);

  const addCrop = useCallback(() => {
    updateCrops([...crops, createEmptyCrop()]);
  }, [crops, updateCrops]);

  const removeCrop = useCallback((id: string) => {
    if (crops.length <= 1) return;
    updateCrops(crops.filter(c => c.id !== id));
  }, [crops, updateCrops]);

  const updateCropField = useCallback((id: string, field: keyof CropEntry, value: string) => {
    updateCrops(crops.map(c => c.id === id ? { ...c, [field]: value } : c));
  }, [crops, updateCrops]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'var(--color-bg-input, #252525)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#6B7280',
    marginBottom: '4px',
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
        Crops
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '24px' }}>
        Add all crops cultivated on this farm (at least one required)
      </p>

      {errors.crops && (
        <p style={{ fontSize: '0.813rem', color: '#FCA5A5', marginBottom: '16px' }}>{errors.crops}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {crops.map((crop, index) => (
          <div
            key={crop.id}
            style={{
              backgroundColor: 'var(--color-bg-card, #1E1E1E)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  }}
                >
                  <Wheat size={16} />
                </div>
                <span style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF' }}>Crop {index + 1}</span>
              </div>
              {crops.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCrop(crop.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '8px',
                    color: '#EF4444',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              )}
            </div>

            {/* Crop Type Dropdown */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Crop Type <span style={{ color: '#F0513E' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setOpenDropdowns(p => ({ ...p, [crop.id]: !p[crop.id] }))}
                  style={{
                    ...inputStyle,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ color: crop.crop_id ? '#FFFFFF' : '#6B7280' }}>
                    {CROP_OPTIONS.find(o => o.value === crop.crop_id)?.label || 'Select crop'}
                  </span>
                  <ChevronDown size={16} style={{ color: '#6B7280' }} />
                </button>
                {openDropdowns[crop.id] && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#252525',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      zIndex: 50,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    }}
                  >
                    {CROP_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          updateCropField(crop.id, 'crop_id', opt.value);
                          setOpenDropdowns(p => ({ ...p, [crop.id]: false }));
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: crop.crop_id === opt.value ? 'rgba(240,81,62,0.15)' : 'transparent',
                          border: 'none',
                          color: crop.crop_id === opt.value ? '#F0513E' : '#FFFFFF',
                          fontSize: '0.875rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Crop details grid */}
            <div
              className="nuru-crop-fields"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
            >
              <div>
                <label style={labelStyle}>Area (ha)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={crop.area_ha}
                  onChange={e => updateCropField(crop.id, 'area_ha', e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Variety</label>
                <input
                  type="text"
                  value={crop.variety}
                  onChange={e => updateCropField(crop.id, 'variety', e.target.value)}
                  placeholder="e.g. STUKA M1"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Planting Date</label>
                <input
                  type="date"
                  value={crop.planting_date}
                  onChange={e => updateCropField(crop.id, 'planting_date', e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Expected Harvest</label>
                <input
                  type="date"
                  value={crop.expected_harvest}
                  onChange={e => updateCropField(crop.id, 'expected_harvest', e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Crop Button */}
      <button
        type="button"
        onClick={addCrop}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '14px',
          marginTop: '16px',
          backgroundColor: 'rgba(240,81,62,0.08)',
          border: '1px dashed rgba(240,81,62,0.3)',
          borderRadius: '14px',
          color: '#F0513E',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.15s ease',
        }}
      >
        <Plus size={16} />
        Add Another Crop
      </button>

      <style>{`
        @media (max-width: 480px) {
          .nuru-crop-fields { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Step4_Crops;
