export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-600">Loading secure sign-in...</p>
      </div>
    </div>
  );
}
