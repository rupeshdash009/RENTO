import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
  Car,
  MapPin,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";

function Home() {
  const features = [
    {
      title: "Verified Vehicles",
      text: "Only admin-approved rental vehicles are visible to customers.",
      icon: <ShieldCheck size={28} />,
    },
    {
      title: "Flexible Bookings",
      text: "Daily, weekly and monthly rental plans with real booking status.",
      icon: <CalendarCheck size={28} />,
    },
    {
      title: "Owner Analytics",
      text: "Owners can track paid bookings, completed trips and revenue.",
      icon: <BarChart3 size={28} />,
    },
    {
      title: "Secure Payments",
      text: "Razorpay payment flow for approved customer bookings.",
      icon: <Wallet size={28} />,
    },
    {
      title: "Location Filters",
      text: "Customers can search vehicles by location, type, fuel and price.",
      icon: <MapPin size={28} />,
    },
    {
      title: "Reviews & Ratings",
      text: "Customers can review vehicles after completed trips.",
      icon: <Star size={28} />,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="px-4 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-300">
              Smart Vehicle Rental
            </p>

            <h1 className="mt-4 text-5xl font-black leading-tight text-white md:text-7xl">
              Rent better rides with Rento.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A full-stack MERN rental platform for customers, vehicle owners
              and admins with bookings, approvals, payments, analytics,
              unavailable dates and reviews.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/vehicles" className="btn-primary">
                Browse Vehicles
              </Link>

              <Link
                to="/staff"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm font-black text-white hover:bg-slate-800"
              >
                Staff Portal
              </Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-black/40">
            <div className="flex min-h-[360px] items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-950/70 via-slate-950 to-purple-950/70">
              <Car size={150} className="text-blue-300" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-950 p-4 text-center">
                <p className="text-2xl font-black text-white">24/7</p>
                <p className="text-xs text-slate-400">Booking</p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 text-center">
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400">Dark UI</p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 text-center">
                <p className="text-2xl font-black text-white">MERN</p>
                <p className="text-xs text-slate-400">Stack</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-300">
              Features
            </p>
            <h2 className="mt-2 text-4xl font-black text-white">
              What your documentation promised
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-black/20"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-950/50 text-blue-300">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-black text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
