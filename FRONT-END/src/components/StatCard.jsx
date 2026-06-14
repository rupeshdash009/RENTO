function StatCard({ title, value, icon }) {
  return (
    <div className="glass-soft rounded-3xl p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-blue-700">
        {icon}
      </div>

      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-1 text-3xl font-black text-slate-950">{value}</h3>
    </div>
  );
}

export default StatCard;
