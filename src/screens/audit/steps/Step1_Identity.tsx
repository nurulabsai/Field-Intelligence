import React, { useCallback, useEffect, useRef, useState } from 'react';
import MaterialIcon from '../../../components/MaterialIcon';
import { cn } from '../../../design-system';
import { useUIStore } from '../../../store/index';
import { dimActors } from '../../../lib/supabase';
import { normalizeTanzanianPhoneInput } from '../../../lib/phone';

const LABOUR_KEYS = [
  'family_only',
  'hired_daily',
  'hired_seasonal',
  'exchange_labour',
  'mechanized',
  'none',
] as const;
type LabourKey = (typeof LABOUR_KEYS)[number];

const GENDER = [
  { value: 'female', en: 'Female', sw: 'Mke' },
  { value: 'male', en: 'Male', sw: 'Mme' },
  { value: 'other', en: 'Other', sw: 'Nyingine' },
  { value: 'prefer_not_say', en: 'Prefer not to say', sw: 'Sipendi kusema' },
] as const;

const SEASONS = [
  { value: 'masika_2024_25', en: 'Masika 2024/25', sw: 'Masika 2024/25' },
  { value: 'vuli_2024_25', en: 'Vuli 2024/25', sw: 'Vuli 2024/25' },
  { value: 'masika_2025_26', en: 'Masika 2025/26', sw: 'Masika 2025/26' },
  { value: 'vuli_2025_26', en: 'Vuli 2025/26', sw: 'Vuli 2025/26' },
  { value: 'long_rains_2025', en: 'Long rains 2025', sw: 'Mvua ndefu 2025' },
  { value: 'short_rains_2025', en: 'Short rains 2025', sw: 'Mvua fupi 2025' },
  { value: 'other_season', en: 'Other season', sw: 'Msimu mwingine' },
] as const;

const LABOUR_LABELS: Record<string, { en: string; sw: string }> = {
  family_only: { en: 'Family labour only', sw: 'Kazi ya familia tu' },
  hired_daily: { en: 'Hired (daily)', sw: 'Waajiriwa (kwa siku)' },
  hired_seasonal: { en: 'Hired (seasonal)', sw: 'Waajiriwa (msimu)' },
  exchange_labour: { en: 'Exchange labour', sw: 'Mgawanyo wa kazi' },
  mechanized: { en: 'Mechanized', sw: 'Mashine' },
  none: { en: 'None reported', sw: 'Hakuna' },
};

interface Step1Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
}

const Step1_Identity: React.FC<Step1Props> = ({ data, onChange, errors }) => {
  const language = useUIStore((s) => s.language);
  const [openGender, setOpenGender] = useState(false);
  const [openSeason, setOpenSeason] = useState(false);
  const lookupSeq = useRef(0);
  const lastDupRef = useRef<boolean | null>(null);

  const labourTypes = (data.labour_types as string[] | undefined) ?? ['none'];

  const toggleLabour = useCallback(
    (key: LabourKey) => {
      let next = [...labourTypes];
      if (key === 'none') {
        next = ['none'];
      } else {
        next = next.filter((x) => x !== 'none');
        if (next.includes(key)) next = next.filter((x) => x !== key);
        else next.push(key);
        if (next.length === 0) next = ['none'];
      }
      onChange({ labour_types: next });
    },
    [labourTypes, onChange],
  );

  useEffect(() => {
    const raw = String(data.farmer_phone ?? '');
    const phone = normalizeTanzanianPhoneInput(raw);
    if (!/^\+255[1-9]\d{8}$/.test(phone)) {
      if (lastDupRef.current !== false) {
        lastDupRef.current = false;
        onChange({ phone_duplicate_detected: false, phone_duplicate_confirmed: false });
      }
      return;
    }
    const seq = ++lookupSeq.current;
    const t = window.setTimeout(async () => {
      try {
        const row = await dimActors.findByPhoneE164(phone);
        if (lookupSeq.current !== seq) return;
        const detected = !!row;
        if (lastDupRef.current !== detected) {
          lastDupRef.current = detected;
          onChange({
            phone_duplicate_detected: detected,
            phone_duplicate_confirmed: false,
          });
        }
      } catch {
        if (lookupSeq.current !== seq) return;
        if (lastDupRef.current !== false) {
          lastDupRef.current = false;
          onChange({ phone_duplicate_detected: false });
        }
      }
    }, 650);
    return () => clearTimeout(t);
  }, [data.farmer_phone, onChange]);

  const handleChange = useCallback(
    (key: string, value: string | boolean) => {
      onChange({ [key]: value });
    },
    [onChange],
  );

  const inputBase =
    'w-full py-3 pr-4 bg-bg-input rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150 border';

  const dup = !!data.phone_duplicate_detected;

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">
        Farmer Identity
      </h2>
      <p className="text-sm text-text-tertiary mb-7">
        OR-TAMISEMI core fields — capture identification and demographics
      </p>

      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
        {/* Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
            Farmer name <span className="text-text-accent">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              <MaterialIcon name="person" size={18} />
            </span>
            <input
              type="text"
              value={(data.farmer_name as string) || ''}
              onChange={(e) => handleChange('farmer_name', e.target.value)}
              placeholder="Full name"
              className={cn(inputBase, errors.farmer_name ? 'border-error' : 'border-border', 'pl-11')}
            />
          </div>
          {errors.farmer_name && <p className="text-xs text-error-light mt-1">{errors.farmer_name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
            Phone <span className="text-text-accent">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-10 text-text-tertiary text-sm pointer-events-none">+255</span>
            <input
              type="tel"
              value={(data.farmer_phone as string) || ''}
              onChange={(e) => handleChange('farmer_phone', e.target.value)}
              placeholder="712 345 678"
              className={cn(
                inputBase,
                errors.farmer_phone ? 'border-error' : 'border-border',
                'pl-[88px]',
              )}
            />
          </div>
          {errors.farmer_phone && <p className="text-xs text-error-light mt-1">{errors.farmer_phone}</p>}
          {dup && (
            <div className="mt-2 p-3 rounded-[14px] bg-warning/10 border border-warning/25">
              <p className="text-xs text-warning-light mb-2">
                {language === 'sw'
                  ? 'Namba hii tayari ipo kwenye mfumo. Thibitisha na mkulima au badilisha namba.'
                  : 'This number is already registered. Confirm with the farmer or change the number.'}
              </p>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!data.phone_duplicate_confirmed}
                  onChange={(e) => handleChange('phone_duplicate_confirmed', e.target.checked)}
                  className="rounded border-border"
                />
                {language === 'sw'
                  ? 'Nimethibitisha — ni mkulima sahihi / kurudi tena kwa makusudi'
                  : 'I confirm this is the correct farmer / intentional re-entry'}
              </label>
            </div>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
            Gender <span className="text-text-accent">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenGender((o) => !o)}
              className={cn(
                inputBase,
                'text-left pl-4 cursor-pointer flex justify-between items-center',
                errors.farmer_gender ? 'border-error' : 'border-border',
              )}
            >
              <span className={data.farmer_gender ? 'text-white' : 'text-text-tertiary'}>
                {GENDER.find((g) => g.value === data.farmer_gender)?.[language === 'sw' ? 'sw' : 'en'] ??
                  'Select'}
              </span>
              <MaterialIcon name="expand_more" size={18} />
            </button>
            {openGender && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 nuru-glass-card border border-border rounded-[16px] overflow-hidden">
                {GENDER.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    className="w-full py-2.5 px-4 text-left text-sm bg-transparent text-white hover:bg-accent/10"
                    onClick={() => {
                      handleChange('farmer_gender', g.value);
                      setOpenGender(false);
                    }}
                  >
                    {g.en} / {g.sw}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.farmer_gender && <p className="text-xs text-error-light mt-1">{errors.farmer_gender}</p>}
        </div>

        {/* DOB */}
        <div>
          <label htmlFor="id-dob" className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
            Date of birth <span className="text-text-accent">*</span>
          </label>
          <input
            id="id-dob"
            type="date"
            value={(data.farmer_dob as string) || ''}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => handleChange('farmer_dob', e.target.value)}
            className={cn(inputBase, errors.farmer_dob ? 'border-error' : 'border-border', 'px-4')}
          />
          {errors.farmer_dob && <p className="text-xs text-error-light mt-1">{errors.farmer_dob}</p>}
        </div>

        {/* Season */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
            Reporting season <span className="text-text-accent">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenSeason((o) => !o)}
              className={cn(
                inputBase,
                'text-left pl-4 cursor-pointer flex justify-between items-center',
                errors.reporting_season ? 'border-error' : 'border-border',
              )}
            >
              <span className={data.reporting_season ? 'text-white' : 'text-text-tertiary'}>
                {SEASONS.find((s) => s.value === data.reporting_season)?.[language === 'sw' ? 'sw' : 'en'] ??
                  'Select'}
              </span>
              <MaterialIcon name="expand_more" size={18} />
            </button>
            {openSeason && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 nuru-glass-card border border-border rounded-[16px] max-h-56 overflow-y-auto">
                {SEASONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className="w-full py-2.5 px-4 text-left text-sm bg-transparent text-white hover:bg-accent/10"
                    onClick={() => {
                      handleChange('reporting_season', s.value);
                      setOpenSeason(false);
                    }}
                  >
                    {s.en} / {s.sw}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.reporting_season && (
            <p className="text-xs text-error-light mt-1">{errors.reporting_season}</p>
          )}
        </div>

        {/* Labour */}
        <div>
          <p className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-2">
            Labour <span className="text-text-accent">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {LABOUR_KEYS.map((key) => {
              const on = labourTypes.includes(key);
              const lab = LABOUR_LABELS[key] ?? { en: key, sw: key };
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleLabour(key)}
                  className={cn(
                    'py-2 px-3 rounded-full text-xs font-medium border-2 transition-colors',
                    on
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-border bg-transparent text-text-secondary',
                  )}
                >
                  {language === 'sw' ? lab.sw : lab.en}
                </button>
              );
            })}
          </div>
          {errors.labour_types && <p className="text-xs text-error-light mt-1">{errors.labour_types}</p>}
        </div>

        {/* National ID optional */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
            National ID
          </label>
          <input
            type="text"
            value={(data.farmer_national_id as string) || ''}
            onChange={(e) => handleChange('farmer_national_id', e.target.value)}
            placeholder="Digits only"
            className={cn(inputBase, errors.farmer_national_id ? 'border-error' : 'border-border', 'px-4')}
          />
          {errors.farmer_national_id && (
            <p className="text-xs text-error-light mt-1">{errors.farmer_national_id}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
            Cooperative
          </label>
          <input
            type="text"
            value={(data.cooperative as string) || ''}
            onChange={(e) => handleChange('cooperative', e.target.value)}
            className={cn(inputBase, 'border-border px-4')}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
            Farm name <span className="text-text-accent">*</span>
          </label>
          <input
            type="text"
            value={(data.farm_name as string) || ''}
            onChange={(e) => handleChange('farm_name', e.target.value)}
            className={cn(inputBase, errors.farm_name ? 'border-error' : 'border-border', 'px-4')}
          />
          {errors.farm_name && <p className="text-xs text-error-light mt-1">{errors.farm_name}</p>}
        </div>
      </div>
    </div>
  );
};

export default Step1_Identity;
