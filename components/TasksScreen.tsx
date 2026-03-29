
import React from 'react';
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { AuditRecord, Task } from '../types';
import { saveAuditLocally } from '../services/storageService';
import { Header } from './Header';
import { PullToRefresh } from './PullToRefresh';
import { Language, translations } from '../services/i18n';
import { useNavigate } from 'react-router-dom';

interface TasksScreenProps {
    audits: AuditRecord[];
    onUpdate: () => Promise<void>;
    isTraining: boolean;
    setIsTraining: (val: boolean) => void;
    lang: Language;
    setLang: (val: Language) => void;
    isHighContrast: boolean;
    setIsHighContrast: (val: boolean) => void;
    onLogout: () => void;
    onOpenStats?: () => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
    audits, onUpdate, isTraining, setIsTraining,
    lang, setLang, isHighContrast, setIsHighContrast,
    onLogout, onOpenStats
}) => {
    const navigate = useNavigate();
    const t = translations[lang];

    const allTasks = audits.flatMap(audit => {
        const tasks = (audit.type === 'farm' ? audit.farmData?.tasks : audit.businessData?.tasks) || [];
        return tasks.map(t => ({ ...t, auditName: audit.businessName, auditId: audit.id }));
    });

    const pending = allTasks.filter(t => t.status === 'Pending');
    const resolved = allTasks.filter(t => t.status === 'Resolved');

    const toggleTask = async (task: any) => {
        const audit = audits.find(a => a.id === task.auditId);
        if (!audit) return;
        const newStatus = task.status === 'Pending' ? 'Resolved' : 'Pending';
        if (audit.type === 'farm' && audit.farmData?.tasks) {
            audit.farmData.tasks = audit.farmData.tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
        } else if (audit.type === 'business' && audit.businessData?.tasks) {
            audit.businessData.tasks = audit.businessData.tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
        }
        await saveAuditLocally(audit);
        await onUpdate();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '5rem', background: '#121212' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1rem 2rem',
                background: '#171717',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0
            }}>
                <Header
                    lang={lang} setLang={setLang}
                    isTraining={isTraining} setIsTraining={setIsTraining}
                    isHighContrast={isHighContrast} setIsHighContrast={setIsHighContrast}
                    onLogout={onLogout} onOpenStats={onOpenStats}
                />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', fontFamily: "'Sora', sans-serif", margin: '0.5rem 0 0' }}>Action Items</h2>
                <p style={{ fontSize: '12px', color: '#F0513E', marginTop: '4px' }}>
                    {pending.length} pending tasks across {audits.length} sites
                </p>
            </div>

            <PullToRefresh onRefresh={onUpdate} isHighContrast={isHighContrast}>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Pending Section */}
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#D1D5DB' }}>
                            <AlertCircle style={{ width: 20, height: 20, color: '#F59E0B' }} />
                            Pending ({pending.length})
                        </h3>

                        {pending.length === 0 && (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                color: '#6B7280',
                                background: '#1E1E1E',
                                borderRadius: '16px',
                                border: '1px dashed rgba(255,255,255,0.1)'
                            }}>
                                <CheckCircle2 style={{ width: 48, height: 48, margin: '0 auto 8px', color: 'rgba(34, 197, 94, 0.3)' }} />
                                <p>All caught up! No pending actions.</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pending.map(task => (
                                <div key={task.id} style={{
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    background: '#1E1E1E',
                                    display: 'flex',
                                    gap: '12px'
                                }}>
                                    <button
                                        onClick={() => toggleTask(task)}
                                        style={{
                                            marginTop: '4px',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: '2px solid #4B5563',
                                            background: 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'transparent',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <CheckCircle2 style={{ width: 16, height: 16 }} />
                                    </button>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <p style={{ fontWeight: 700, fontSize: '15px', color: 'white', margin: 0 }}>{task.description}</p>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                padding: '2px 8px',
                                                borderRadius: '999px',
                                                textTransform: 'uppercase' as const,
                                                background: task.priority === 'High' ? 'rgba(239, 68, 68, 0.12)' :
                                                    task.priority === 'Medium' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                                                color: task.priority === 'High' ? '#EF4444' :
                                                    task.priority === 'Medium' ? '#F59E0B' : '#22C55E'
                                            }}>
                                                {task.priority}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px', fontSize: '12px', color: '#6B7280' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock style={{ width: 12, height: 12 }} />
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </span>
                                            <span
                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: '#3B82F6', cursor: 'pointer' }}
                                                onClick={() => navigate(`/audit/${task.auditId}`)}
                                            >
                                                in {task.auditName}
                                                <ArrowRight style={{ width: 12, height: 12 }} />
                                            </span>
                                            <span style={{ fontWeight: 500 }}>@{task.assignee}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resolved Section */}
                    {resolved.length > 0 && (
                        <div style={{ opacity: 0.6 }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280' }}>
                                <CheckCircle2 style={{ width: 20, height: 20, color: '#22C55E' }} />
                                Resolved ({resolved.length})
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {resolved.map(task => (
                                    <div key={task.id} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}>
                                        <button
                                            onClick={() => toggleTask(task)}
                                            style={{
                                                marginTop: '4px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: '2px solid #22C55E',
                                                background: '#22C55E',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                        >
                                            <CheckCircle2 style={{ width: 16, height: 16 }} />
                                        </button>
                                        <div>
                                            <p style={{ fontWeight: 500, color: '#6B7280', textDecoration: 'line-through', margin: 0 }}>{task.description}</p>
                                            <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '4px' }}>
                                                Resolved in {task.auditName}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </PullToRefresh>
        </div>
    );
};
