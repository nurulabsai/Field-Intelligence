import React from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import { cn } from '../../design-system';

interface ConsentGateProps {
  language: 'en' | 'sw';
  onAccept: () => void;
  onDecline?: () => void;
}

const COPY = {
  en: {
    title: 'Data use consent',
    body:
      'This app collects personal and farm data for agricultural monitoring under OR-TAMISEMI / government reporting rules. Data may be stored on this device when offline and synced to a secure server when connected. By continuing, you confirm the farmer has been informed and agrees to this use.',
    accept: 'I understand — continue',
  },
  sw: {
    title: 'Idhini ya matumizi ya data',
    body:
      'Programu hii inakusanya data ya kibinafsi na shamba kwa ufuatiliaji wa kilimo chini ya OR-TAMISEMI / sheria za ripoti za serikali. Data inaweza kuhifadhiwa kwenye kifaa bila mtandao na kusawazishwa kwenye seva salama mtandaoni. Kuendelea kunamaanisha mkulima ameelezwa na anakubali matumizi haya.',
    accept: 'Nimeelewa — endelea',
  },
};

const ConsentGate: React.FC<ConsentGateProps> = ({ language, onAccept, onDecline }) => {
  const t = COPY[language];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary p-6">
      <div
        className={cn(
          'max-w-lg w-full nuru-glass-card rounded-[32px] border border-border-glass p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]',
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center">
            <MaterialIcon name="privacy_tip" size={28} className="text-accent" />
          </div>
          <h1 className="text-xl font-semibold font-heading text-white m-0">{t.title}</h1>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-2">{COPY.en.body}</p>
        <p className="text-sm text-text-tertiary leading-relaxed mb-8 border-t border-border-glass pt-4">
          {COPY.sw.body}
        </p>
        <button
          type="button"
          onClick={onAccept}
          className="w-full py-4 rounded-full bg-accent text-black font-bold text-sm tracking-wide border-none cursor-pointer font-inherit hover:opacity-95"
        >
          {t.accept} / {COPY.sw.accept}
        </button>
        {onDecline && (
          <button
            type="button"
            onClick={onDecline}
            className="w-full mt-3 py-3 text-sm text-text-secondary bg-transparent border-none cursor-pointer font-inherit"
          >
            {language === 'sw' ? 'Ghairi' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ConsentGate;
