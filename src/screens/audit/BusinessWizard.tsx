import React, { useState, useCallback, useEffect } from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../design-system';
import { useAuditStore } from '../../store/index';
import {
  DISTRICTS, STAKEHOLDER_TYPES, INPUT_CATEGORIES, COMMODITIES,
  VOLUME_CATEGORIES, PAYMENT_TERMS, VEHICLE_TYPES, SERVICE_TYPES,
  STOCK_LEVELS, MARKET_ACTIVITY, PRODUCT_CATEGORIES, PRODUCT_CONDITIONS,
  YES_NO_UNCLEAR, CHALLENGES, DATA_QUALITY, BUSINESS_STEP_LABELS,
  BUSINESS_TOTAL_STEPS,
  type Choice,
} from '../../lib/business-audit-choices';
import AuditStepIndicator from '../../components/AuditStepIndicator';

type FormData = Record<string, unknown>;

interface BusinessWizardProps {
  onComplete?: (data: FormData) => void;
}

// ---------------------------------------------------------------------------
// Reusable field primitives
// ---------------------------------------------------------------------------

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mb-1.5">
      {label}
      {required && <span className="text-text-accent ml-1">*</span>}
    </label>
  );
}

function TextInput({
  field, value, onChange, placeholder, type = 'text', error, icon,
}: {
  field: string; value: string; onChange: (k: string, v: string) => void;
  placeholder?: string; type?: string; error?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          inputMode={type === 'number' ? 'numeric' : undefined}
          className={cn(
            'w-full py-3 pr-4 bg-bg-input rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150 border',
            error ? 'border-error' : 'border-border',
            'focus:border-accent',
          )}
          style={{ paddingLeft: icon ? '44px' : '16px' }}
        />
      </div>
      {error && <p className="text-xs text-error-light mt-1">{error}</p>}
    </div>
  );
}

function TextArea({
  field, value, onChange, placeholder, error,
}: {
  field: string; value: string; onChange: (k: string, v: string) => void;
  placeholder?: string; error?: string;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={e => onChange(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={cn(
          'w-full py-3 px-4 bg-bg-input rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150 border resize-none',
          error ? 'border-error' : 'border-border',
          'focus:border-accent',
        )}
      />
      {error && <p className="text-xs text-error-light mt-1">{error}</p>}
    </div>
  );
}

function SelectOne({
  field, value, choices, onChange, error,
}: {
  field: string; value: string; choices: Choice[]; onChange: (k: string, v: string) => void; error?: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-1.5">
        {choices.map(c => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(field, c.value)}
            className={cn(
              'min-h-12 py-2.5 px-4 rounded-[14px] text-left text-[0.875rem] font-medium border transition-all cursor-pointer',
              value === c.value
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-bg-input border-border text-text-secondary hover:border-border-dark',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-error-light mt-1">{error}</p>}
    </div>
  );
}

function SelectMultiple({
  field, value, choices, onChange,
}: {
  field: string; value: string[]; choices: Choice[]; onChange: (k: string, v: string[]) => void;
}) {
  const toggle = (v: string) => {
    const next = value.includes(v) ? value.filter(x => x !== v) : [...value, v];
    onChange(field, next);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {choices.map(c => (
        <button
          key={c.value}
          type="button"
          onClick={() => toggle(c.value)}
          className={cn(
            'py-2 px-3 rounded-full text-[0.8rem] font-medium border transition-all cursor-pointer',
            value.includes(c.value)
              ? 'bg-accent/15 border-accent text-accent'
              : 'bg-bg-input border-border text-text-secondary hover:border-border-dark',
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function YesNo({
  field, value, onChange, label,
}: {
  field: string; value: string; onChange: (k: string, v: string) => void; label?: string;
}) {
  return (
    <div>
      {label && <FieldLabel label={label} />}
      <div className="flex gap-2">
        {(['yes', 'no'] as const).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(field, v)}
            className={cn(
              'flex-1 min-h-12 py-2.5 rounded-[14px] text-[0.875rem] font-semibold border transition-all cursor-pointer',
              value === v
                ? (v === 'yes' ? 'bg-success/15 border-success text-success' : 'bg-error/15 border-error text-error')
                : 'bg-bg-input border-border text-text-secondary hover:border-border-dark',
            )}
          >
            {v === 'yes' ? 'Yes / Ndiyo' : 'No / Hapana'}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberInput({
  field, value, onChange, placeholder, suffix, error,
}: {
  field: string; value: number | string; onChange: (k: string, v: string) => void;
  placeholder?: string; suffix?: string; error?: string;
}) {
  return (
    <div>
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? '' : String(value)}
          onChange={e => onChange(field, e.target.value.replace(/[^0-9]/g, ''))}
          placeholder={placeholder}
          className={cn(
            'w-full py-3 px-4 bg-bg-input rounded-[16px] text-white text-[0.938rem] font-inherit outline-none transition-colors duration-150 border',
            error ? 'border-error' : 'border-border',
            'focus:border-accent',
          )}
        />
        {suffix && (
          <span className="absolute right-4 text-text-tertiary text-xs font-semibold pointer-events-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-error-light mt-1">{error}</p>}
    </div>
  );
}

function StockPriceRow({
  stockField, priceField, label, priceSuffix, data, onChange,
}: {
  stockField: string; priceField: string; label: string; priceSuffix: string;
  data: FormData; onChange: (k: string, v: unknown) => void;
}) {
  const stock = (data[stockField] as string) || '';
  const price = (data[priceField] as string) || '';
  return (
    <div className="nuru-glass-card rounded-[32px] p-4 space-y-3">
      <p className="text-sm font-semibold text-white">{label}</p>
      <div>
        <FieldLabel label="Stock Level" />
        <SelectOne field={stockField} value={stock} choices={STOCK_LEVELS} onChange={(k, v) => onChange(k, v)} />
      </div>
      {stock && stock !== 'out_of_stock' && stock !== 'not_sold' && (
        <div>
          <FieldLabel label={`Price (${priceSuffix})`} />
          <NumberInput field={priceField} value={price} onChange={(k, v) => onChange(k, v)} placeholder="0" suffix="TZS" />
        </div>
      )}
    </div>
  );
}

function SectionNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-accent/5 border border-accent/20 rounded-[14px] p-3 mb-4">
      <p className="text-xs text-accent/80">{children}</p>
    </div>
  );
}

function PhotoCapture({ field, label, data, onChange }: {
  field: string; label: string; data: FormData; onChange: (k: string, v: unknown) => void;
}) {
  const captured = Boolean(data[field]);
  return (
    <button
      type="button"
      onClick={() => onChange(field, captured ? '' : `captured_${Date.now()}`)}
      className={cn(
        'w-full py-4 rounded-[16px] border border-dashed flex items-center justify-center gap-2 text-sm font-medium cursor-pointer transition-all',
        captured
          ? 'bg-success/10 border-success/40 text-success'
          : 'bg-bg-input border-border text-text-secondary hover:border-accent',
      )}
    >
      <MaterialIcon name="photo_camera" size={18} />
      {captured ? `${label} captured` : label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Step Components
// ---------------------------------------------------------------------------

function Step0_AuditInfo({ data, onChange }: { data: FormData; onChange: (k: string, v: unknown) => void }) {
  const set = (k: string, v: string) => onChange(k, v);
  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Audit Information</h2>
      <p className="text-sm text-text-tertiary mb-7">Taarifa za Ukaguzi</p>
      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
        <div><FieldLabel label="Auditor Name / Jina la Mkaguzi" required /><TextInput field="enumerator_name" value={(data.enumerator_name as string) || ''} onChange={set} placeholder="Your full name" /></div>
        <div><FieldLabel label="GPS Location / Mahali" required /><PhotoCapture field="gps_location" label="Capture GPS" data={data} onChange={onChange} /></div>
        <div><FieldLabel label="District / Wilaya" required /><SelectOne field="district" value={(data.district as string) || ''} choices={DISTRICTS} onChange={set} /></div>
        <div><FieldLabel label="Ward / Kata" /><TextInput field="ward" value={(data.ward as string) || ''} onChange={set} placeholder="Ward name" /></div>
        <div><FieldLabel label="Street/Area / Mtaa" /><TextInput field="street_area" value={(data.street_area as string) || ''} onChange={set} placeholder="Specific location name" icon={<MaterialIcon name="location_on" size={18} />} /></div>
      </div>
    </div>
  );
}

function Step1_Stakeholder({ data, onChange }: { data: FormData; onChange: (k: string, v: unknown) => void }) {
  const set = (k: string, v: string) => onChange(k, v);
  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Stakeholder Details</h2>
      <p className="text-sm text-text-tertiary mb-7">Maelezo ya Mdau</p>
      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
        <div><FieldLabel label="Stakeholder Type / Aina ya Mdau" required /><SelectOne field="stakeholder_type" value={(data.stakeholder_type as string) || ''} choices={STAKEHOLDER_TYPES} onChange={set} /></div>
        <div><FieldLabel label="Business Name / Jina la Biashara" required /><TextInput field="business_name" value={(data.business_name as string) || ''} onChange={set} placeholder="Enter business name" icon={<MaterialIcon name="business" size={18} />} /></div>
        <div><FieldLabel label="Owner/Manager Name / Jina la Mmiliki" required /><TextInput field="owner_name" value={(data.owner_name as string) || ''} onChange={set} placeholder="Full name" /></div>
        <div><FieldLabel label="Primary Phone / Simu 1" required /><TextInput field="phone_primary" value={(data.phone_primary as string) || ''} onChange={set} placeholder="0712345678" type="tel" /></div>
        <div><FieldLabel label="Secondary Phone / Simu 2" /><TextInput field="phone_secondary" value={(data.phone_secondary as string) || ''} onChange={set} placeholder="Optional" type="tel" /></div>
        <YesNo field="phone_verified" value={(data.phone_verified as string) || ''} onChange={set} label="Phone Verified? / Simu Imethibitishwa?" />
        <div><FieldLabel label="Physical Address / Anwani" required /><TextArea field="physical_address" value={(data.physical_address as string) || ''} onChange={set} placeholder="Building, landmark" /></div>
        <div><FieldLabel label="Operating Hours / Saa za Kazi" /><TextInput field="operating_hours" value={(data.operating_hours as string) || ''} onChange={set} placeholder="e.g., 8am-6pm Mon-Sat" /></div>
        <div><FieldLabel label="Photo of Premises / Picha ya Mahali" required /><PhotoCapture field="photo_premises" label="Capture Photo" data={data} onChange={onChange} /></div>
      </div>
    </div>
  );
}

function Step2_Activities({ data, onChange }: { data: FormData; onChange: (k: string, v: unknown) => void }) {
  const set = (k: string, v: unknown) => onChange(k, v);
  const sellsInputs = data.sells_inputs === 'yes';
  const buysCommodities = data.buys_commodities === 'yes';
  const providesTransport = data.provides_transport === 'yes';
  const providesServices = data.provides_services === 'yes';

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Business Activities</h2>
      <p className="text-sm text-text-tertiary mb-7">Shughuli za Biashara</p>
      <div className="flex flex-col gap-6">
        <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
          <YesNo field="sells_inputs" value={(data.sells_inputs as string) || ''} onChange={(k, v) => set(k, v)} label="Sells Agricultural Inputs? / Anauza Pembejeo?" />
          {sellsInputs && (
            <>
              <div><FieldLabel label="Input Categories Sold / Aina za Pembejeo" required /><SelectMultiple field="input_categories" value={(data.input_categories as string[]) || []} choices={INPUT_CATEGORIES} onChange={(k, v) => set(k, v)} /></div>
              <div><FieldLabel label="Key Brands / Chapa Kuu" /><TextInput field="key_brands" value={(data.key_brands as string) || ''} onChange={(k, v) => set(k, v)} placeholder="e.g., Yara, Syngenta, Pannar" /></div>
            </>
          )}
        </div>

        <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
          <YesNo field="buys_commodities" value={(data.buys_commodities as string) || ''} onChange={(k, v) => set(k, v)} label="Buys Agricultural Commodities? / Ananunua Mazao?" />
          {buysCommodities && (
            <>
              <div><FieldLabel label="Commodities Bought / Mazao Yanayonunuliwa" required /><SelectMultiple field="commodities_bought" value={(data.commodities_bought as string[]) || []} choices={COMMODITIES} onChange={(k, v) => set(k, v)} /></div>
              <div><FieldLabel label="Typical Volume / Kiasi" /><SelectOne field="typical_volume" value={(data.typical_volume as string) || ''} choices={VOLUME_CATEGORIES} onChange={(k, v) => set(k, v)} /></div>
              <div><FieldLabel label="Payment Terms / Malipo" /><SelectMultiple field="payment_terms" value={(data.payment_terms as string[]) || []} choices={PAYMENT_TERMS} onChange={(k, v) => set(k, v)} /></div>
            </>
          )}
        </div>

        <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
          <YesNo field="provides_transport" value={(data.provides_transport as string) || ''} onChange={(k, v) => set(k, v)} label="Provides Transport? / Anatoa Usafiri?" />
          {providesTransport && (
            <>
              <div><FieldLabel label="Vehicle Types / Magari" required /><SelectMultiple field="vehicle_types" value={(data.vehicle_types as string[]) || []} choices={VEHICLE_TYPES} onChange={(k, v) => set(k, v)} /></div>
              <div><FieldLabel label="Max Capacity (tons) / Uwezo" /><NumberInput field="max_capacity_tons" value={(data.max_capacity_tons as string) || ''} onChange={(k, v) => set(k, v)} placeholder="0" suffix="tons" /></div>
              <div><FieldLabel label="Routes / Njia" /><TextInput field="routes_served" value={(data.routes_served as string) || ''} onChange={(k, v) => set(k, v)} placeholder="e.g., Morogoro-Dar" /></div>
              <div><FieldLabel label="Rate to Dar (TZS/ton)" /><NumberInput field="rate_to_dar" value={(data.rate_to_dar as string) || ''} onChange={(k, v) => set(k, v)} placeholder="0" suffix="TZS/ton" /></div>
            </>
          )}
        </div>

        <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
          <YesNo field="provides_services" value={(data.provides_services as string) || ''} onChange={(k, v) => set(k, v)} label="Provides Other Services? / Huduma Nyingine?" />
          {providesServices && (
            <>
              <div><FieldLabel label="Services Offered / Huduma" required /><SelectMultiple field="service_types" value={(data.service_types as string[]) || []} choices={SERVICE_TYPES} onChange={(k, v) => set(k, v)} /></div>
              <div><FieldLabel label="Service Details / Maelezo" /><TextArea field="service_details" value={(data.service_details as string) || ''} onChange={(k, v) => set(k, v)} placeholder="Additional details" /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Step3_InputStock({ data, onChange }: { data: FormData; onChange: (k: string, v: unknown) => void }) {
  const cats = (data.input_categories as string[]) || [];
  const hasFert = cats.includes('fertilizer');
  const hasSeeds = cats.includes('seeds');
  const hasChem = cats.includes('pesticides') || cats.includes('herbicides');

  if (data.sells_inputs !== 'yes') {
    return (
      <div>
        <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Input Stock & Prices</h2>
        <p className="text-sm text-text-tertiary mb-7">Stoku na Bei za Pembejeo</p>
        <div className="nuru-glass-card rounded-[32px] p-8 text-center">
          <MaterialIcon name="inventory_2" size={40} className="mx-auto text-text-tertiary mb-3 opacity-50" />
          <p className="text-text-secondary text-sm">This business does not sell inputs.</p>
          <p className="text-text-tertiary text-xs mt-1">Tap Next to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Input Stock & Prices</h2>
      <p className="text-sm text-text-tertiary mb-7">Stoku na Bei za Pembejeo</p>
      <SectionNote>Record current stock levels and prices for available products.</SectionNote>
      <div className="flex flex-col gap-5">
        {hasFert && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold font-heading text-accent">Fertilizer / Mbolea</h3>
            <StockPriceRow stockField="dap_stock" priceField="dap_price_50kg" label="DAP" priceSuffix="TZS/50kg" data={data} onChange={onChange} />
            <StockPriceRow stockField="urea_stock" priceField="urea_price_50kg" label="Urea" priceSuffix="TZS/50kg" data={data} onChange={onChange} />
            <StockPriceRow stockField="npk_stock" priceField="npk_price_50kg" label="NPK" priceSuffix="TZS/50kg" data={data} onChange={onChange} />
            <StockPriceRow stockField="can_stock" priceField="can_price_50kg" label="CAN" priceSuffix="TZS/50kg" data={data} onChange={onChange} />
          </div>
        )}
        {hasSeeds && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold font-heading text-accent">Seeds / Mbegu</h3>
            <StockPriceRow stockField="maize_seed_stock" priceField="maize_seed_price_2kg" label="Maize Seed" priceSuffix="TZS/2kg" data={data} onChange={onChange} />
            {(data.maize_seed_stock as string) && (data.maize_seed_stock as string) !== 'out_of_stock' && (
              <div className="ml-4"><FieldLabel label="Maize Varieties Available" /><TextInput field="maize_seed_varieties" value={(data.maize_seed_varieties as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="e.g., SC403, DK, Pannar" /></div>
            )}
            <StockPriceRow stockField="rice_seed_stock" priceField="rice_seed_price_kg" label="Rice Seed" priceSuffix="TZS/kg" data={data} onChange={onChange} />
            <StockPriceRow stockField="vegetable_seed_stock" priceField="vegetable_seed_types" label="Vegetable Seeds" priceSuffix="" data={data} onChange={onChange} />
          </div>
        )}
        {hasChem && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold font-heading text-accent">Chemicals / Dawa</h3>
            <StockPriceRow stockField="pesticide_general_stock" priceField="pesticide_brands" label="Pesticides" priceSuffix="" data={data} onChange={onChange} />
            <StockPriceRow stockField="herbicide_general_stock" priceField="herbicide_brands" label="Herbicides" priceSuffix="" data={data} onChange={onChange} />
            <YesNo field="has_fall_armyworm_products" value={(data.has_fall_armyworm_products as string) || ''} onChange={(k, v) => onChange(k, v)} label="Fall Armyworm Products? / Dawa za Viwavi?" />
            {data.has_fall_armyworm_products === 'yes' && (
              <div><FieldLabel label="FAW Products Available" /><TextInput field="faw_products" value={(data.faw_products as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="List products" /></div>
            )}
          </div>
        )}
        <PhotoCapture field="photo_products" label="Photo of Products / Picha ya Bidhaa" data={data} onChange={onChange} />
        <div><FieldLabel label="Stock Notes / Maelezo ya Stoku" /><TextArea field="input_stock_notes" value={(data.input_stock_notes as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="Shortages, expected deliveries, etc." /></div>
      </div>
    </div>
  );
}

function Step4_BuyingPrices({ data, onChange }: { data: FormData; onChange: (k: string, v: unknown) => void }) {
  const comms = (data.commodities_bought as string[]) || [];

  if (data.buys_commodities !== 'yes') {
    return (
      <div>
        <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Buying Prices</h2>
        <p className="text-sm text-text-tertiary mb-7">Bei za Ununuzi wa Mazao</p>
        <div className="nuru-glass-card rounded-[32px] p-8 text-center">
          <MaterialIcon name="shopping_cart" size={40} className="mx-auto text-text-tertiary mb-3 opacity-50" />
          <p className="text-text-secondary text-sm">This business does not buy commodities.</p>
          <p className="text-text-tertiary text-xs mt-1">Tap Next to continue.</p>
        </div>
      </div>
    );
  }

  const grains = [
    { key: 'maize_buying_price', label: 'Maize / Mahindi', comm: 'maize' },
    { key: 'rice_paddy_buying_price', label: 'Rice Paddy / Mpunga', comm: 'rice' },
    { key: 'rice_milled_buying_price', label: 'Milled Rice / Mchele', comm: 'rice' },
    { key: 'beans_buying_price', label: 'Beans / Maharage', comm: 'beans' },
    { key: 'sorghum_buying_price', label: 'Sorghum / Mtama', comm: 'sorghum' },
  ].filter(g => comms.includes(g.comm));

  const oilseeds = [
    { key: 'sunflower_buying_price', label: 'Sunflower / Alizeti', comm: 'sunflower' },
    { key: 'sesame_buying_price', label: 'Sesame / Ufuta', comm: 'sesame' },
    { key: 'groundnut_buying_price', label: 'Groundnuts / Karanga', comm: 'groundnuts' },
  ].filter(g => comms.includes(g.comm));

  const others = [
    { key: 'cassava_buying_price', label: 'Cassava / Muhogo', comm: 'cassava' },
    { key: 'cashew_buying_price', label: 'Cashew / Korosho', comm: 'cashew' },
  ].filter(g => comms.includes(g.comm));

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Buying Prices</h2>
      <p className="text-sm text-text-tertiary mb-7">Bei za Ununuzi wa Mazao</p>
      <SectionNote>Record current buying prices offered to farmers (TZS per kg).</SectionNote>
      <div className="flex flex-col gap-6">
        {grains.length > 0 && (
          <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold font-heading text-accent">Grains / Nafaka</h3>
            {grains.map(g => (
              <div key={g.key}><FieldLabel label={g.label} /><NumberInput field={g.key} value={(data[g.key] as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="0" suffix="TZS/kg" /></div>
            ))}
          </div>
        )}
        {oilseeds.length > 0 && (
          <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold font-heading text-accent">Oilseeds / Mbegu za Mafuta</h3>
            {oilseeds.map(g => (
              <div key={g.key}><FieldLabel label={g.label} /><NumberInput field={g.key} value={(data[g.key] as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="0" suffix="TZS/kg" /></div>
            ))}
          </div>
        )}
        {others.length > 0 && (
          <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold font-heading text-accent">Other Crops / Mazao Mengine</h3>
            {others.map(g => (
              <div key={g.key}><FieldLabel label={g.label} /><NumberInput field={g.key} value={(data[g.key] as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="0" suffix="TZS/kg" /></div>
            ))}
          </div>
        )}
        <div><FieldLabel label="Price Notes / Maelezo ya Bei" /><TextArea field="buying_price_notes" value={(data.buying_price_notes as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="Quality requirements, volume discounts, etc." /></div>
      </div>
    </div>
  );
}

function Step5_MarketPrices({ data, onChange }: { data: FormData; onChange: (k: string, v: unknown) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Market Prices Observed</h2>
      <p className="text-sm text-text-tertiary mb-7">Bei za Soko Zilizoonekana</p>
      <SectionNote>Record retail/wholesale prices you observe in the area (TZS/kg unless noted).</SectionNote>
      <div className="flex flex-col gap-6">
        <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold font-heading text-accent">Grain Prices / Bei za Nafaka</h3>
          {([
            ['maize_market_retail', 'Maize Retail / Mahindi Rejareja'],
            ['maize_market_wholesale', 'Maize Wholesale / Mahindi Jumla'],
            ['rice_market_retail', 'Rice Retail / Mchele Rejareja'],
            ['rice_market_wholesale', 'Rice Wholesale / Mchele Jumla'],
            ['beans_market_retail', 'Beans Retail / Maharage Rejareja'],
            ['beans_market_wholesale', 'Beans Wholesale / Maharage Jumla'],
          ] as const).map(([k, l]) => (
            <div key={k}><FieldLabel label={l} /><NumberInput field={k} value={(data[k] as string) || ''} onChange={(fk, v) => onChange(fk, v)} placeholder="0" suffix="TZS/kg" /></div>
          ))}
        </div>
        <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold font-heading text-accent">Vegetable Prices / Bei za Mboga</h3>
          {([
            ['tomatoes_price', 'Tomatoes / Nyanya (TZS/kg)'],
            ['onions_price', 'Onions / Vitunguu (TZS/kg)'],
            ['cabbage_price', 'Cabbage / Kabichi (TZS/head)'],
            ['sukuma_price', 'Sukuma Wiki (TZS/bunch)'],
          ] as const).map(([k, l]) => (
            <div key={k}><FieldLabel label={l} /><NumberInput field={k} value={(data[k] as string) || ''} onChange={(fk, v) => onChange(fk, v)} placeholder="0" suffix="TZS" /></div>
          ))}
        </div>
        <div><FieldLabel label="Market Activity Level / Hali ya Soko" /><SelectOne field="market_activity" value={(data.market_activity as string) || ''} choices={MARKET_ACTIVITY} onChange={(k, v) => onChange(k, v)} /></div>
        <div><FieldLabel label="Market Notes / Maelezo ya Soko" /><TextArea field="market_notes" value={(data.market_notes as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="Supply situation, price trends, shortages" /></div>
      </div>
    </div>
  );
}

function Step6_ProductAudit({ data, onChange }: { data: FormData; onChange: (k: string, v: unknown) => void }) {
  const doAudit = data.do_product_audit === 'yes';

  function ProductForm({ prefix, label }: { prefix: string; label: string }) {
    return (
      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-4">
        <h3 className="text-sm font-semibold font-heading text-white">{label}</h3>
        <div><FieldLabel label="Category / Aina" required /><SelectOne field={`${prefix}_category`} value={(data[`${prefix}_category`] as string) || ''} choices={PRODUCT_CATEGORIES} onChange={(k, v) => onChange(k, v)} /></div>
        <div><FieldLabel label="Product Name / Jina" required /><TextInput field={`${prefix}_name`} value={(data[`${prefix}_name`] as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="Full name as on package" /></div>
        <div><FieldLabel label="Brand / Chapa" /><TextInput field={`${prefix}_brand`} value={(data[`${prefix}_brand`] as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="Brand name" /></div>
        <div><FieldLabel label="Unit Size / Ukubwa" required /><TextInput field={`${prefix}_unit`} value={(data[`${prefix}_unit`] as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="e.g., 50kg, 1L, 500g" /></div>
        <div><FieldLabel label="Price (TZS) / Bei" required /><NumberInput field={`${prefix}_price`} value={(data[`${prefix}_price`] as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="0" suffix="TZS" /></div>
        <div><FieldLabel label="Stock Level / Stoku" required /><SelectOne field={`${prefix}_stock`} value={(data[`${prefix}_stock`] as string) || ''} choices={STOCK_LEVELS} onChange={(k, v) => onChange(k, v)} /></div>
        <div><FieldLabel label="Packaging Condition / Hali" /><SelectOne field={`${prefix}_condition`} value={(data[`${prefix}_condition`] as string) || ''} choices={PRODUCT_CONDITIONS} onChange={(k, v) => onChange(k, v)} /></div>
        <div><FieldLabel label="Has Certification? / Ina Cheti?" /><SelectOne field={`${prefix}_certified`} value={(data[`${prefix}_certified`] as string) || ''} choices={YES_NO_UNCLEAR} onChange={(k, v) => onChange(k, v)} /></div>
        <PhotoCapture field={`${prefix}_photo`} label="Product Photo / Picha" data={data} onChange={onChange} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Detailed Product Audit</h2>
      <p className="text-sm text-text-tertiary mb-7">Ukaguzi wa Bidhaa (Optional)</p>
      <div className="flex flex-col gap-5">
        <YesNo field="do_product_audit" value={(data.do_product_audit as string) || ''} onChange={(k, v) => onChange(k, v)} label="Audit Specific Product? / Kagua Bidhaa Maalum?" />
        {doAudit && (
          <>
            <ProductForm prefix="product" label="Product 1 / Bidhaa ya 1" />
            <YesNo field="audit_another" value={(data.audit_another as string) || ''} onChange={(k, v) => onChange(k, v)} label="Audit Another Product? / Kagua Bidhaa Nyingine?" />
            {data.audit_another === 'yes' && (
              <ProductForm prefix="product_2" label="Product 2 / Bidhaa ya 2" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Step7_FinalNotes({ data, onChange }: { data: FormData; onChange: (k: string, v: unknown) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-light font-heading tracking-tight text-white mb-1">Final Notes</h2>
      <p className="text-sm text-text-tertiary mb-7">Maelezo ya Mwisho</p>
      <div className="nuru-glass-card rounded-[32px] p-6 flex flex-col gap-5">
        <div><FieldLabel label="Challenges Mentioned / Changamoto" /><SelectMultiple field="challenges_reported" value={(data.challenges_reported as string[]) || []} choices={CHALLENGES} onChange={(k, v) => onChange(k, v)} /></div>
        <div><FieldLabel label="Challenge Details / Maelezo" /><TextArea field="challenge_details" value={(data.challenge_details as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="Describe specific issues" /></div>
        <div><FieldLabel label="Opportunities Noted / Fursa" /><TextArea field="opportunities" value={(data.opportunities as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="Business opportunities, unmet needs" /></div>
        <div><FieldLabel label="General Notes / Maelezo Mengine" /><TextArea field="general_notes" value={(data.general_notes as string) || ''} onChange={(k, v) => onChange(k, v)} placeholder="Any other observations" /></div>
        <div><FieldLabel label="Data Confidence / Uhakika wa Data" required /><SelectOne field="data_confidence" value={(data.data_confidence as string) || ''} choices={DATA_QUALITY} onChange={(k, v) => onChange(k, v)} /></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wizard Shell
// ---------------------------------------------------------------------------

const STEP_ICON_NAMES = [
  'location_on', 'business', 'shopping_cart', 'inventory_2', 'trending_up',
  'bar_chart', 'assignment_turned_in', 'description',
] as const;

const BusinessWizard: React.FC<BusinessWizardProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { currentStep, setStep, currentDraft, saveDraft, resetDraft } = useAuditStore();

  const [formData, setFormData] = useState<FormData>(() => ({ ...(currentDraft ?? {}) }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('nuru_audit_dirty', 'true');
    return () => { sessionStorage.removeItem('nuru_audit_dirty'); };
  }, []);

  const handleChange = useCallback((key: string, value: unknown) => {
    setFormData(prev => {
      const next = { ...prev, [key]: value };
      saveDraft(next as Record<string, unknown>);
      return next;
    });
    if (Object.keys(errors).length > 0) setErrors({});
  }, [errors, saveDraft]);

  const validateCurrentStep = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (currentStep === 0) {
      if (!formData.enumerator_name) errs.enumerator_name = 'Auditor name is required';
      if (!formData.district) errs.district = 'District is required';
    }
    if (currentStep === 1) {
      if (!formData.stakeholder_type) errs.stakeholder_type = 'Stakeholder type is required';
      if (!formData.business_name) errs.business_name = 'Business name is required';
      if (!formData.owner_name) errs.owner_name = 'Owner name is required';
      if (!formData.phone_primary) errs.phone_primary = 'Primary phone is required';
      if (!formData.physical_address) errs.physical_address = 'Physical address is required';
    }
    if (currentStep === 7) {
      if (!formData.data_confidence) errs.data_confidence = 'Data confidence is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [currentStep, formData]);

  const completedSteps = Array.from({ length: currentStep }, (_, i) => i + 1);

  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) return;
    setErrors({});
    saveDraft(formData as Record<string, unknown>);
    if (currentStep < BUSINESS_TOTAL_STEPS - 1) {
      setStep(currentStep + 1);
    }
  }, [currentStep, formData, saveDraft, setStep, validateCurrentStep]);

  const handleBack = useCallback(() => {
    setErrors({});
    if (currentStep > 0) {
      setStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  }, [currentStep, setStep, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    try {
      await onComplete?.({ ...formData, _audit_type: 'business' });
      resetDraft();
    } catch {
      // handled by wrapper
    } finally {
      setSubmitting(false);
    }
  }, [formData, onComplete, resetDraft, validateCurrentStep]);

  const handleSaveDraft = useCallback(() => {
    saveDraft(formData as Record<string, unknown>);
  }, [formData, saveDraft]);

  const isLastStep = currentStep === BUSINESS_TOTAL_STEPS - 1;

  const renderStep = () => {
    const props = { data: formData, onChange: handleChange, errors };
    switch (currentStep) {
      case 0: return <Step0_AuditInfo {...props} />;
      case 1: return <Step1_Stakeholder {...props} />;
      case 2: return <Step2_Activities {...props} />;
      case 3: return <Step3_InputStock {...props} />;
      case 4: return <Step4_BuyingPrices {...props} />;
      case 5: return <Step5_MarketPrices {...props} />;
      case 6: return <Step6_ProductAudit {...props} />;
      case 7: return <Step7_FinalNotes {...props} />;
      default: return null;
    }
  };

  const stepIconName = STEP_ICON_NAMES[currentStep] ?? 'description';

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col font-base">
      <div className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-border-light px-4 pt-4 pb-2">
        <div className="max-w-[800px] mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <MaterialIcon name={stepIconName} size={20} className="text-accent" />
              <div>
                <h1 className="text-lg font-semibold text-white font-heading tracking-tight">
                  Business Audit
                </h1>
                <p className="text-xs text-text-tertiary">
                  Step {currentStep + 1} of {BUSINESS_TOTAL_STEPS} — {BUSINESS_STEP_LABELS[currentStep]}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 py-2 px-3 bg-border-glass border border-border rounded-full text-xs text-text-secondary font-medium cursor-pointer font-inherit"
            >
              <MaterialIcon name="save" size={14} />
              Save Draft
            </button>
          </div>

          <AuditStepIndicator
            totalSteps={BUSINESS_TOTAL_STEPS}
            currentStep={currentStep + 1}
            completedSteps={completedSteps}
            stepLabels={BUSINESS_STEP_LABELS}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-6 pb-[140px] max-w-[800px] mx-auto w-full">
        {renderStep()}
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="fixed bottom-[90px] left-4 right-4 max-w-[800px] mx-auto z-40">
          <div className="flex items-center gap-2 py-2.5 px-4 bg-error/15 border border-error/30 rounded-[12px] backdrop-blur-sm">
            <MaterialIcon name="warning" size={16} className="text-error shrink-0" />
            <p className="text-xs text-error-light truncate">
              Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before continuing
            </p>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        <div className="max-w-[800px] mx-auto px-4 pb-6 pt-8 flex items-center justify-between bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent pointer-events-auto">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 py-3 px-4 text-text-secondary text-sm font-semibold bg-transparent border-none cursor-pointer font-inherit"
          >
            <MaterialIcon name="chevron_left" size={18} />
            {currentStep === 0 ? 'Exit' : 'Back'}
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={cn(
                'h-[52px] px-8 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 cursor-pointer font-inherit transition-all border-none',
                submitting
                  ? 'bg-accent/50 text-black/50 cursor-wait'
                  : 'bg-accent text-black shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:scale-[1.02] active:scale-[0.98]',
              )}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <>
                  <MaterialIcon name="send" size={16} />
                  Submit Audit
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="h-[52px] px-8 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 cursor-pointer font-inherit transition-all border-none bg-accent text-black shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Next
              <MaterialIcon name="chevron_right" size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessWizard;
