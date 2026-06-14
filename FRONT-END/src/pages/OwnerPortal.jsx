import { Link } from "react-router-dom";
import { Building2, ShieldCheck, UserPlus } from "lucide-react";

function OwnerPortal() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl shadow-black/30">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">
            Staff Portal
          </p>

          <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
            Manage rentals with Rento
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Owners can list vehicles, manage bookings, complete trips and track
            revenue. Admins can approve vehicles and manage the platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            to="/owner-login"
            className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-blue-800"
          >
            <Building2 className="mb-5 text-blue-300" size={42} />
            <h2 className="text-2xl font-black text-white">Owner Login</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Manage your fleet, booking requests, vehicle status and revenue.
            </p>
          </Link>

          <Link
            to="/owner-register"
            className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-purple-800"
          >
            <UserPlus className="mb-5 text-purple-300" size={42} />
            <h2 className="text-2xl font-black text-white">Owner Register</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Create an owner account and start listing your rental vehicles.
            </p>
          </Link>

          <Link
            to="/admin-login"
            className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-red-800"
          >
            <ShieldCheck className="mb-5 text-red-300" size={42} />
            <h2 className="text-2xl font-black text-white">Admin Login</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Approve vehicles, manage users, monitor bookings and platform
              revenue.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default OwnerPortal;
