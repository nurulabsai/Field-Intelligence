import React from 'react';
import { Logo } from './Logo';
import { GraduationCap, Sun, BarChart2, LogOut } from 'lucide-react';
import { Language } from '../services/i18n';

interface HeaderProps {
    lang: Language;
    setLang: (lang: Language) => void;
    isTraining: boolean;
    setIsTraining: (val: boolean) => void;
    isHighContrast: boolean;
    setIsHighContrast: (val: boolean) => void;
    onLogout: () => void;
    onOpenStats?: () => void;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({
    lang, setLang, isTraining, setIsTraining,
    isHighContrast, setIsHighContrast, onLogout, onOpenStats,
    className = ''
}) => {
    const iconBtnStyle = (active: boolean = false): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        border: `1px solid ${active ? 'rgba(240, 81, 62, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
        background: active ? 'rgba(240, 81, 62, 0.12)' : 'rgba(255, 255, 255, 0.04)',
        color: active ? '#F0513E' : '#9CA3AF',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        padding: 0,
        fontSize: '12px',
        fontWeight: 700,
    });

    return (
        <div className={className} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <Logo variant="horizontal" theme="dark" size="sm" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsTraining(!isTraining); }}
                    style={iconBtnStyle(isTraining)}
                    title="Training Mode"
                >
                    <GraduationCap style={{ width: '18px', height: '18px' }} />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsHighContrast(!isHighContrast); }}
                    style={iconBtnStyle(isHighContrast)}
                    title="Sunlight Mode"
                >
                    <Sun style={{ width: '18px', height: '18px' }} />
                </button>
                {onOpenStats && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onOpenStats(); }}
                        style={iconBtnStyle()}
                        title="Reports & Stats"
                    >
                        <BarChart2 style={{ width: '18px', height: '18px' }} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setLang(lang === 'en' ? 'sw' : 'en'); }}
                    style={{
                        ...iconBtnStyle(),
                        fontFamily: "'Manrope', sans-serif",
                    }}
                    title="Language"
                >
                    {lang.toUpperCase()}
                </button>
                <button
                    type="button"
                    onClick={onLogout}
                    style={iconBtnStyle()}
                    title="Log Out"
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.12)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#EF4444';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.04)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    }}
                >
                    <LogOut style={{ width: '18px', height: '18px' }} />
                </button>
            </div>
        </div>
    );
};
