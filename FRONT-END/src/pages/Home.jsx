import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Car,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Star,
  Users,
  Clock,
  MapPin,
  Zap,
  Bike,
  Sparkles,
  IndianRupee,
  BarChart3,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: <CalendarCheck size={26} />,
    title: "Instant booking flow",
    desc: "Customers select dates, choose a vehicle, and send booking requests quickly.",
    tone: "blue",
  },
  {
    icon: <ShieldCheck size={26} />,
    title: "Secure role access",
    desc: "Customer, owner, and admin dashboards stay separated with protected routes.",
    tone: "emerald",
  },
  {
    icon: <TrendingUp size={26} />,
    title: "Owner analytics",
    desc: "Owners track revenue, paid bookings, completed trips and fleet activity.",
    tone: "purple",
  },
  {
    icon: <Zap size={26} />,
    title: "Live updates",
    desc: "Dashboards refresh automatically so users see fresh booking and vehicle data.",
    tone: "indigo",
  },
  {
    icon: <MapPin size={26} />,
    title: "Location filters",
    desc: "Customers filter vehicles by city, type, fuel and price range.",
    tone: "rose",
  },
  {
    icon: <Clock size={26} />,
    title: "Flexible plans",
    desc: "Daily, weekly and monthly pricing makes rentals simple for every journey.",
    tone: "amber",
  },
];

const steps = [
  {
    num: "01",
    title: "Create account",
    desc: "Register as a customer or enter through the staff portal as an owner.",
  },
  {
    num: "02",
    title: "Browse vehicles",
    desc: "Search by type, fuel, city and rental price.",
  },
  {
    num: "03",
    title: "Send request",
    desc: "Select rental dates and send a booking request.",
  },
  {
    num: "04",
    title: "Owner approval",
    desc: "Owner approves or rejects based on availability.",
  },
  {
    num: "05",
    title: "Pay and ride",
    desc: "After approval, customer completes payment and starts the trip.",
  },
];

const fleet = [
  {
    type: "Motorcycles",
    icon: "🏍️",
    desc: "Fast, flexible and ideal for city rides or weekend routes.",
    tag: "Popular",
  },
  {
    type: "Scooters",
    icon: "🛵",
    desc: "Beginner-friendly vehicles for daily commute and short trips.",
    tag: "Easy ride",
  },
  {
    type: "Sedans",
    icon: "🚗",
    desc: "Comfortable four-wheelers for business, family and city travel.",
    tag: "Comfort",
  },
  {
    type: "SUVs",
    icon: "🚙",
    desc: "Spacious and powerful vehicles for groups and long-distance trips.",
    tag: "Premium",
  },
];

const plans = [
  {
    name: "Customer",
    price: "₹0",
    sub: "free account",
    perks: [
      "Browse approved vehicles",
      "Send booking requests",
      "Track booking status",
      "Pay online after approval",
    ],
    cta: "/customer-register",
    highlight: false,
  },
  {
    name: "Rento Pro",
    price: "₹199",
    sub: "future plan",
    perks: [
      "Priority booking queue",
      "Rental discounts",
      "Booking history export",
      "Faster support access",
    ],
    cta: "/customer-register",
    highlight: true,
  },
  {
    name: "Fleet Owner",
    price: "₹499",
    sub: "future plan",
    perks: [
      "Add unlimited vehicles",
      "Approve booking requests",
      "Auto-generate vehicle data",
      "Manage fleet availability",
    ],
    cta: "/staff",
    highlight: false,
  },
];

const testimonials = [
  {
    name: "Arjun Mehta",
    role: "Customer",
    text: "Booking a scooter was simple. I could see the price, dates and booking status clearly.",
    stars: 5,
  },
  {
    name: "Priya Nair",
    role: "Fleet Owner",
    text: "The owner dashboard makes it easy to add vehicles and approve booking requests.",
    stars: 5,
  },
  {
    name: "Rohan Das",
    role: "Traveller",
    text: "The UI is clean and the rental flow feels smooth from browsing to booking.",
    stars: 5,
  },
];

const toneClasses = {
  blue: "bg-blue-950/50 text-blue-300 border-blue-900/50",
  emerald: "bg-emerald-950/50 text-emerald-300 border-emerald-900/50",
  purple: "bg-purple-950/50 text-purple-300 border-purple-900/50",
  indigo: "bg-indigo-950/50 text-indigo-300 border-indigo-900/50",
  rose: "bg-rose-950/50 text-rose-300 border-rose-900/50",
  amber: "bg-amber-950/50 text-amber-300 border-amber-900/50",
};

function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || visible) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin ?? "0px 0px -8% 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin, visible]);

  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` }}
      className={`home-reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function Counter({ target, suffix = "", duration = 900 }) {
  const [ref, visible] = useReveal({ threshold: 0.4 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return undefined;

    let rafId = 0;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(target * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [visible, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

function Section({ id, children, className = "" }) {
  return (
    <section
      id={id}
      className={className}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "1px 720px",
      }}
    >
      {children}
    </section>
  );
}

function Home() {
  const stats = useMemo(
    () => [
      {
        val: 2400,
        suffix: "+",
        label: "Vehicles listed",
        icon: <Car size={20} />,
      },
      {
        val: 18000,
        suffix: "+",
        label: "Bookings completed",
        icon: <CalendarCheck size={20} />,
      },
      {
        val: 950,
        suffix: "+",
        label: "Verified owners",
        icon: <ShieldCheck size={20} />,
      },
      {
        val: 99,
        suffix: "%",
        label: "System uptime",
        icon: <TrendingUp size={20} />,
      },
    ],
    [],
  );

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <style>
        {`
          .home-reveal {
            opacity: 0;
            transform: translate3d(0, 22px, 0);
            transition:
              opacity 520ms ease,
              transform 520ms ease;
            transition-delay: var(--reveal-delay, 0ms);
            will-change: opacity, transform;
          }

          .home-reveal.is-visible {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          .home-card {
            transform: translate3d(0, 0, 0);
            transition:
              transform 220ms ease,
              border-color 220ms ease,
              background-color 220ms ease;
            will-change: transform;
          }

          .home-card:hover {
            transform: translate3d(0, -6px, 0);
          }

          .home-float {
            animation: homeFloat 6s ease-in-out infinite;
            will-change: transform;
          }

          .home-float-slow {
            animation: homeFloat 8s ease-in-out infinite;
            will-change: transform;
          }

          .home-pulse {
            animation: homePulse 3s ease-in-out infinite;
          }

          .home-grid-bg {
            background-image:
              linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
            background-size: 48px 48px;
          }

          @keyframes homeFloat {
            0%, 100% {
              transform: translate3d(0, 0, 0);
            }
            50% {
              transform: translate3d(0, -10px, 0);
            }
          }

          @keyframes homePulse {
            0%, 100% {
              opacity: 0.45;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.04);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .home-reveal,
            .home-card,
            .home-float,
            .home-float-slow,
            .home-pulse {
              animation: none !important;
              transition: none !important;
              transform: none !important;
            }

            .home-reveal {
              opacity: 1 !important;
            }
          }
        `}
      </style>

      <section className="relative px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="home-pulse absolute left-[-12rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="home-pulse absolute right-[-12rem] top-20 h-[32rem] w-[32rem] rounded-full bg-purple-600/20 blur-3xl" />
          <div className="home-grid-bg absolute inset-0 opacity-80" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-900/70 bg-blue-950/40 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-300 shadow-sm backdrop-blur-xl">
                <Sparkles size={14} />
                Smart vehicle rental platform
              </span>

              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl xl:text-7xl">
                Rent vehicles
                <span className="block bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  faster and cleaner.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Rento connects customers with verified two-wheelers and
                four-wheelers while owners manage fleet, pricing, booking
                requests and availability from a modern dashboard.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/vehicles"
                  className="home-card inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-950/30 hover:bg-blue-500"
                >
                  Browse Vehicles
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/customer-register"
                  className="home-card inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 px-6 py-4 text-sm font-black text-slate-100 hover:bg-slate-800"
                >
                  Create Customer Account
                </Link>

                <Link
                  to="/staff"
                  className="home-card inline-flex items-center gap-2 rounded-2xl border border-purple-900/70 bg-purple-950/40 px-6 py-4 text-sm font-black text-purple-300 hover:bg-purple-950"
                >
                  Staff Portal
                </Link>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["2,400+", "Vehicles"],
                  ["98%", "Success"],
                  ["4.9★", "Rating"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-slate-800 bg-slate-900/75 p-4 text-center shadow-sm backdrop-blur-xl"
                  >
                    <p className="text-xl font-black text-white">{value}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="home-float-slow relative">
                <div className="rounded-[2.2rem] border border-slate-800 bg-slate-900/75 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
                  <div className="rounded-[1.8rem] bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950">
                          <Car size={28} />
                        </div>

                        <div>
                          <p className="font-black text-white">
                            Live rental dashboard
                          </p>
                          <p className="text-xs font-semibold text-slate-400">
                            Fleet · bookings · approvals
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-emerald-950/60 px-3 py-1 text-xs font-black text-emerald-300">
                        Online
                      </span>
                    </div>

                    <div className="grid gap-4">
                      <div className="home-card rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              Active booking
                            </p>
                            <h3 className="mt-2 text-xl font-black text-white">
                              Kia Seltos HTX
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              9 Jun 2026 → 23 Jun 2026
                            </p>
                          </div>

                          <div className="rounded-2xl bg-blue-950/50 p-3 text-blue-300">
                            <CalendarCheck />
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-3">
                          {[
                            ["₹51,408", "Amount"],
                            ["Approved", "Status"],
                            ["Unpaid", "Payment"],
                          ].map(([value, label]) => (
                            <div
                              key={label}
                              className="rounded-2xl bg-slate-950 p-3"
                            >
                              <p className="text-sm font-black text-white">
                                {value}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            icon: <Bike size={19} />,
                            label: "2W",
                            value: "Scooters",
                          },
                          {
                            icon: <Car size={19} />,
                            label: "4W",
                            value: "SUVs",
                          },
                          {
                            icon: <ShieldCheck size={19} />,
                            label: "Safe",
                            value: "Verified",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="home-card rounded-3xl border border-slate-800 bg-slate-900 p-4 text-center shadow-sm"
                          >
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-white">
                              {item.icon}
                            </div>
                            <p className="mt-3 text-sm font-black text-white">
                              {item.label}
                            </p>
                            <p className="text-xs text-slate-400">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-3xl border border-purple-900/60 bg-purple-950/30 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                          Owner pending requests
                        </p>

                        <div className="mt-3 space-y-2">
                          {["Royal Enfield Classic", "Maruti Swift ZXI"].map(
                            (item) => (
                              <div
                                key={item}
                                className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3"
                              >
                                <span className="text-sm font-bold text-slate-200">
                                  {item}
                                </span>

                                <span className="rounded-full bg-amber-950/50 px-3 py-1 text-xs font-black text-amber-300">
                                  Pending
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Section className="border-y border-slate-800 bg-slate-900/60 px-4 py-14 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 70}>
              <div className="home-card rounded-3xl border border-slate-800 bg-slate-950 p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-950/40 text-blue-300">
                  {stat.icon}
                </div>
                <p className="text-3xl font-black text-white">
                  <Counter target={stat.val} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="features" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-blue-950/40 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-300">
              Features
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-white">
              Built for renters and owners
            </h2>

            <p className="mt-3 text-slate-300">
              A focused rental platform with auth, fleet, bookings, approval
              flow, payments, analytics and admin controls.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 55}>
                <div className="home-card h-full rounded-[1.7rem] border border-slate-800 bg-slate-900 p-6 shadow-sm">
                  <div
                    className={`mb-5 inline-flex rounded-2xl border p-3 ${
                      toneClasses[feature.tone]
                    }`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-lg font-black text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {feature.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="how-it-works"
        className="bg-black px-4 py-20 text-white sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-200">
              Process
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight">
              How Rento works
            </h2>

            <p className="mt-3 text-slate-300">
              From account creation to approved booking and payment, the flow is
              simple and role-based.
            </p>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-5">
            {steps.map((step, index) => (
              <Reveal key={step.num} delay={index * 55}>
                <div className="home-card h-full rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-950">
                    {step.num}
                  </div>

                  <h3 className="font-black text-white">{step.title}</h3>

                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 flex flex-wrap justify-center gap-3">
            <Link
              to="/customer-register"
              className="home-card inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 hover:bg-slate-200"
            >
              Start as customer
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/staff"
              className="home-card inline-flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-4 text-sm font-black text-white hover:bg-white/10"
            >
              Continue as staff
            </Link>
          </Reveal>
        </div>
      </Section>

      <Section id="fleet" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-purple-950/40 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-300">
              Fleet
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-white">
              Two-wheelers and four-wheelers
            </h2>

            <p className="mt-3 text-slate-300">
              Owners can add real vehicles or generate realistic vehicle data
              from presets before listing.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {fleet.map((item, index) => (
              <Reveal key={item.type} delay={index * 70}>
                <div className="home-card group relative h-full overflow-hidden rounded-[1.7rem] border border-slate-800 bg-slate-900 p-6 shadow-sm">
                  <span className="absolute right-4 top-4 rounded-full bg-blue-950/40 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-300">
                    {item.tag}
                  </span>

                  <div className="mb-5 text-5xl">{item.icon}</div>

                  <h3 className="text-lg font-black text-white">{item.type}</h3>

                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {item.desc}
                  </p>

                  <Link
                    to="/vehicles"
                    className="mt-5 inline-flex items-center gap-1 text-sm font-black text-blue-300 transition group-hover:gap-2"
                  >
                    Browse {item.type}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="pricing"
        className="bg-slate-900/40 px-4 py-20 backdrop-blur-xl sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-indigo-950/40 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-indigo-300">
              Pricing
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-white">
              Simple rental plans
            </h2>

            <p className="mt-3 text-slate-300">
              Your MVP starts free for customers and supports future premium
              plans for customers and owners.
            </p>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 80}>
                <div
                  className={`home-card relative h-full rounded-[1.7rem] border p-7 shadow-sm ${
                    plan.highlight
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-800 bg-slate-900 text-white"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-black text-amber-950">
                      Popular
                    </span>
                  )}

                  <p
                    className={`text-sm font-black uppercase tracking-[0.18em] ${
                      plan.highlight ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {plan.name}
                  </p>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span
                      className={`mb-2 text-sm ${
                        plan.highlight ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {plan.sub}
                    </span>
                  </div>

                  <ul className="mt-7 space-y-3">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex gap-2 text-sm">
                        <CheckCircle2
                          size={16}
                          className={`mt-0.5 shrink-0 ${
                            plan.highlight ? "text-white" : "text-emerald-400"
                          }`}
                        />
                        <span
                          className={
                            plan.highlight ? "text-blue-50" : "text-slate-300"
                          }
                        >
                          {perk}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={plan.cta}
                    className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black transition ${
                      plan.highlight
                        ? "bg-white text-slate-950 hover:bg-slate-200"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    Get started
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section id="reviews" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-emerald-950/40 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
              Reviews
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-white">
              Built for real users
            </h2>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <Reveal key={item.name} delay={index * 80}>
                <div className="home-card h-full rounded-[1.7rem] border border-slate-800 bg-slate-900 p-6 shadow-sm">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: item.stars }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        size={15}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  <p className="text-sm leading-7 text-slate-300">
                    “{item.text}”
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xs font-black text-slate-950">
                      {item.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>

                    <div>
                      <p className="text-sm font-black text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">{item.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 overflow-hidden rounded-[2rem] bg-white p-8 text-center text-slate-950 shadow-2xl shadow-black/20 sm:p-12">
            <h2 className="text-4xl font-black tracking-tight">
              Ready to rent smarter?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Start as a customer, or enter staff portal to manage vehicles as
              an owner or admin.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/customer-register"
                className="home-card inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white hover:bg-slate-800"
              >
                Start as Customer
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/staff"
                className="home-card inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-6 py-4 text-sm font-black text-slate-950 hover:bg-slate-100"
              >
                List your fleet
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Users size={14} />
                Customer ready
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Role protected
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap size={14} />
                Fast MVP flow
              </span>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="border-t border-slate-800 bg-black px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 text-sm text-slate-400 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Car size={20} />
              </div>
              <p className="text-lg font-black text-white">Rento</p>
            </div>
            <p className="max-w-xl leading-7">
              MERN stack smart vehicle rental platform with dark UI, fast
              browsing, booking workflow, owner dashboard and admin controls.
            </p>
          </div>

          <div>
            <p className="mb-3 font-black text-white">Platform</p>
            <div className="space-y-2">
              <Link to="/vehicles" className="block hover:text-white">
                Vehicles
              </Link>
              <Link to="/customer-login" className="block hover:text-white">
                Customer Login
              </Link>
              <Link to="/staff" className="block hover:text-white">
                Staff Portal
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-3 font-black text-white">Features</p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Wallet size={14} />
                Payments
              </p>
              <p className="flex items-center gap-2">
                <BarChart3 size={14} />
                Analytics
              </p>
              <p className="flex items-center gap-2">
                <IndianRupee size={14} />
                Revenue
              </p>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}

export default Home;
