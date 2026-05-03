import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon';

interface AuditErrorStateProps {
  title?: string;
  message?: string;
  details?: string;
  retryPath?: string;
  backPath?: string;
}

interface ErrorLocationState {
  title?: string;
  message?: string;
  details?: string;
  retryPath?: string;
  backPath?: string;
}

const DEFAULT_TITLE = 'Audit loading issue';
const DEFAULT_MESSAGE =
  'We could not open this audit right now. Please retry or go back to your audit list.';

const AuditErrorState: React.FC<AuditErrorStateProps> = ({
  title,
  message,
  details,
  retryPath,
  backPath,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as ErrorLocationState | null) ?? null;

  const resolvedTitle = title ?? routeState?.title ?? DEFAULT_TITLE;
  const resolvedMessage = message ?? routeState?.message ?? DEFAULT_MESSAGE;
  const resolvedDetails = details ?? routeState?.details;
  const resolvedRetryPath = retryPath ?? routeState?.retryPath;
  const resolvedBackPath = backPath ?? routeState?.backPath ?? '/audits';

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 font-base">
      <div className="w-full max-w-xl nuru-glass-card rounded-[32px] border border-border-glass p-8">
        <div className="w-14 h-14 rounded-2xl bg-error/15 border border-error/20 flex items-center justify-center mb-5">
          <MaterialIcon name="error" size={28} className="text-error" />
        </div>

        <h1 className="text-2xl font-light text-white tracking-tight font-heading mb-2">
          {resolvedTitle}
        </h1>
        <p className="text-sm text-text-secondary mb-4">{resolvedMessage}</p>
        {resolvedDetails && (
          <p className="text-xs text-text-tertiary mb-6">{resolvedDetails}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {resolvedRetryPath && (
            <button
              type="button"
              onClick={() => navigate(resolvedRetryPath)}
              className="flex-1 bg-accent text-black font-bold py-3.5 px-5 rounded-full text-sm cursor-pointer border-none active:scale-[0.98] transition-transform"
            >
              Retry
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(resolvedBackPath)}
            className="flex-1 bg-transparent border border-white/10 text-white/80 hover:text-white hover:bg-white/5 py-3.5 px-5 rounded-full text-sm cursor-pointer active:scale-[0.98] transition-all"
          >
            Back to audits
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditErrorState;
