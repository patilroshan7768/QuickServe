export default function LoadingSpinner({ label = 'Loading...', fullPage = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${fullPage ? 'min-h-[60vh]' : 'py-12'}`}
      role="status"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
