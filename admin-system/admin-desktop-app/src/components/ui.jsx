import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, ImageOff, Info, X } from 'lucide-react';

/* ---------------- Toasts ---------------- */

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  // toast('Saved') or toast({ message, tone: 'success' | 'error' | 'info', action: { label, onClick } })
  const toast = useCallback(
    (input) => {
      const item = typeof input === 'string' ? { message: input } : input;
      const id = Math.random().toString(36).slice(2);
      setToasts((list) => [...list.slice(-3), { id, tone: 'success', ...item }]);
      setTimeout(() => dismiss(id), item.tone === 'error' ? 7000 : 4000);
    },
    [dismiss]
  );

  const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };
  const tones = { success: 'text-success', error: 'text-danger', info: 'text-accent' };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex flex-col items-center gap-2 p-4 sm:items-end"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const Icon = icons[t.tone] || Info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-xl border border-line bg-panel px-4 py-3 shadow-pop"
              role={t.tone === 'error' ? 'alert' : 'status'}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tones[t.tone]}`} aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm text-ink">{t.message}</p>
              {t.action ? (
                <button
                  type="button"
                  className="text-sm font-semibold text-accent hover:underline"
                  onClick={() => {
                    t.action.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              ) : null}
              <button type="button" className="text-muted hover:text-ink" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------------- Confirm dialog ---------------- */

const ConfirmContext = createContext(async () => false);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);
  const confirmButton = useRef(null);

  // await confirm({ title, message, confirmLabel, danger })
  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setDialog(options);
      }),
    []
  );

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setDialog(null);
  };

  useEffect(() => {
    if (!dialog) return undefined;
    confirmButton.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 animate-fade-in bg-black/40" onClick={() => close(false)} aria-label="Cancel" />
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="relative w-full max-w-md animate-fade-up rounded-2xl border border-line bg-panel p-6 shadow-pop">
            <div className="flex gap-4">
              {dialog.danger ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dangerSoft text-danger">
                  <AlertTriangle className="h-5 w-5" />
                </span>
              ) : null}
              <div className="min-w-0 space-y-2">
                <h2 id="confirm-title" className="font-display text-lg font-semibold text-ink">
                  {dialog.title}
                </h2>
                {dialog.message ? <p className="text-sm text-muted">{dialog.message}</p> : null}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => close(false)}>
                Cancel
              </button>
              <button
                ref={confirmButton}
                type="button"
                className={dialog.danger ? 'btn-danger' : 'btn-primary'}
                onClick={() => close(true)}
              >
                {dialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

/* ---------------- Drawer (side panel; full screen on phones) ---------------- */

export function Drawer({ open, onClose, title, eyebrow, children, footer, width = 'max-w-2xl', busy = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, busy]);

  if (!open) return null;

  // Rendered at the end of <body> so page spacing and layout never shift it.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex">
      <button type="button" className="absolute inset-0 animate-fade-in bg-black/40" onClick={busy ? undefined : onClose} aria-label="Close panel" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative ml-auto flex h-full w-full ${width} animate-slide-in flex-col border-l border-line bg-panel shadow-pop`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2 className="mt-0.5 truncate font-display text-xl font-semibold text-ink">{title}</h2>
          </div>
          <button type="button" className="icon-btn -mr-2" onClick={busy ? undefined : onClose} aria-label="Close panel">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? <footer className="border-t border-line bg-panel px-5 py-3 sm:px-6">{footer}</footer> : null}
      </section>
    </div>,
    document.body
  );
}

/* ---------------- Small pieces ---------------- */

export function Switch({ checked, onChange, label, disabled = false, size = 'md' }) {
  const dims = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const knob = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const shift = size === 'sm' ? 'translate-x-4' : 'translate-x-5';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex ${dims} shrink-0 items-center rounded-full p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50 ${
        checked ? 'bg-success' : 'bg-line'
      }`}
    >
      <span className={`${knob} rounded-full bg-white shadow transition-transform ${checked ? shift : 'translate-x-0'}`} />
    </button>
  );
}

const STATUS_STYLES = {
  Pending: 'bg-warnSoft text-warn',
  Completed: 'bg-successSoft text-success',
  Cancelled: 'bg-dangerSoft text-danger'
};

export function StatusBadge({ status }) {
  return (
    <span className={`chip ${STATUS_STYLES[status] || 'bg-sunken text-muted'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {Icon ? (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sunken text-muted">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : null}
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {message ? <p className="mt-1 max-w-sm text-sm text-muted">{message}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-sunken ${className}`} />;
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/30 bg-dangerSoft px-4 py-3 text-sm text-danger" role="alert">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">{message}</p>
      {onRetry ? (
        <button type="button" className="font-semibold underline-offset-2 hover:underline" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function Thumb({ src, alt = '', size = 'h-10 w-10' }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white`}>
      {src && !failed ? (
        <img src={src} alt={alt} className="h-full w-full object-contain" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <ImageOff className="h-1/2 w-1/2 max-h-5 max-w-5 text-muted/50" aria-label="No photo" />
      )}
    </span>
  );
}
