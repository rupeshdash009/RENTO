function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-950/50 text-blue-300">
        {icon}
      </div>

      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-1 text-3xl font-black text-white">{value}</h3>
    </div>
  );
}

export default StatCard;
