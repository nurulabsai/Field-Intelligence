import React, { useCallback, useMemo, useState } from 'react';
import MaterialIcon from '../MaterialIcon';
import SignaturePad from '../SignaturePad';
import { cn } from '../../design-system';
import {
  ConsentRecord,
  ConsentMethod,
  ConsentLanguage,
  isConsentComplete,
} from '../../lib/consent-types';

interface ConsentSectionProps {
  consent: ConsentRecord;
  onChange: (next: ConsentRecord) => void;
  onComplete?: () => void;
  /** Title shown on the consent summary card after completion */
  subjectLabel?: { en: string; sw: string };
}

const COPY = {
  title: { en: 'Data Collection Consent', sw: 'Idhini ya Kukusanya Takwimu' },
  read_aloud: { en: 'Read consent aloud', sw: 'Soma idhini kwa sauti' },
  full_text_sw: `IDHINI YA KUKUSANYA TAKWIMU

Mimi, [jina la mhusika], nakubali kwa hiari yangu kwamba takwimu zangu zitakusanywa na NuruLabs kwa ajili ya Mfumo wa Taarifa wa OR-TAMISEMI. Ninaelewa kwamba:
- Takwimu zangu zitatumika kwa madhumuni ya mipango ya kilimo na msaada wa serikali.
- Nina haki ya kujiondoa wakati wowote bila adhabu.
- Picha na kuratibu za GPS za shamba/biashara yangu zitarekodiwa.
- Taarifa zangu hazitashirikiwa na kampuni za biashara bila idhini yangu.`,
  full_text_en: `DATA COLLECTION CONSENT

I, [subject name], voluntarily consent to the collection of my data by NuruLabs for the OR-TAMISEMI Information System. I understand that:
- My data will be used for agricultural planning and government support programs.
- I have the right to withdraw at any time without penalty.
- Photos and GPS coordinates of my farm/business will be recorded.
- My information will not be shared with commercial entities without my consent.`,
  identity: { en: 'Subject identity', sw: 'Utambulisho wa mhusika' },
  full_name: { en: 'Full name (as stated)', sw: 'Jina kamili (alivyosema)' },
  national_id: { en: 'National ID (optional)', sw: 'Kitambulisho cha taifa (hiari)' },
  flags_heading: { en: 'Consent confirmations', sw: 'Uthibitisho wa idhini' },
  flag_data: {
    en: 'I agree to my data being collected',
    sw: 'Nakubali takwimu zangu zikusanywe',
  },
  flag_ortamisemi: {
    en: 'I agree to share data with OR-TAMISEMI',
    sw: 'Nakubali kushiriki takwimu na OR-TAMISEMI',
  },
  flag_govt: {
    en: 'I agree to government use of this data',
    sw: 'Nakubali serikali itumie takwimu hizi',
  },
  flag_photo: {
    en: 'I agree to photos being taken',
    sw: 'Nakubali kupigwa picha',
  },
  flag_gps: {
    en: 'I agree to GPS coordinates being recorded',
    sw: 'Nakubali kuratibu za GPS zirekodiwe',
  },
  flag_withdraw: {
    en: 'Right to withdraw was explained to subject',
    sw: 'Mhusika ameelezwa haki ya kujiondoa',
  },
  flag_read_aloud: {
    en: 'Consent text was read aloud to the subject',
    sw: 'Maandishi ya idhini yamesomwa kwa sauti',
  },
  literate: { en: 'Subject can read this form', sw: 'Mhusika anaweza kusoma fomu hii' },
  yes: { en: 'Yes', sw: 'Ndiyo' },
  no: { en: 'No', sw: 'Hapana' },
  method_heading: { en: 'How is consent recorded?', sw: 'Idhini inarekodiwaje?' },
  method_signature: { en: 'Signature', sw: 'Saini' },
  method_thumbprint: { en: 'Thumbprint', sw: 'Alama ya kidole' },
  method_verbal: { en: 'Verbal (witnessed)', sw: 'Maneno (na shahidi)' },
  signature_pad: { en: 'Capture signature / thumbprint', sw: 'Rekodi saini / alama ya kidole' },
  witness_heading: { en: 'Witness', sw: 'Shahidi' },
  witness_name: { en: 'Witness full name', sw: 'Jina la shahidi' },
  witness_phone: { en: 'Witness phone', sw: 'Simu ya shahidi' },
  language_heading: { en: 'Language used during consent', sw: 'Lugha iliyotumika' },
  swahili: { en: 'Swahili', sw: 'Kiswahili' },
  english: { en: 'English', sw: 'Kiingereza' },
  complete_summary: { en: 'Consent captured', sw: 'Idhini imerekodiwa' },
  incomplete: {
    en: 'All confirmations and a signature/thumbprint or witness are required to continue.',
    sw: 'Uthibitisho wote pamoja na saini/alama ya kidole au shahidi vinahitajika kuendelea.',
  },
  continue: { en: 'Continue', sw: 'Endelea' },
};

const FLAG_KEYS: Array<{
  key:
    | 'consent_data_collection'
    | 'consent_data_sharing_ortamisemi'
    | 'consent_data_sharing_government'
    | 'consent_photo_capture'
    | 'consent_gps_location'
    | 'right_to_withdraw_explained'
    | 'consent_read_aloud';
  copy: { en: string; sw: string };
}> = [
  { key: 'consent_data_collection', copy: COPY.flag_data },
  { key: 'consent_data_sharing_ortamisemi', copy: COPY.flag_ortamisemi },
  { key: 'consent_data_sharing_government', copy: COPY.flag_govt },
  { key: 'consent_photo_capture', copy: COPY.flag_photo },
  { key: 'consent_gps_location', copy: COPY.flag_gps },
  { key: 'right_to_withdraw_explained', copy: COPY.flag_withdraw },
  { key: 'consent_read_aloud', copy: COPY.flag_read_aloud },
];

const ConsentSection: React.FC<ConsentSectionProps> = ({
  consent,
  onChange,
  onComplete,
  subjectLabel,
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const complete = useMemo(() => isConsentComplete(consent), [consent]);

  const update = useCallback(
    (patch: Partial<ConsentRecord>) => {
      onChange({ ...consent, ...patch });
    },
    [consent, onChange],
  );

  const setFlag = useCallback(
    (key: (typeof FLAG_KEYS)[number]['key'], value: boolean) => {
      update({ [key]: value } as Partial<ConsentRecord>);
    },
    [update],
  );

  const captureGpsAndStamp = useCallback(() => {
    const stampNow = () => {
      update({ consent_given_at: new Date().toISOString() });
    };
    if (!('geolocation' in navigator)) {
      stampNow();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({
          consent_given_at: new Date().toISOString(),
          consent_location_lat: pos.coords.latitude,
          consent_location_lng: pos.coords.longitude,
        });
      },
      () => stampNow(),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [update]);

  const handleContinue = useCallback(() => {
    if (!complete) return;
    if (!consent.consent_given_at) {
      captureGpsAndStamp();
    }
    onComplete?.();
  }, [complete, consent.consent_given_at, captureGpsAndStamp, onComplete]);

  const inputBase =
    'w-full py-3 px-4 bg-bg-input border border-border rounded-[16px] text-white text-[0.938rem] font-inherit outline-none focus:border-accent';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center flex-shrink-0">
          <MaterialIcon name="privacy_tip" size={24} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold font-heading text-white m-0">
            {COPY.title.en} / {COPY.title.sw}
          </h2>
          {subjectLabel && (
            <p className="text-xs text-text-tertiary mt-1">
              {subjectLabel.en} · {subjectLabel.sw}
            </p>
          )}
        </div>
      </div>

      {/* Read aloud */}
      <button
        type="button"
        onClick={() => setShowFullText((v) => !v)}
        className="w-full flex items-center justify-between py-3 px-4 bg-bg-input border border-border rounded-[16px] text-sm text-white"
      >
        <span className="flex items-center gap-2">
          <MaterialIcon name="record_voice_over" size={18} className="text-accent" />
          {COPY.read_aloud.en} / {COPY.read_aloud.sw}
        </span>
        <MaterialIcon name={showFullText ? 'expand_less' : 'expand_more'} size={18} />
      </button>
      {showFullText && (
        <div className="grid md:grid-cols-2 gap-3">
          <pre className="whitespace-pre-wrap text-[12px] text-text-secondary leading-relaxed bg-bg-input/50 border border-border-glass rounded-[16px] p-4 font-inherit">
            {COPY.full_text_sw}
          </pre>
          <pre className="whitespace-pre-wrap text-[12px] text-text-secondary leading-relaxed bg-bg-input/50 border border-border-glass rounded-[16px] p-4 font-inherit">
            {COPY.full_text_en}
          </pre>
        </div>
      )}

      {/* Identity */}
      <fieldset className="space-y-3">
        <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">
          {COPY.identity.en} / {COPY.identity.sw}
        </legend>
        <div>
          <label className="block text-xs text-text-tertiary mb-1.5">
            {COPY.full_name.en} / {COPY.full_name.sw} *
          </label>
          <input
            type="text"
            value={consent.subject_name_confirmed}
            onChange={(e) => update({ subject_name_confirmed: e.target.value })}
            className={inputBase}
          />
        </div>
        <div>
          <label className="block text-xs text-text-tertiary mb-1.5">
            {COPY.national_id.en} / {COPY.national_id.sw}
          </label>
          <input
            type="text"
            value={consent.subject_id_confirmed ?? ''}
            onChange={(e) => update({ subject_id_confirmed: e.target.value })}
            className={inputBase}
          />
        </div>
      </fieldset>

      {/* Language */}
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">
          {COPY.language_heading.en} / {COPY.language_heading.sw}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(['sw', 'en'] as ConsentLanguage[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => update({ language_of_consent: lang })}
              className={cn(
                'py-3 rounded-[16px] text-sm font-medium border transition-colors',
                consent.language_of_consent === lang
                  ? 'bg-accent text-black border-accent'
                  : 'bg-bg-input text-white border-border',
              )}
            >
              {lang === 'sw' ? COPY.swahili.sw : COPY.english.en}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Literacy */}
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">
          {COPY.literate.en} / {COPY.literate.sw}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => update({ subject_literate: v })}
              className={cn(
                'py-3 rounded-[16px] text-sm font-medium border transition-colors',
                consent.subject_literate === v
                  ? 'bg-accent text-black border-accent'
                  : 'bg-bg-input text-white border-border',
              )}
            >
              {v ? `${COPY.yes.en} / ${COPY.yes.sw}` : `${COPY.no.en} / ${COPY.no.sw}`}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Flags */}
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">
          {COPY.flags_heading.en} / {COPY.flags_heading.sw}
        </legend>
        <div className="space-y-2">
          {FLAG_KEYS.map(({ key, copy }) => {
            const checked = Boolean(consent[key]);
            return (
              <label
                key={key}
                className={cn(
                  'flex items-start gap-3 py-3 px-4 rounded-[16px] border cursor-pointer',
                  checked ? 'bg-accent/10 border-accent' : 'bg-bg-input border-border',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setFlag(key, e.target.checked)}
                  className="mt-1 w-4 h-4 accent-accent"
                />
                <span className="text-sm text-white leading-snug">
                  {copy.en} / <span className="text-text-secondary">{copy.sw}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Method */}
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">
          {COPY.method_heading.en} / {COPY.method_heading.sw}
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['signature', COPY.method_signature],
              ['thumbprint', COPY.method_thumbprint],
              ['verbal_witnessed', COPY.method_verbal],
            ] as Array<[ConsentMethod, { en: string; sw: string }]>
          ).map(([m, copy]) => (
            <button
              key={m}
              type="button"
              onClick={() => update({ consent_method: m })}
              className={cn(
                'py-3 rounded-[16px] text-xs font-medium border transition-colors',
                consent.consent_method === m
                  ? 'bg-accent text-black border-accent'
                  : 'bg-bg-input text-white border-border',
              )}
            >
              {copy.en}
              <br />
              <span className="opacity-70">{copy.sw}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Signature pad (signature or thumbprint) */}
      {(consent.consent_method === 'signature' ||
        consent.consent_method === 'thumbprint') && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">
            {COPY.signature_pad.en} / {COPY.signature_pad.sw}
          </p>
          <SignaturePad
            initialValue={consent.consent_signature_data}
            onSignature={(dataUrl) => update({ consent_signature_data: dataUrl })}
          />
        </div>
      )}

      {/* Witness fields (verbal_witnessed) */}
      {consent.consent_method === 'verbal_witnessed' && (
        <fieldset className="space-y-2">
          <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">
            {COPY.witness_heading.en} / {COPY.witness_heading.sw}
          </legend>
          <input
            type="text"
            placeholder={`${COPY.witness_name.en} / ${COPY.witness_name.sw}`}
            value={consent.witness_name ?? ''}
            onChange={(e) => update({ witness_name: e.target.value })}
            className={inputBase}
          />
          <input
            type="tel"
            placeholder={`${COPY.witness_phone.en} / ${COPY.witness_phone.sw}`}
            value={consent.witness_phone ?? ''}
            onChange={(e) => update({ witness_phone: e.target.value })}
            className={inputBase}
          />
        </fieldset>
      )}

      {/* Status / continue */}
      {complete ? (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success rounded-[16px]">
          <MaterialIcon name="verified" size={20} className="text-success" />
          <div className="text-sm text-white">
            {COPY.complete_summary.en} / {COPY.complete_summary.sw}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning rounded-[16px]">
          <MaterialIcon name="error" size={20} className="text-warning" />
          <div className="text-xs text-warning-light leading-relaxed">
            {COPY.incomplete.en}
            <br />
            {COPY.incomplete.sw}
          </div>
        </div>
      )}

      {onComplete && (
        <button
          type="button"
          disabled={!complete}
          onClick={handleContinue}
          className={cn(
            'w-full py-4 rounded-full text-sm font-bold tracking-wide border-none transition-opacity',
            complete
              ? 'bg-accent text-black cursor-pointer hover:opacity-95'
              : 'bg-bg-input text-text-tertiary cursor-not-allowed',
          )}
        >
          {COPY.continue.en} / {COPY.continue.sw}
        </button>
      )}
    </div>
  );
};

export default ConsentSection;
