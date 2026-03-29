import React, { useState } from 'react';
import { AuditRecord } from '../types';
import { AdminMap } from './AdminMap';
import { ChevronRight, Search, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { checkAuditQuality } from '../services/qualityService';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
    audits: AuditRecord[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ audits }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    const filtered = audits.filter(a => a.businessName.toLowerCase().includes(filter.toLowerCase()));
    const selectedAudit = audits.find(a => a.id === selectedId);

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#121212', overflow: 'hidden' }}>
            {/* Sidebar List */}
            <div style={{
                width: '384px',
                background: '#171717',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', padding: '8px', color: '#9CA3AF', cursor: 'pointer' }}
                        >
                            <ArrowLeft style={{ width: 20, height: 20 }} />
                        </button>
                        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: 'white', margin: 0 }}>Admin Console</h2>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '12px', width: 16, height: 16, color: '#6B7280' }} />
                        <input
                            style={{
                                width: '100%',
                                paddingLeft: '40px',
                                paddingRight: '16px',
                                paddingTop: '10px',
                                paddingBottom: '10px',
                                background: '#252525',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '14px',
                                fontFamily: "'Manrope', sans-serif",
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Search audits..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filtered.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                            No audits found
                        </div>
                    )}
                    {filtered.map(audit => (
                        <button
                            key={audit.id}
                            onClick={() => setSelectedId(audit.id)}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                background: selectedId === audit.id ? 'rgba(240, 81, 62, 0.08)' : 'transparent',
                                borderLeft: selectedId === audit.id ? '3px solid #F0513E' : '3px solid transparent',
                                cursor: 'pointer',
                                border: 'none',
                                borderBottomStyle: 'solid' as const,
                                borderBottomWidth: '1px',
                                borderBottomColor: 'rgba(255,255,255,0.04)',
                                borderLeftStyle: 'solid' as const,
                                borderLeftWidth: '3px',
                                borderLeftColor: selectedId === audit.id ? '#F0513E' : 'transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontWeight: 700, color: 'white', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{audit.businessName}</span>
                                <span style={{
                                    fontSize: '10px',
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase' as const,
                                    background: audit.status === 'synced' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                    color: audit.status === 'synced' ? '#22C55E' : '#F59E0B'
                                }}>
                                    {audit.status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>{new Date(audit.createdAt).toLocaleDateString()}</span>
                                <ChevronRight style={{ width: 16, height: 16, color: '#4B5563' }} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                {selectedAudit ? (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        <div style={{
                            maxWidth: '56rem',
                            margin: '0 auto',
                            background: '#1E1E1E',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(255,255,255,0.02)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', fontFamily: "'Sora', sans-serif", margin: 0 }}>{selectedAudit.businessName}</h1>
                                    <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>ID: {selectedAudit.id}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {checkAuditQuality(selectedAudit).length > 0 ? (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)',
                                            padding: '6px 12px', borderRadius: '999px', fontSize: '12px',
                                            fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.2)'
                                        }}>
                                            <AlertTriangle style={{ width: 16, height: 16 }} />
                                            Flags Detected
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            color: '#22C55E', background: 'rgba(34, 197, 94, 0.1)',
                                            padding: '6px 12px', borderRadius: '999px', fontSize: '12px',
                                            fontWeight: 700, border: '1px solid rgba(34, 197, 94, 0.2)'
                                        }}>
                                            <CheckCircle style={{ width: 16, height: 16 }} />
                                            Quality Pass
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 700, color: '#9CA3AF', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Location & Meta</h4>
                                        {selectedAudit.type === 'farm' && selectedAudit.farmData ? (
                                            <>
                                                <p style={{ fontSize: '14px', color: '#D1D5DB', marginBottom: '4px' }}><span style={{ color: '#6B7280' }}>Region:</span> {selectedAudit.farmData.region}</p>
                                                <p style={{ fontSize: '14px', color: '#D1D5DB', marginBottom: '4px' }}><span style={{ color: '#6B7280' }}>District:</span> {selectedAudit.farmData.district}</p>
                                                <p style={{ fontSize: '14px', color: '#D1D5DB', marginBottom: '4px' }}><span style={{ color: '#6B7280' }}>Auditor:</span> {selectedAudit.farmData.auditorId}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p style={{ fontSize: '14px', color: '#D1D5DB', marginBottom: '4px' }}><span style={{ color: '#6B7280' }}>Region:</span> {selectedAudit.businessData?.region}</p>
                                                <p style={{ fontSize: '14px', color: '#D1D5DB', marginBottom: '4px' }}><span style={{ color: '#6B7280' }}>Type:</span> {selectedAudit.businessData?.businessType}</p>
                                            </>
                                        )}
                                        <p style={{ fontSize: '14px', color: '#D1D5DB' }}><span style={{ color: '#6B7280' }}>GPS:</span> {selectedAudit.location?.latitude.toFixed(5)}, {selectedAudit.location?.longitude.toFixed(5)}</p>
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 700, color: '#9CA3AF', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Details</h4>
                                        {selectedAudit.type === 'farm' && selectedAudit.farmData?.crops.map((c, i) => (
                                            <p key={i} style={{ fontSize: '14px', color: '#D1D5DB', marginBottom: '4px' }}>{c.type}: {c.yieldLast} {c.yieldUnit} ({c.area} Acres)</p>
                                        ))}
                                        {selectedAudit.type === 'business' && (
                                            <p style={{ fontSize: '14px', color: '#D1D5DB' }}>{selectedAudit.notes}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Final Notes Section */}
                                {selectedAudit.type === 'farm' && selectedAudit.farmData?.finalNotes && (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <h4 style={{ fontWeight: 700, color: '#9CA3AF', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Auditor Final Notes</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <p style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' as const, fontWeight: 700 }}>Data Quality</p>
                                                <span style={{
                                                    display: 'inline-block', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, marginTop: '4px',
                                                    background: selectedAudit.farmData.finalNotes.dataQuality === 'EXCELLENT' ? 'rgba(34, 197, 94, 0.12)' :
                                                        selectedAudit.farmData.finalNotes.dataQuality === 'GOOD' ? 'rgba(59, 130, 246, 0.12)' :
                                                            selectedAudit.farmData.finalNotes.dataQuality === 'POOR' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                                    color: selectedAudit.farmData.finalNotes.dataQuality === 'EXCELLENT' ? '#22C55E' :
                                                        selectedAudit.farmData.finalNotes.dataQuality === 'GOOD' ? '#3B82F6' :
                                                            selectedAudit.farmData.finalNotes.dataQuality === 'POOR' ? '#EF4444' : '#F59E0B'
                                                }}>
                                                    {selectedAudit.farmData.finalNotes.dataQuality}
                                                </span>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' as const, fontWeight: 700 }}>Duration</p>
                                                <p style={{ fontFamily: 'monospace', fontSize: '14px', color: '#D1D5DB', marginTop: '4px' }}>{selectedAudit.farmData.finalNotes.duration} minutes</p>
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <p style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' as const, fontWeight: 700 }}>Observations</p>
                                                <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px', fontStyle: 'italic' }}>
                                                    "{selectedAudit.farmData.finalNotes.observations || 'No additional notes.'}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 style={{ fontWeight: 700, color: '#9CA3AF', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '8px' }}>Captured Images</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {selectedAudit.images.map((img) => (
                                            <div key={img.id} style={{ position: 'relative' }}>
                                                <img src={img.dataUrl || img.storageUrl} style={{ width: '100%', height: '128px', objectFit: 'cover' as const, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }} />
                                                <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '6px' }}>{img.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, height: '100%' }}>
                        <AdminMap audits={audits} />
                    </div>
                )}
            </div>
        </div>
    );
};