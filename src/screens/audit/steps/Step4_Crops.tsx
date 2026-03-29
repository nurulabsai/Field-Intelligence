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

const inputClasses = "w-full py-2.5 px-3.5 bg-bg-input border border-border rounded-[10px] text-white text-sm font-inherit outline-none transition-colors duration-150";

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

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">
        Crops
      </h2>
      <p className="text-sm text-text-tertiary mb-6">
        Add all crops cultivated on this farm (at least one required)
      </p>

      {errors.crops && (
        <p className="text-[0.813rem] text-[#FCA5A5] mb-4">{errors.crops}</p>
      )}

      <div className="flex flex-col gap-4">
        {crops.map((crop, index) => (
          <div
            key={crop.id}
            className="bg-bg-card border border-[rgba(255,255,255,0.06)] rounded-lg p-5"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-[rgba(34,197,94,0.1)] flex items-center justify-center text-[#22C55E]">
                  <Wheat size={16} />
                </div>
                <span className="text-[0.938rem] font-semibold text-white">Crop {index + 1}</span>
              </div>
              {crops.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCrop(crop.id)}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-sm text-error text-xs font-medium cursor-pointer font-inherit"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              )}
            </div>

            {/* Crop Type Dropdown */}
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-text-tertiary mb-1">Crop Type <span className="text-text-accent">*</span></label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdowns(p => ({ ...p, [crop.id]: !p[crop.id] }))}
                  className={`${inputClasses} text-left cursor-pointer flex items-center justify-between`}
                >
                  <span className={crop.crop_id ? 'text-white' : 'text-text-tertiary'}>
                    {CROP_OPTIONS.find(o => o.value === crop.crop_id)?.label || 'Select crop'}
                  </span>
                  <ChevronDown size={16} className="text-text-tertiary" />
                </button>
                {openDropdowns[crop.id] && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-input border border-[rgba(255,255,255,0.1)] rounded-[10px] z-50 max-h-[200px] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                    {CROP_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          updateCropField(crop.id, 'crop_id', opt.value);
                          setOpenDropdowns(p => ({ ...p, [crop.id]: false }));
                        }}
                        className="w-full py-2.5 px-3.5 border-none text-sm text-left cursor-pointer font-inherit"
                        style={{
                          background: crop.crop_id === opt.value ? 'rgba(240,81,62,0.15)' : 'transparent',
                          color: crop.crop_id === opt.value ? '#F0513E' : '#FFFFFF',
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
            <div className="nuru-crop-fields grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1">Area (ha)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={crop.area_ha}
                  onChange={e => updateCropField(crop.id, 'area_ha', e.target.value)}
                  placeholder="0.00"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1">Variety</label>
                <input
                  type="text"
                  value={crop.variety}
                  onChange={e => updateCropField(crop.id, 'variety', e.target.value)}
                  placeholder="e.g. STUKA M1"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1">Planting Date</label>
                <input
                  type="date"
                  value={crop.planting_date}
                  onChange={e => updateCropField(crop.id, 'planting_date', e.target.value)}
                  className={`${inputClasses} [color-scheme:dark]`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1">Expected Harvest</label>
                <input
                  type="date"
                  value={crop.expected_harvest}
                  onChange={e => updateCropField(crop.id, 'expected_harvest', e.target.value)}
                  className={`${inputClasses} [color-scheme:dark]`}
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
        className="flex items-center justify-center gap-2 w-full py-3.5 mt-4 bg-[rgba(240,81,62,0.08)] border border-dashed border-[rgba(240,81,62,0.3)] rounded-[14px] text-text-accent text-sm font-semibold cursor-pointer font-inherit transition-all duration-150"
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
