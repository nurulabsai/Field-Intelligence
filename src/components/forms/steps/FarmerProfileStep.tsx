import React, { useState, useCallback, useEffect, useRef } from 'react';
import type {
  FarmerProfile,
  FarmerGender,
  AgeRange,
  IncomePrimary,
  EducationLevel,
  FarmingExperienceRange,
  MobileMoneyProvider,
  PhoneType,
  LanguagePreference,
} from '../../../types/farmerTypes';
import { findFarmerByPhone } from '../../../services/auditStorageService';

// ─── Props ────────────────────────────────────────────────────────────────────

interface FarmerProfileStepProps {
  farmer: FarmerProfile | null;
  onUpdate: (farmer: FarmerProfile) => void;
  auditorId: string;
  auditId: string;
}

// ─── Section metadata ─────────────────────────────────────────────────────────

interface SectionMeta {
  key: SectionKey;
  label: string;
  icon: string;
}

type SectionKey = 'identity' | 'household' | 'experience' | 'financial' | 'digital';

const SECTIONS: readonly SectionMeta[] = [
  { key: 'identity', label: 'Identity', icon: 'person' },
  { key: 'household', label: 'Household', icon: 'family_restroom' },
  { key: 'experience', label: 'Experience', icon: 'agriculture' },
  { key: 'financial', label: 'Financial', icon: 'account_balance' },
  { key: 'digital', label: 'Digital', icon: 'smartphone' },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createDefaultFarmer(auditId: string, auditorId: string): FarmerProfile {
  return {
    localId: crypto.randomUUID(),
    auditId,
    capturedAt: new Date().toISOString(),
    capturedBy: auditorId,
    identity: {
      phoneNumber: '',
      fullName: '',
      preferredName: '',
      nationalId: '',
      gender: 'prefer_not_to_say',
      ageRange: '25_to_35',
    },
    household: {
      householdSize: 1,
      dependents: 0,
      offFarmIncome: false,
      offFarmIncomeSource: '',
      primaryIncomeSource: 'farming_only',
      educationLevel: 'primary',
    },
    experience: {
      yearsFarming: 'less_than_2',
      hasReceivedTraining: false,
      trainingTypes: [],
      cooperativeMember: false,
      cooperativeName: '',
      farmerGroupMember: false,
      farmerGroupName: '',
      extensionContactFrequency: 'never',
    },
    financial: {
      hasBankAccount: false,
      bankName: '',
      mobileMoneyUser: false,
      mobileMoneyProviders: [],
      mobileMoneyNumber: '',
      hasAccessedCredit: false,
      creditSources: [],
      creditPurpose: '',
      hasInputCredit: false,
      inputCreditSource: '',
    },
    digital: {
      phoneType: 'feature_phone',
      usesWhatsApp: false,
      usesAgriApps: false,
      agriAppsUsed: [],
      languagePreference: 'swahili',
      comfortWithDigitalForms: 'needs_help',
    },
  };
}

function normalizePhone(display: string): string {
  const digits = display.replace(/\D/g, '');
  if (digits.startsWith('255')) return `+${digits}`;
  if (digits.startsWith('0')) return `+255${digits.slice(1)}`;
  return `+255${digits}`;
}

function countSectionComplete(section: SectionKey, farmer: FarmerProfile): [number, number] {
  switch (section) {
    case 'identity': {
      const id = farmer.identity;
      const total = 4;
      let done = 0;
      if (id.phoneNumber.length >= 10) done++;
      if (id.fullName.trim().length > 0) done++;
      if (id.gender !== 'prefer_not_to_say') done++;
      if (id.ageRange) done++;
      return [done, total];
    }
    case 'household': {
      const h = farmer.household;
      const total = 4;
      let done = 0;
      if (h.householdSize > 0) done++;
      if (h.primaryIncomeSource) done++;
      if (h.educationLevel) done++;
      if (!h.offFarmIncome || (h.offFarmIncome && h.offFarmIncomeSource)) done++;
      return [done, total];
    }
    case 'experience': {
      const e = farmer.experience;
      const total = 4;
      let done = 0;
      if (e.yearsFarming) done++;
      if (e.extensionContactFrequency) done++;
      if (!e.hasReceivedTraining || (e.hasReceivedTraining && (e.trainingTypes?.length ?? 0) > 0)) done++;
      if (!e.cooperativeMember || (e.cooperativeMember && e.cooperativeName)) done++;
      return [done, total];
    }
    case 'financial': {
      const f = farmer.financial;
      const total = 4;
      let done = 0;
      if (!f.hasBankAccount || (f.hasBankAccount && f.bankName)) done++;
      if (!f.mobileMoneyUser || (f.mobileMoneyUser && f.mobileMoneyProviders.length > 0)) done++;
      if (!f.hasAccessedCredit || (f.hasAccessedCredit && (f.creditSources?.length ?? 0) > 0)) done++;
      if (!f.hasInputCredit || (f.hasInputCredit && f.inputCreditSource)) done++;
      return [done, total];
    }
    case 'digital': {
      const d = farmer.digital;
      const total = 3;
      let done = 0;
      if (d.phoneType) done++;
      if (d.languagePreference) done++;
      if (d.comfortWithDigitalForms) done++;
      return [done, total];
    }
  }
}

// ─── Reusable inline components ───────────────────────────────────────────────

function Label({ en, sw }: { en: string; sw?: string }) {
  return (
    <label className="block mb-1.5">
      <span className="text-sm font-medium text-white font-manrope">{en}</span>
      {sw && <span className="block text-xs text-white/40 font-manrope mt-0.5">{sw}</span>}
    </label>
  );
}

function GlassInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  hero,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hero?: boolean;
  inputMode?: 'text' | 'tel' | 'numeric' | 'email';
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 text-white font-manrope
        placeholder:text-white/20 focus:outline-none focus:border-[#BEF264]/50 focus:ring-1 focus:ring-[#BEF264]/30
        transition-all duration-200 ${hero ? 'h-14 text-xl font-sora tracking-wide' : 'h-12 text-sm'}`}
    />
  );
}

function GlassSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 text-sm text-white
        font-manrope focus:outline-none focus:border-[#BEF264]/50 focus:ring-1 focus:ring-[#BEF264]/30
        transition-all duration-200 appearance-none"
      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23BEF264\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#111622] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 h-11 min-h-[44px] rounded-2xl text-sm font-manrope font-medium transition-all duration-200
            ${value === opt.value
              ? 'bg-[#BEF264] text-black shadow-[0_0_20px_rgba(190,242,100,0.25)]'
              : 'bg-white/[0.03] border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.15]'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  labelSw,
  value,
  onChange,
}: {
  label: string;
  labelSw?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-white font-manrope">{label}</span>
        {labelSw && <span className="block text-xs text-white/40 font-manrope mt-0.5">{labelSw}</span>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`h-14 w-20 rounded-2xl text-sm font-manrope font-semibold transition-all duration-200
            ${value
              ? 'bg-[#BEF264] text-black shadow-[0_0_20px_rgba(190,242,100,0.25)]'
              : 'bg-white/[0.03] border border-white/[0.08] text-white/40'
            }`}
        >
          YES
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`h-14 w-20 rounded-2xl text-sm font-manrope font-semibold transition-all duration-200
            ${!value
              ? 'bg-white/[0.06] border border-white/[0.12] text-white'
              : 'bg-white/[0.03] border border-white/[0.08] text-white/40'
            }`}
        >
          NO
        </button>
      </div>
    </div>
  );
}

function ChipMultiSelect({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) => {
    const next = selected.includes(val)
      ? selected.filter((s) => s !== val)
      : [...selected, val];
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`h-11 min-h-[44px] px-4 rounded-full text-sm font-manrope font-medium transition-all duration-200
              ${active
                ? 'bg-[#BEF264] text-black shadow-[0_0_16px_rgba(190,242,100,0.2)]'
                : 'bg-white/[0.03] border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.15]'
              }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-2xl bg-white/[0.03] border border-white/[0.08]
          text-white/60 text-xl font-bold flex items-center justify-center hover:border-white/[0.15] transition-all"
      >
        -
      </button>
      <span className="text-xl font-sora font-semibold text-white w-12 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-2xl bg-white/[0.03] border border-white/[0.08]
          text-white/60 text-xl font-bold flex items-center justify-center hover:border-white/[0.15] transition-all"
      >
        +
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FarmerProfileStep({ farmer, onUpdate, auditorId, auditId }: FarmerProfileStepProps) {
  const [form, setForm] = useState<FarmerProfile>(
    () => farmer ?? createDefaultFarmer(auditId, auditorId),
  );
  const [openSection, setOpenSection] = useState<SectionKey>('identity');
  const [duplicateWarning, setDuplicateWarning] = useState<FarmerProfile | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync form changes up to parent
  const updateForm = useCallback(
    (updater: (prev: FarmerProfile) => FarmerProfile) => {
      setForm((prev) => {
        const next = updater(prev);
        onUpdate(next);
        return next;
      });
    },
    [onUpdate],
  );

  // Sync incoming farmer prop
  useEffect(() => {
    if (farmer) {
      setForm(farmer);
    }
  }, [farmer]);

  // ── Phone duplicate check ──
  const handlePhoneBlur = useCallback(async () => {
    const phone = form.identity.phoneNumber;
    if (phone.replace(/\D/g, '').length < 9) return;

    setCheckingPhone(true);
    try {
      const normalized = normalizePhone(phone);
      const existing = await findFarmerByPhone(normalized);
      if (existing && existing.localId !== form.localId) {
        setDuplicateWarning(existing);
        updateForm((prev) => ({
          ...prev,
          possibleDuplicateId: existing.localId,
        }));
      } else {
        setDuplicateWarning(null);
        updateForm((prev) => ({
          ...prev,
          possibleDuplicateId: undefined,
        }));
      }
    } catch {
      // Offline or DB error - silently continue
    } finally {
      setCheckingPhone(false);
    }
  }, [form.identity.phoneNumber, form.localId, updateForm]);

  // ── Section progress pills ──
  const sectionProgress = SECTIONS.map((s) => ({
    ...s,
    progress: countSectionComplete(s.key, form),
  }));

  const toggleSection = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? prev : key));
  };

  // ── Shorthand updaters ──
  const setIdentity = (patch: Partial<FarmerProfile['identity']>) =>
    updateForm((prev) => ({ ...prev, identity: { ...prev.identity, ...patch } }));

  const setHousehold = (patch: Partial<FarmerProfile['household']>) =>
    updateForm((prev) => ({ ...prev, household: { ...prev.household, ...patch } }));

  const setExperience = (patch: Partial<FarmerProfile['experience']>) =>
    updateForm((prev) => ({ ...prev, experience: { ...prev.experience, ...patch } }));

  const setFinancial = (patch: Partial<FarmerProfile['financial']>) =>
    updateForm((prev) => ({ ...prev, financial: { ...prev.financial, ...patch } }));

  const setDigital = (patch: Partial<FarmerProfile['digital']>) =>
    updateForm((prev) => ({ ...prev, digital: { ...prev.digital, ...patch } }));

  return (
    <div className="w-full max-w-[430px] mx-auto space-y-4 pb-8">
      {/* ── Section progress pills ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-1">
        {sectionProgress.map((s) => {
          const [done, total] = s.progress;
          const complete = done === total;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSection(s.key)}
              className={`shrink-0 h-8 px-3 rounded-full text-xs font-manrope font-semibold flex items-center gap-1.5 transition-all duration-200
                ${complete
                  ? 'bg-[#BEF264]/20 text-[#BEF264] border border-[#BEF264]/30'
                  : openSection === s.key
                    ? 'bg-white/[0.06] text-white border border-white/[0.12]'
                    : 'bg-white/[0.03] text-white/40 border border-white/[0.05]'
                }`}
            >
              <span className="material-symbols-outlined text-sm">{s.icon}</span>
              <span>{done}/{total}</span>
            </button>
          );
        })}
      </div>

      {/* ── Accordion sections ── */}
      {SECTIONS.map((section) => {
        const isOpen = openSection === section.key;
        const [done, total] = countSectionComplete(section.key, form);
        const complete = done === total;

        return (
          <div
            key={section.key}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden transition-all duration-300"
          >
            {/* Accordion header */}
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between px-5 py-4 min-h-[56px]"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-xl ${complete ? 'text-[#BEF264]' : 'text-white/50'}`}
                >
                  {section.icon}
                </span>
                <span className="text-base font-sora font-semibold text-white">
                  {section.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-manrope font-medium px-2 py-0.5 rounded-full
                    ${complete
                      ? 'bg-[#BEF264]/20 text-[#BEF264]'
                      : 'bg-white/[0.06] text-white/50'
                    }`}
                >
                  {done}/{total}
                </span>
                <span
                  className={`material-symbols-outlined text-white/40 text-lg transition-transform duration-200
                    ${isOpen ? 'rotate-180' : ''}`}
                >
                  expand_more
                </span>
              </div>
            </button>

            {/* Accordion body */}
            {isOpen && (
              <div className="px-5 pb-5 space-y-5">
                {section.key === 'identity' && (
                  <IdentityFields
                    identity={form.identity}
                    onChange={setIdentity}
                    onPhoneBlur={handlePhoneBlur}
                    checkingPhone={checkingPhone}
                    duplicateWarning={duplicateWarning}
                    duplicateAcknowledged={form.duplicateAcknowledged}
                    onAcknowledgeDuplicate={() =>
                      updateForm((prev) => ({ ...prev, duplicateAcknowledged: true }))
                    }
                    phoneInputRef={phoneInputRef}
                  />
                )}
                {section.key === 'household' && (
                  <HouseholdFields household={form.household} onChange={setHousehold} />
                )}
                {section.key === 'experience' && (
                  <ExperienceFields experience={form.experience} onChange={setExperience} />
                )}
                {section.key === 'financial' && (
                  <FinancialFields financial={form.financial} onChange={setFinancial} />
                )}
                {section.key === 'digital' && (
                  <DigitalFields digital={form.digital} onChange={setDigital} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Identity Fields ──────────────────────────────────────────────────────────

function IdentityFields({
  identity,
  onChange,
  onPhoneBlur,
  checkingPhone,
  duplicateWarning,
  duplicateAcknowledged,
  onAcknowledgeDuplicate,
  phoneInputRef,
}: {
  identity: FarmerProfile['identity'];
  onChange: (patch: Partial<FarmerProfile['identity']>) => void;
  onPhoneBlur: () => void;
  checkingPhone: boolean;
  duplicateWarning: FarmerProfile | null;
  duplicateAcknowledged?: boolean;
  onAcknowledgeDuplicate: () => void;
  phoneInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <>
      {/* HERO: Phone number */}
      <div>
        <Label en="Phone Number" sw="Nambari ya Simu" />
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BEF264] font-sora font-semibold text-lg">
            +255
          </span>
          <input
            ref={phoneInputRef}
            type="tel"
            inputMode="tel"
            value={identity.phoneNumber.startsWith('+255')
              ? identity.phoneNumber.slice(4).trim()
              : identity.phoneNumber.replace(/^\+?255/, '')
            }
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
              onChange({ phoneNumber: digits ? `+255${digits}` : '' });
            }}
            onBlur={onPhoneBlur}
            placeholder="7XX XXX XXX"
            className="w-full h-14 bg-white/[0.03] border border-white/[0.08] rounded-2xl pl-16 pr-4 text-xl text-white
              font-sora tracking-wider placeholder:text-white/20 focus:outline-none focus:border-[#BEF264]/50
              focus:ring-1 focus:ring-[#BEF264]/30 transition-all duration-200"
          />
          {checkingPhone && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <span className="material-symbols-outlined text-[#67E8F9] animate-spin text-lg">progress_activity</span>
            </span>
          )}
        </div>

        {/* Duplicate warning */}
        {duplicateWarning && !duplicateAcknowledged && (
          <div className="mt-3 bg-[#FFBF00]/10 border border-[#FFBF00]/30 rounded-2xl p-3">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#FFBF00] text-lg mt-0.5">warning</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#FFBF00] font-manrope font-medium">
                  Possible duplicate found
                </p>
                <p className="text-xs text-white/50 font-manrope mt-1">
                  {duplicateWarning.identity.fullName || 'Unknown farmer'} - recorded{' '}
                  {new Date(duplicateWarning.capturedAt).toLocaleDateString()}
                </p>
                <button
                  type="button"
                  onClick={onAcknowledgeDuplicate}
                  className="mt-2 h-9 min-h-[44px] px-4 rounded-xl bg-[#FFBF00]/20 text-[#FFBF00] text-xs
                    font-manrope font-semibold hover:bg-[#FFBF00]/30 transition-all"
                >
                  Continue anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Name */}
      <div>
        <Label en="Full Name" sw="Jina Kamili" />
        <GlassInput
          value={identity.fullName}
          onChange={(v) => onChange({ fullName: v })}
          placeholder="e.g. Amina Juma"
        />
      </div>

      {/* Preferred Name */}
      <div>
        <Label en="Preferred Name (optional)" sw="Jina Unalopendelea" />
        <GlassInput
          value={identity.preferredName ?? ''}
          onChange={(v) => onChange({ preferredName: v })}
          placeholder="e.g. Mama Juma"
        />
      </div>

      {/* Gender */}
      <div>
        <Label en="Gender" sw="Jinsia" />
        <SegmentedControl
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'prefer_not_to_say', label: 'Prefer not to say' },
          ]}
          value={identity.gender}
          onChange={(v) => onChange({ gender: v as FarmerGender })}
        />
      </div>

      {/* Age Range */}
      <div>
        <Label en="Age Range" sw="Umri" />
        <GlassSelect
          value={identity.ageRange}
          onChange={(v) => onChange({ ageRange: v as AgeRange })}
          options={[
            { value: 'under_25', label: 'Under 25' },
            { value: '25_to_35', label: '25 - 35' },
            { value: '35_to_45', label: '35 - 45' },
            { value: '45_to_55', label: '45 - 55' },
            { value: '55_to_65', label: '55 - 65' },
            { value: 'over_65', label: 'Over 65' },
          ]}
        />
      </div>

      {/* National ID */}
      <div>
        <Label en="National ID (optional)" sw="Nambari ya Kitambulisho" />
        <GlassInput
          value={identity.nationalId ?? ''}
          onChange={(v) => onChange({ nationalId: v })}
          placeholder="NIDA number"
          autoComplete="off"
        />
      </div>
    </>
  );
}

// ─── Household Fields ─────────────────────────────────────────────────────────

function HouseholdFields({
  household,
  onChange,
}: {
  household: FarmerProfile['household'];
  onChange: (patch: Partial<FarmerProfile['household']>) => void;
}) {
  return (
    <>
      <div>
        <Label en="Household Size" sw="Idadi ya Watu Nyumbani" />
        <NumberInput
          value={household.householdSize}
          onChange={(v) => onChange({ householdSize: v })}
          min={1}
          max={30}
        />
      </div>

      <div>
        <Label en="Dependents" sw="Wategemezi" />
        <NumberInput
          value={household.dependents}
          onChange={(v) => onChange({ dependents: v })}
          min={0}
          max={20}
        />
      </div>

      <div>
        <Label en="Primary Income Source" sw="Chanzo Kikuu cha Mapato" />
        <GlassSelect
          value={household.primaryIncomeSource}
          onChange={(v) => onChange({ primaryIncomeSource: v as IncomePrimary })}
          options={[
            { value: 'farming_only', label: 'Farming only' },
            { value: 'farming_and_livestock', label: 'Farming & Livestock' },
            { value: 'farming_and_employment', label: 'Farming & Employment' },
            { value: 'farming_and_business', label: 'Farming & Business' },
            { value: 'mixed', label: 'Mixed sources' },
          ]}
        />
      </div>

      <div>
        <Toggle
          label="Off-Farm Income"
          labelSw="Mapato Nje ya Shamba"
          value={household.offFarmIncome}
          onChange={(v) => onChange({ offFarmIncome: v, offFarmIncomeSource: v ? household.offFarmIncomeSource : '' })}
        />
        {household.offFarmIncome && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-[#BEF264]/30">
            <Label en="Income Source" sw="Chanzo cha Mapato" />
            <GlassInput
              value={household.offFarmIncomeSource ?? ''}
              onChange={(v) => onChange({ offFarmIncomeSource: v })}
              placeholder="e.g. Small business, teaching"
            />
          </div>
        )}
      </div>

      <div>
        <Label en="Education Level" sw="Kiwango cha Elimu" />
        <GlassSelect
          value={household.educationLevel}
          onChange={(v) => onChange({ educationLevel: v as EducationLevel })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'vocational', label: 'Vocational' },
            { value: 'tertiary', label: 'Tertiary' },
          ]}
        />
      </div>
    </>
  );
}

// ─── Experience Fields ────────────────────────────────────────────────────────

function ExperienceFields({
  experience,
  onChange,
}: {
  experience: FarmerProfile['experience'];
  onChange: (patch: Partial<FarmerProfile['experience']>) => void;
}) {
  return (
    <>
      <div>
        <Label en="Years Farming" sw="Miaka ya Kilimo" />
        <GlassSelect
          value={experience.yearsFarming}
          onChange={(v) => onChange({ yearsFarming: v as FarmingExperienceRange })}
          options={[
            { value: 'less_than_2', label: 'Less than 2 years' },
            { value: '2_to_5', label: '2 - 5 years' },
            { value: '5_to_10', label: '5 - 10 years' },
            { value: '10_to_20', label: '10 - 20 years' },
            { value: 'over_20', label: 'Over 20 years' },
          ]}
        />
      </div>

      <div>
        <Toggle
          label="Has Received Training"
          labelSw="Amepata Mafunzo"
          value={experience.hasReceivedTraining}
          onChange={(v) => onChange({ hasReceivedTraining: v, trainingTypes: v ? experience.trainingTypes : [] })}
        />
        {experience.hasReceivedTraining && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-[#BEF264]/30">
            <Label en="Training Types" sw="Aina za Mafunzo" />
            <ChipMultiSelect
              options={[
                { value: 'soil_management', label: 'Soil Management' },
                { value: 'pest_control', label: 'Pest Control' },
                { value: 'irrigation', label: 'Irrigation' },
                { value: 'post_harvest', label: 'Post-Harvest' },
                { value: 'business_skills', label: 'Business Skills' },
                { value: 'climate_smart', label: 'Climate Smart' },
              ]}
              selected={experience.trainingTypes ?? []}
              onChange={(v) => onChange({ trainingTypes: v })}
            />
          </div>
        )}
      </div>

      <div>
        <Toggle
          label="Cooperative Member"
          labelSw="Mwanachama wa Ushirika"
          value={experience.cooperativeMember}
          onChange={(v) => onChange({ cooperativeMember: v, cooperativeName: v ? experience.cooperativeName : '' })}
        />
        {experience.cooperativeMember && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-[#BEF264]/30">
            <Label en="Cooperative Name" sw="Jina la Ushirika" />
            <GlassInput
              value={experience.cooperativeName ?? ''}
              onChange={(v) => onChange({ cooperativeName: v })}
              placeholder="e.g. Kilimanjaro Coop"
            />
          </div>
        )}
      </div>

      <div>
        <Toggle
          label="Farmer Group Member"
          labelSw="Mwanachama wa Kikundi cha Wakulima"
          value={experience.farmerGroupMember}
          onChange={(v) => onChange({ farmerGroupMember: v, farmerGroupName: v ? experience.farmerGroupName : '' })}
        />
        {experience.farmerGroupMember && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-[#BEF264]/30">
            <Label en="Group Name" sw="Jina la Kikundi" />
            <GlassInput
              value={experience.farmerGroupName ?? ''}
              onChange={(v) => onChange({ farmerGroupName: v })}
              placeholder="e.g. Upendo Farmers"
            />
          </div>
        )}
      </div>

      <div>
        <Label en="Extension Contact Frequency" sw="Mara ya Kutembelea na Mtaalamu" />
        <GlassSelect
          value={experience.extensionContactFrequency}
          onChange={(v) =>
            onChange({ extensionContactFrequency: v as FarmerProfile['experience']['extensionContactFrequency'] })
          }
          options={[
            { value: 'never', label: 'Never' },
            { value: 'rarely', label: 'Rarely (1-2x/year)' },
            { value: 'sometimes', label: 'Sometimes (quarterly)' },
            { value: 'regularly', label: 'Regularly (monthly+)' },
          ]}
        />
      </div>
    </>
  );
}

// ─── Financial Fields ─────────────────────────────────────────────────────────

function FinancialFields({
  financial,
  onChange,
}: {
  financial: FarmerProfile['financial'];
  onChange: (patch: Partial<FarmerProfile['financial']>) => void;
}) {
  return (
    <>
      <div>
        <Toggle
          label="Has Bank Account"
          labelSw="Ana Akaunti ya Benki"
          value={financial.hasBankAccount}
          onChange={(v) => onChange({ hasBankAccount: v, bankName: v ? financial.bankName : '' })}
        />
        {financial.hasBankAccount && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-[#BEF264]/30">
            <Label en="Bank Name" sw="Jina la Benki" />
            <GlassInput
              value={financial.bankName ?? ''}
              onChange={(v) => onChange({ bankName: v })}
              placeholder="e.g. NMB, CRDB"
              autoComplete="off"
            />
          </div>
        )}
      </div>

      <div>
        <Toggle
          label="Mobile Money User"
          labelSw="Anatumia Pesa kwa Simu"
          value={financial.mobileMoneyUser}
          onChange={(v) =>
            onChange({
              mobileMoneyUser: v,
              mobileMoneyProviders: v ? financial.mobileMoneyProviders : [],
              mobileMoneyNumber: v ? financial.mobileMoneyNumber : '',
            })
          }
        />
        {financial.mobileMoneyUser && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-[#BEF264]/30 space-y-4">
            <div>
              <Label en="Providers" sw="Watoa Huduma" />
              <ChipMultiSelect
                options={[
                  { value: 'mpesa', label: 'M-Pesa' },
                  { value: 'tigo_pesa', label: 'Tigo Pesa' },
                  { value: 'airtel_money', label: 'Airtel Money' },
                  { value: 'halopesa', label: 'HaloPesa' },
                ]}
                selected={financial.mobileMoneyProviders}
                onChange={(v) => onChange({ mobileMoneyProviders: v as MobileMoneyProvider[] })}
              />
            </div>
            <div>
              <Label en="Mobile Money Number" sw="Nambari ya Pesa kwa Simu" />
              <GlassInput
                value={financial.mobileMoneyNumber ?? ''}
                onChange={(v) => onChange({ mobileMoneyNumber: v })}
                placeholder="07XX XXX XXX"
                type="tel"
                inputMode="tel"
                autoComplete="off"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <Toggle
          label="Has Accessed Credit"
          labelSw="Amepata Mkopo"
          value={financial.hasAccessedCredit}
          onChange={(v) =>
            onChange({
              hasAccessedCredit: v,
              creditSources: v ? financial.creditSources : [],
              creditPurpose: v ? financial.creditPurpose : '',
            })
          }
        />
        {financial.hasAccessedCredit && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-[#BEF264]/30 space-y-4">
            <div>
              <Label en="Credit Sources" sw="Vyanzo vya Mkopo" />
              <ChipMultiSelect
                options={[
                  { value: 'bank', label: 'Bank' },
                  { value: 'microfinance', label: 'Microfinance' },
                  { value: 'cooperative', label: 'Cooperative' },
                  { value: 'mobile_lender', label: 'Mobile Lender' },
                  { value: 'informal', label: 'Informal' },
                ]}
                selected={financial.creditSources ?? []}
                onChange={(v) => onChange({ creditSources: v })}
              />
            </div>
            <div>
              <Label en="Credit Purpose" sw="Sababu ya Mkopo" />
              <GlassInput
                value={financial.creditPurpose ?? ''}
                onChange={(v) => onChange({ creditPurpose: v })}
                placeholder="e.g. Seeds, fertilizer, equipment"
                autoComplete="off"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <Toggle
          label="Has Input Credit"
          labelSw="Ana Mkopo wa Pembejeo"
          value={financial.hasInputCredit}
          onChange={(v) => onChange({ hasInputCredit: v, inputCreditSource: v ? financial.inputCreditSource : '' })}
        />
        {financial.hasInputCredit && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-[#BEF264]/30">
            <Label en="Input Credit Source" sw="Chanzo cha Mkopo wa Pembejeo" />
            <GlassInput
              value={financial.inputCreditSource ?? ''}
              onChange={(v) => onChange({ inputCreditSource: v })}
              placeholder="e.g. Yara, ETG"
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </>
  );
}

// ─── Digital Fields ───────────────────────────────────────────────────────────

function DigitalFields({
  digital,
  onChange,
}: {
  digital: FarmerProfile['digital'];
  onChange: (patch: Partial<FarmerProfile['digital']>) => void;
}) {
  return (
    <>
      <div>
        <Label en="Phone Type" sw="Aina ya Simu" />
        <SegmentedControl
          options={[
            { value: 'smartphone', label: 'Smartphone' },
            { value: 'feature_phone', label: 'Feature Phone' },
            { value: 'no_phone', label: 'No Phone' },
          ]}
          value={digital.phoneType}
          onChange={(v) => onChange({ phoneType: v as PhoneType })}
        />
      </div>

      <div>
        <Toggle
          label="Uses WhatsApp"
          labelSw="Anatumia WhatsApp"
          value={digital.usesWhatsApp}
          onChange={(v) => onChange({ usesWhatsApp: v })}
        />
      </div>

      <div>
        <Toggle
          label="Uses Agricultural Apps"
          labelSw="Anatumia Programu za Kilimo"
          value={digital.usesAgriApps}
          onChange={(v) => onChange({ usesAgriApps: v, agriAppsUsed: v ? digital.agriAppsUsed : [] })}
        />
        {digital.usesAgriApps && (
          <div className="mt-3 ml-2 pl-4 border-l-2 border-[#BEF264]/30">
            <Label en="Apps Used" sw="Programu Zinazotumika" />
            <ChipMultiSelect
              options={[
                { value: 'plantvillage', label: 'PlantVillage' },
                { value: 'ignitia', label: 'Ignitia' },
                { value: 'esoko', label: 'Esoko' },
                { value: 'mkulima_young', label: 'Mkulima Young' },
                { value: 'other', label: 'Other' },
              ]}
              selected={digital.agriAppsUsed ?? []}
              onChange={(v) => onChange({ agriAppsUsed: v })}
            />
          </div>
        )}
      </div>

      <div>
        <Label en="Language Preference" sw="Lugha Unayopendelea" />
        <GlassSelect
          value={digital.languagePreference}
          onChange={(v) => onChange({ languagePreference: v as LanguagePreference })}
          options={[
            { value: 'swahili', label: 'Kiswahili' },
            { value: 'english', label: 'English' },
            { value: 'both', label: 'Both / Zote' },
            { value: 'local_dialect', label: 'Local Dialect' },
          ]}
        />
      </div>

      <div>
        <Label en="Comfort with Digital Forms" sw="Urahisi wa Kutumia Fomu za Kidijitali" />
        <GlassSelect
          value={digital.comfortWithDigitalForms}
          onChange={(v) =>
            onChange({ comfortWithDigitalForms: v as FarmerProfile['digital']['comfortWithDigitalForms'] })
          }
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'needs_help', label: 'Needs Help' },
            { value: 'not_comfortable', label: 'Not Comfortable' },
          ]}
        />
      </div>
    </>
  );
}
