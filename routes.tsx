
import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Components
import { DashboardScreen } from './components/DashboardScreen';
import { SchedulesScreen } from './components/SchedulesScreen';
import { ScheduleScreen } from './components/ScheduleScreen';
import { TasksScreen } from './components/TasksScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { AuditTypeSelector } from './components/AuditTypeSelector';
import FarmAuditForm from './components/FarmAuditForm';
import BusinessAuditForm from './components/BusinessAuditForm';
import { SiteSafetyCheckScreen } from './components/SiteSafetyCheckScreen';
import { AuditSummaryScreen } from './components/AuditSummaryScreen';
import { PhotoCaptureScreen } from './components/PhotoCaptureScreen';
import { PhotoReviewScreen } from './components/PhotoReviewScreen';
import { SyncStatusScreen } from './components/SyncStatusScreen';
import { ImageAnalysisScreen } from './components/ImageAnalysisScreen';
import { ProjectListScreen, AuditItem } from './components/ProjectListScreen';
import { Home, FileText, Camera, MoreHorizontal, ArrowLeft, ShieldCheck, Bot, ArrowRight } from 'lucide-react';
import { AuditRecord, User } from './types';
import { Language } from './services/i18n';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getAuditById, getPendingSyncs } from './services/storageService';
import { processSyncQueue } from './services/syncService';

// --- Sync Status Wrapper (real data + manual sync) ---
const SyncStatusWrapper = ({
  audits,
  online,
  onRefresh,
  onClose,
}: {
  audits: AuditRecord[];
  online: boolean;
  onRefresh: () => void;
  onClose: () => void;
}) => {
  const [syncing, setSyncing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const syncedCount = audits.filter((a) => a.status === 'synced').length;
  const pendingCount = audits.filter((a) => a.status === 'pending' || a.status === 'failed').length;
  const total = audits.length;
  const syncProgress = total > 0 ? Math.round((syncedCount / total) * 100) : 100;

  const syncedItems = audits.map((a) => ({
    id: a.id,
    title: a.businessName || 'Untitled Audit',
    subtitle:
      a.status === 'synced'
        ? `Synced ${a.updatedAt ? new Date(a.updatedAt).toLocaleTimeString() : ''}`
        : a.status === 'failed'
          ? 'Sync failed - will retry'
          : 'Pending',
    status: (a.status === 'synced' ? 'synced' : a.status === 'pending' || a.status === 'failed' ? 'pending' : 'pending') as 'synced' | 'pending' | 'syncing' | 'error',
  }));

  const handleSyncNow = async () => {
    if (!online || syncing) return;
    setSyncing(true);
    setProgress(0);
    try {
      const { synced, failed } = await processSyncQueue((msg) => setProgress((p) => Math.min(p + 10, 90)));
      setProgress(100);
      await onRefresh();
      if (synced > 0 || failed > 0) {
        setTimeout(() => setSyncing(false), 500);
      }
    } catch (e) {
      setSyncing(false);
    }
  };

  return (
    <div>
      <SyncStatusScreen
        syncProgress={syncing ? progress : syncProgress}
        syncedItems={syncedItems}
        onClose={onClose}
        offlineMode={!online}
      />
      {online && pendingCount > 0 && (
        <div style={{ padding: 16, position: 'fixed', bottom: 80, left: 0, right: 0, background: 'var(--color-bg-secondary)' }}>
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="btn btn-primary btn-block"
            style={{ maxWidth: 400, margin: '0 auto' }}
          >
            {syncing ? 'Syncing...' : `Sync ${pendingCount} Pending`}
          </button>
        </div>
      )}
    </div>
  );
};

// --- Loading Component ---
const Loading = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--color-bg-primary)'
    }}>
        <Loader2 style={{ width: '2rem', height: '2rem', color: '#F0513E' }} className="animate-spin" />
    </div>
);

// --- Bottom Navigation ---
export const BottomNavigation = () => {
    const location = useLocation();
    const current = location.pathname;
    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/projects', label: 'Projects', icon: FileText },
        { path: '/camera', label: 'Camera', icon: Camera },
        { path: '/admin', label: 'Settings', icon: MoreHorizontal },
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#171717',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            zIndex: 40,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: '64px',
                padding: '0 8px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                {navItems.map(item => {
                    const isActive = current === item.path || (item.path === '/' && current.includes('/audit/'));
                    const isCamera = item.label === 'Camera';
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: isCamera ? '56px' : '100%',
                                height: '100%',
                                gap: '4px',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                position: 'relative'
                            }}
                        >
                            {isCamera ? (
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: '#F0513E',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(240, 81, 62, 0.3)',
                                    marginTop: '-12px'
                                }}>
                                    <item.icon style={{ width: '22px', height: '22px', color: 'white' }} />
                                </div>
                            ) : (
                                <>
                                    <item.icon style={{
                                        width: '22px',
                                        height: '22px',
                                        color: isActive ? '#F0513E' : '#6B7280'
                                    }} />
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: 500,
                                        color: isActive ? '#F0513E' : '#6B7280',
                                        fontFamily: "'Manrope', sans-serif"
                                    }}>
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '6px',
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            background: '#F0513E'
                                        }} />
                                    )}
                                </>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

// --- Audit Details ---
const AuditDetailsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [audit, setAudit] = React.useState<AuditRecord | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (id) getAuditById(id).then(a => { setAudit(a); setLoading(false); });
    }, [id]);

    const renderSummaryWithLinks = (text: string) => text.split('\n').map((line, i) => <p key={i} style={{ marginBottom: '4px', fontSize: '14px', color: '#9CA3AF' }}>{line}</p>);

    if (loading) return <Loading />;
    if (!audit) return <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', background: 'var(--color-bg-primary)', minHeight: '100vh' }}>Audit not found</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{
                background: '#171717',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft style={{ width: 24, height: 24 }} />
                </button>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '18px', color: 'white' }}>{audit.businessName}</h1>
            </div>

            <div style={{ padding: '1.5rem', maxWidth: '48rem', margin: '0 auto' }}>
                {/* Safety Check Button */}
                <button
                    onClick={() => navigate('/safety-check')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: 'rgba(240, 81, 62, 0.08)',
                        border: '1px solid rgba(240, 81, 62, 0.2)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        marginBottom: '1.5rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: '#F0513E', borderRadius: '12px', color: 'white' }}>
                            <ShieldCheck style={{ width: 24, height: 24 }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontWeight: 700, color: 'white', fontSize: '15px', margin: 0 }}>Start Site Safety Check</h3>
                            <p style={{ fontSize: '12px', color: '#F0513E', margin: '2px 0 0 0', opacity: 0.7 }}>Pending • Tower Inspection</p>
                        </div>
                    </div>
                    <ArrowRight style={{ width: 20, height: 20, color: 'rgba(240,81,62,0.5)' }} />
                </button>

                {/* Expert Review */}
                {audit.expertReview && (
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.08)',
                        padding: '1.25rem',
                        borderRadius: '20px',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
                            <Bot style={{ width: 24, height: 24, color: '#818CF8' }} />
                            <h3 style={{ fontWeight: 700, color: '#A5B4FC', fontSize: '15px', margin: 0 }}>Agro-Expert Feedback</h3>
                        </div>
                        <p style={{ fontSize: '14px', color: '#C7D2FE', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{audit.expertReview.comment}</p>
                        <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(129, 140, 248, 0.6)', fontWeight: 500 }}>
                            Reviewed by {audit.expertReview.author} on {new Date(audit.expertReview.date).toLocaleDateString()}
                        </div>
                    </div>
                )}

                {/* AI Summary */}
                {audit.aiSummary && (
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        padding: '1rem 1.25rem',
                        borderRadius: '20px',
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                        marginBottom: '1.5rem',
                    }}>
                        <h3 style={{ fontWeight: 700, color: '#93C5FD', marginBottom: '8px', fontSize: '15px' }}>Automated Summary</h3>
                        {renderSummaryWithLinks(audit.aiSummary)}
                    </div>
                )}

                {/* Auditor Notes */}
                {audit.type === 'farm' && audit.farmData?.finalNotes && (
                    <div style={{
                        background: 'var(--color-bg-card)',
                        padding: '1.25rem',
                        borderRadius: '20px',
                        border: '1px solid var(--color-border)',
                        marginBottom: '1.5rem',
                    }}>
                        <h3 style={{ fontWeight: 700, color: '#9CA3AF', marginBottom: '12px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auditor Notes</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '14px' }}>
                            <div>
                                <span style={{ color: '#6B7280', display: 'block', fontSize: '12px' }}>Self-Assessed Quality</span>
                                <span style={{ fontWeight: 700, color: audit.farmData.finalNotes.dataQuality === 'EXCELLENT' ? '#22C55E' : audit.farmData.finalNotes.dataQuality === 'POOR' ? '#EF4444' : 'white' }}>
                                    {audit.farmData.finalNotes.dataQuality}
                                </span>
                            </div>
                            <div>
                                <span style={{ color: '#6B7280', display: 'block', fontSize: '12px' }}>Duration</span>
                                <span style={{ fontWeight: 700, color: 'white' }}>{audit.farmData.finalNotes.duration} mins</span>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ color: '#6B7280', display: 'block', fontSize: '12px' }}>Observations</span>
                                <p style={{ color: '#9CA3AF', fontStyle: 'italic', marginTop: '4px' }}>{audit.farmData.finalNotes.observations || "No observations recorded."}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Images Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {audit.images.map(img => (
                        <div key={img.id} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img src={img.dataUrl || img.storageUrl} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '8px' }}>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: 'white', textAlign: 'center' }}>{img.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- New Audit Flow ---
const NewAuditFlow = ({ user, onSave, lang, isHighContrast, isTraining }: any) => {
    const [type, setType] = React.useState<'farm' | 'business' | null>(null);
    const navigate = useNavigate();
    const CommonProps = {
        user,
        onSave: (audit: AuditRecord) => { onSave(audit); navigate('/'); },
        onCancel: () => navigate('/'),
        initialLocation: null,
        isHighContrast, lang, isTraining
    };
    if (!type) return (
        <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '1.5rem',
                    zIndex: 20,
                    padding: '10px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    color: '#9CA3AF',
                    cursor: 'pointer'
                }}
            >
                <ArrowLeft style={{ width: 24, height: 24 }} />
            </button>
            <AuditTypeSelector onSelectType={setType} />
        </div>
    );
    if (type === 'farm') return <FarmAuditForm {...CommonProps} />;
    return <BusinessAuditForm {...CommonProps} />;
};

// --- Projects Wrapper ---
const ProjectsWrapper = ({ audits }: { audits: AuditRecord[] }) => {
    const navigate = useNavigate();

    // Transform audits to AuditItem for ProjectListScreen
    const auditItems: AuditItem[] = audits.map(a => ({
        id: a.id,
        title: a.businessName || 'Untitled Audit',
        type: a.type === 'farm' ? 'Farm Audit' : 'Business Inspection',
        status: a.status === 'draft' ? 'in-progress' : a.status === 'synced' ? 'completed' : 'assigned',
        date: new Date(a.createdAt).toLocaleDateString(),
        priority: a.status === 'draft' ? 'high' : 'medium'
    }));

    return (
        <ProjectListScreen
            projectName="Project Alpha - Nairobi"
            audits={auditItems}
            onAuditClick={(id) => navigate(`/audit/${id}`)}
            onBack={() => navigate('/')}
        />
    );
};

interface AppRoutesProps {
    audits: AuditRecord[];
    user: User | null;
    sharedProps: any; // Using broad type for brevity in refactor
    onSaveAudit: (audit: AuditRecord) => Promise<void>;
    capturedFile: File | null;
    setCapturedFile: (file: File | null) => void;
    online: boolean;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
    audits, user, sharedProps, onSaveAudit, capturedFile, setCapturedFile, online
}) => {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={
                <>
                    <DashboardScreen
                        user={user!}
                        auditItems={audits.map(a => ({
                            id: a.id,
                            title: a.businessName || 'Untitled',
                            type: a.type === 'farm' ? 'Farm Audit' : 'Business Inspection',
                            status: a.status === 'draft' ? 'in-progress' : a.status === 'synced' ? 'completed' : 'assigned',
                            date: new Date(a.createdAt).toLocaleDateString(),
                            priority: 'medium'
                        }))}
                        unsynced={audits.filter(a => a.status !== 'synced').length}
                        lang={sharedProps.lang}
                        setLang={sharedProps.setLang}
                        isTraining={sharedProps.isTraining}
                        setIsTraining={sharedProps.setIsTraining}
                        isHighContrast={sharedProps.isHighContrast}
                        setIsHighContrast={sharedProps.setIsHighContrast}
                        onLogout={sharedProps.onLogout}
                        onRefresh={sharedProps.onRefresh}
                    />
                    <BottomNavigation />
                </>
            } />
            <Route path="/schedule" element={
                <ScheduleScreen />
            } />
            <Route path="/schedules" element={
                <>
                    <SchedulesScreen audits={audits} mode="schedule" {...sharedProps} />
                    <BottomNavigation />
                </>
            } />
            <Route path="/projects" element={
                <>
                    <ProjectsWrapper audits={audits} />
                    <BottomNavigation />
                </>
            } />
            <Route path="/audits" element={
                <>
                    <SchedulesScreen audits={audits} mode="history" {...sharedProps} />
                    <BottomNavigation />
                </>
            } />
            <Route path="/tasks" element={
                <>
                    <TasksScreen audits={audits} onUpdate={sharedProps.onRefresh} {...sharedProps} />
                    <BottomNavigation />
                </>
            } />
            <Route path="/admin" element={
                <Suspense fallback={<Loading />}>
                    <AdminDashboard audits={audits} />
                </Suspense>
            } />
            <Route path="/new" element={
                <NewAuditFlow
                    user={user}
                    onSave={onSaveAudit}
                    lang={sharedProps.lang}
                    isHighContrast={sharedProps.isHighContrast}
                    isTraining={sharedProps.isTraining}
                />
            } />
            <Route path="/audit/:id" element={<AuditDetailsScreen />} />
            <Route path="/safety-check" element={
                <SiteSafetyCheckScreen
                    auditTitle="Site Safety Check - Tower A"
                    location="Gate Building 202"
                    onBack={() => navigate(-1)}
                    onNext={() => navigate('/audit-summary')}
                    onSave={(data) => console.log("Draft saved", data)}
                />
            } />
            <Route path="/audit-summary" element={
                <AuditSummaryScreen
                    auditTitle="Site Safety Check - Tower A"
                    sections={[
                        { id: '1', title: 'Location & Time', completed: true },
                        { id: '2', title: 'AI Guidance', completed: true },
                        { id: '3', title: 'Safety Measures', completed: true },
                        { id: '4', title: 'Electricity & Power', completed: true }
                    ]}
                    supportingNotes={["Generator fuel level is low (20%)", "No fire extinguisher visible"]}
                    onBack={() => navigate(-1)}
                    onSubmit={() => {
                        // In real app: save final status
                        alert("Audit Submitted Successfully!");
                        navigate('/');
                    }}
                />
            } />
            <Route path="/camera" element={
                <PhotoCaptureScreen
                    onCapture={(file) => {
                        setCapturedFile(file);
                        navigate('/review');
                    }}
                    onClose={() => navigate(-1)}
                    context="AI Site Analysis"
                />
            } />
            <Route path="/review" element={
                capturedFile ? (
                    <PhotoReviewScreen
                        photo={capturedFile}
                        aiTags={['Equipment', 'Safety Hazard']}
                        onRetake={() => navigate('/camera')}
                        onSave={(data) => {
                            console.log('Saved media:', data);
                            setCapturedFile(null);
                            navigate(-2);
                        }}
                        onBack={() => navigate('/camera')}
                    />
                ) : (
                    <Navigate to="/camera" />
                )
            } />
            <Route path="/sync" element={
                <SyncStatusWrapper
                    audits={audits}
                    online={online}
                    onRefresh={sharedProps.onRefresh}
                    onClose={() => navigate(-1)}
                />
            } />
            <Route path="/sync-status" element={<Navigate to="/sync" />} />
            <Route path="/analyze" element={<ImageAnalysisScreen />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};
