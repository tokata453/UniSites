import { useUIStore } from '@/store/uiStore';

export default function ToastContainer() {
  const { toasts, dismissToast } = useUIStore();
  if (!toasts.length) return null;

  const colors = {
    success: 'bg-emerald-900/80 border-emerald-500/30 text-emerald-300',
    error:   'bg-red-900/80 border-red-500/30 text-red-300',
    info:    'bg-indigo-900/80 border-indigo-500/30 text-indigo-300',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium animate-fade-in ${colors[t.type] || colors.info}`}
          style={{ animation: 'slideUp 0.2s ease-out' }}>
          <span>{t.message}</span>
          <button onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100 ml-2">✕</button>
        </div>
      ))}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
