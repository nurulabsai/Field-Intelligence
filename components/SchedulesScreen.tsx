import React, { useState, useEffect } from 'react';
import { Search, MapPin, User, FileText } from 'lucide-react';
import { AuditRecord } from '../types';
import { useNavigate } from 'react-router-dom';
import { Language } from '../services/i18n';
import { PullToRefresh } from './PullToRefresh';
import { Header } from './Header';

interface SchedulesScreenProps {
    audits: AuditRecord[];
    mode?: 'schedule' | 'history';
    // Tools
    lang: Language;
    setLang: (lang: Language) => void;
    isTraining: boolean;
    setIsTraining: (val: boolean) => void;
    isHighContrast: boolean;
    setIsHighContrast: (val: boolean) => void;
    onLogout: () => void;
    onOpenStats?: () => void;
    onRefresh: () => Promise<void>;
}

export const SchedulesScreen: React.FC<SchedulesScreenProps> = ({
    audits, mode = 'schedule',
    lang, setLang, isTraining, setIsTraining, isHighContrast, setIsHighContrast,
    onLogout, onOpenStats, onRefresh
}) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'open' | 'in_progress' | 'completed' | 'missed'>('open');

    useEffect(() => {
        if (mode === 'history') {
            setFilter('completed');
        } else {
            setFilter('open');
        }
    }, [mode]);

    // Logic to simulate categories based on existing data
    const getAuditsByStatus = (status: string) => {
        switch (status) {
            case 'open':
                // Simulating "Open" as audits created today but draft, or mock future audits
                return [
                    ...audits.filter(a => a.status === 'draft' && new Date(a.createdAt).getDate() === new Date().getDate()),
                    // Mock data to populate the UI if empty
                    ...(audits.length < 5 && mode === 'schedule' ? [{
                        id: 'mock-1', businessName: 'Electrical Safety',
                        location: { latitude: 0, longitude: 0 },
                        createdAt: new Date().toISOString(),
                        status: 'draft', type: 'farm', images: [], notes: ''
                    } as AuditRecord] : [])
                ];
            case 'in_progress':
                return audits.filter(a => a.status === 'draft' && new Date(a.createdAt) < new Date());
            case 'completed':
                return audits.filter(a => a.status === 'pending' || a.status === 'synced');
            case 'missed':
                return []; // No logic for missed yet
            default:
                return [];
        }
    };

    const currentList = getAuditsByStatus(filter);

    const getStatusColor = (status: string) => {
        if (status === 'open') return 'bg-blue-600';
        if (status === 'in_progress') return 'bg-orange-500';
        if (status === 'completed') return 'bg-green-500';
        return 'bg-red-500';
    };

    const getStatusLabel = (status: string) => {
        if (status === 'open') return 'Open';
        if (status === 'in_progress') return 'In Progress';
        if (status === 'completed') return 'Completed';
        return 'Missed';
    };

    return (
        <div className="flex flex-col h-screen pb-16">
            {/* Header */}
            <div className={`p-4 pt-6 pb-12 shrink-0 ${isHighContrast ? 'bg-black' : 'glass-heavy'}`}>
                <Header
                    lang={lang}
                    setLang={setLang}
                    isTraining={isTraining}
                    setIsTraining={setIsTraining}
                    isHighContrast={isHighContrast}
                    setIsHighContrast={setIsHighContrast}
                    onLogout={onLogout}
                    onOpenStats={onOpenStats}
                    className="mb-4"
                />

                {/* Title Block */}
                <div className="text-white px-2">
                    <h2 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{mode === 'history' ? 'Audit History' : 'My Schedules'}</h2>
                    <p className={`text-sm mt-1 ${isHighContrast ? 'text-yellow-300' : 'text-gray-400'}`}>
                        {mode === 'history' ? 'Past Records' : `Today, ${new Date().toLocaleDateString()}`}
                    </p>
                </div>
            </div>

            {/* Tabs - Overlapping Header */}
            <div className="px-4 -mt-6 z-10 shrink-0">
                <div className={`rounded-xl p-1.5 flex justify-between overflow-x-auto no-scrollbar ${isHighContrast ? 'bg-white border-2 border-black' : 'glass-card border-none'}`}>
                    {[
                        { id: 'open', label: 'Open' },
                        { id: 'in_progress', label: 'In Progress' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'missed', label: 'Missed' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold transition-all ${filter === tab.id
                                    ? (isHighContrast ? 'bg-black text-yellow-300' : 'bg-[#F0513E] text-white shadow-sm')
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label} ({getAuditsByStatus(tab.id).length})
                        </button>
                    ))}
                </div>
            </div>

            {/* List Content */}
            <PullToRefresh onRefresh={onRefresh} isHighContrast={isHighContrast}>
                <div className="p-4 space-y-4">
                    {currentList.map((audit, idx) => (
                        <div
                            key={audit.id}
                            onClick={() => navigate(audit.status === 'draft' || audit.id.startsWith('mock') ? '/new' : `/audit/${audit.id}`)}
                            className={`rounded-2xl p-5 relative overflow-hidden group hover-lift slide-up-fade ${isHighContrast ? 'bg-white border-black' : 'glass-card'}`}
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            {/* Status Badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${getStatusColor(filter)}`}>
                                {getStatusLabel(filter)}
                            </div>

                            {/* Audit Type Tag */}
                            <div className="mb-3">
                                <span className="px-2 py-1 bg-white/10 text-gray-300 text-[10px] font-bold rounded">
                                    {audit.type === 'business' ? 'Business Audit' : 'Farm Audit'}
                                </span>
                            </div>

                            <h3 className="text-white font-bold text-lg mb-1">{audit.businessName || 'Untitled Audit'}</h3>

                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                                <User className="w-3 h-3" />
                                <span>{audit.farmData?.auditorId || 'Unassigned'}</span>
                            </div>

                            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <FileText className="w-3 h-3" />
                                    <span>{new Date(audit.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <MapPin className="w-3 h-3" />
                                    <span>{audit.location ? `${audit.location.latitude.toFixed(4)}, ${audit.location.longitude.toFixed(4)}` : 'No Location'}</span>
                                </div>
                                {/* Mock ID for visuals */}
                                <div className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono">
                                    #{audit.id.substring(0, 6)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {currentList.length === 0 && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">No {filter.replace('_', ' ')} audits found.</p>
                            <button onClick={() => navigate('/new')} className="mt-4 text-teal-600 font-bold text-sm">
                                + Create New
                            </button>
                        </div>
                    )}
                </div>
            </PullToRefresh>
        </div>
    );
};