import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
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
  ChevronDown,
  Quote,
  Bike,
  Sparkles,
} from "lucide-react";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function Counter({ target, suffix = "", duration = 1400 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();

  useEffect(() => {
    if (!visible) return;

    let start = 0;
    const frameTime = 16;
    const totalFrames = Math.round(duration / frameTime);
    const increment = target / totalFrames;

    const timer = setInterval(() => {
      start += increment;

      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, frameTime);

    return () => clearInterval(timer);
  }, [visible, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function Section({ children, className = "", id = "" }) {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const features = [
  {
    icon: <CalendarCheck size={26} />,
    title: "Instant booking flow",
    desc: "Customers select dates, choose a vehicle, and send booking requests quickly.",
    color: "text-blue-600 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: <ShieldCheck size={26} />,
    title: "Secure role access",
    desc: "Customer, owner, and admin dashboards stay separated with protected routes.",
    color: "text-emerald-600 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: <TrendingUp size={26} />,
    title: "Owner control",
    desc: "Owners manage vehicles, status, prices, and booking approvals from one panel.",
    color: "text-purple-600 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    icon: <Zap size={26} />,
    title: "Live updates",
    desc: "Dashboards refresh automatically so users see fresh booking and vehicle data.",
    color: "text-indigo-600 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
  },
  {
    icon: <MapPin size={26} />,
    title: "Location filters",
    desc: "Customers can filter vehicles by city, type, fuel, and price range.",
    color: "text-rose-600 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  {
    icon: <Clock size={26} />,
    title: "Flexible plans",
    desc: "Daily, weekly, and monthly pricing makes rentals simple for every journey.",
    color: "text-amber-600 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40",
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
    desc: "Search by type, fuel, city, and rental price.",
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
    desc: "Fast, flexible, and ideal for city rides or weekend routes.",
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
    desc: "Comfortable four-wheelers for business, family, and city travel.",
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
      "Browse all approved vehicles",
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
    text: "Booking a scooter was simple. I could see the price, dates, and booking status clearly.",
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative px-4 py-20 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20" />
          <div className="absolute right-[-10rem] top-20 h-[28rem] w-[28rem] rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/20" />
          <div
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-700 shadow-sm backdrop-blur-xl dark:border-blue-900/70 dark:bg-slate-900/80 dark:text-blue-300">
                <Sparkles size={14} />
                Smart vehicle rental platform
              </span>

              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 dark:text-white sm:text-6xl xl:text-7xl">
                Rent vehicles
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300">
                  faster and cleaner.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                Rento connects customers with verified two-wheelers and
                four-wheelers while owners manage fleet, pricing, booking
                requests, and availability from a modern dashboard.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/vehicles"
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-200 transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:shadow-none dark:hover:bg-slate-200"
                  >
                    Browse Vehicles
                    <ArrowRight size={17} />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/customer-register"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 text-sm font-black text-slate-800 shadow-sm backdrop-blur-xl transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Create Customer Account
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/staff"
                    className="inline-flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-6 py-4 text-sm font-black text-purple-700 transition hover:bg-purple-100 dark:border-purple-900/70 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-950"
                  >
                    Staff Portal
                  </Link>
                </motion.div>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["2,400+", "Vehicles"],
                  ["98%", "Success"],
                  ["4.9★", "Rating"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/70 bg-white/75 p-4 text-center shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75"
                  >
                    <p className="text-xl font-black text-slate-950 dark:text-white">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="relative"
            >
              <div className="rounded-[2.2rem] border border-white/80 bg-white/75 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/75 dark:shadow-black/30">
                <div className="rounded-[1.8rem] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Car size={28} />
                      </div>

                      <div>
                        <p className="font-black text-slate-950 dark:text-white">
                          Live rental dashboard
                        </p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Fleet · bookings · approvals
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Online
                    </span>
                  </div>

                  <div className="grid gap-4">
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Active booking
                          </p>
                          <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                            Kia Seltos HTX
                          </h3>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            9 Jun 2026 → 23 Jun 2026
                          </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
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
                            className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"
                          >
                            <p className="text-sm font-black text-slate-950 dark:text-white">
                              {value}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

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
                        <motion.div
                          key={item.label}
                          whileHover={{ y: -3 }}
                          className="rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-white">
                            {item.icon}
                          </div>
                          <p className="mt-3 text-sm font-black text-slate-950 dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-900/60 dark:bg-purple-950/30">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-700 dark:text-purple-300">
                        Owner pending requests
                      </p>

                      <div className="mt-3 space-y-2">
                        {["Royal Enfield Classic", "Maruti Swift ZXI"].map(
                          (item) => (
                            <div
                              key={item}
                              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-slate-900"
                            >
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {item}
                              </span>

                              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
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
            </motion.div>
          </div>

          <motion.div
            className="mt-16 flex justify-center"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
              <span className="text-xs font-bold">Scroll to explore</span>
              <ChevronDown size={18} />
            </div>
          </motion.div>
        </div>
      </section>

      <Section className="border-y border-slate-200/70 bg-white/70 px-4 py-14 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 lg:grid-cols-4">
          {[
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
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                {stat.icon}
              </div>
              <p className="text-3xl font-black text-slate-950 dark:text-white">
                <Counter target={stat.val} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section id="features" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              Features
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Built for renters and owners
            </h2>

            <p className="mt-3 text-slate-600 dark:text-slate-300">
              A focused rental platform with the core tools your MERN project
              needs: auth, fleet, bookings, approval flow, payments, and admin.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="rounded-[1.7rem] border border-slate-100 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
              >
                <div
                  className={`mb-5 inline-flex rounded-2xl p-3 ${feature.bg} ${feature.color}`}
                >
                  {feature.icon}
                </div>

                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section
        id="how-it-works"
        className="bg-slate-950 px-4 py-20 text-white dark:bg-black sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
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
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-5 lg:grid-cols-5"
          >
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-950">
                  {step.num}
                </div>

                <h3 className="font-black text-white">{step.title}</h3>

                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link
              to="/customer-register"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-slate-200"
            >
              Start as customer
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/staff"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10"
            >
              Continue as staff
            </Link>
          </div>
        </div>
      </Section>

      <Section id="fleet" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-purple-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              Fleet
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Two-wheelers and four-wheelers
            </h2>

            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Owners can add real vehicles or generate realistic vehicle data
              from presets before listing.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {fleet.map((item) => (
              <motion.div
                key={item.type}
                variants={itemVariants}
                whileHover={{ y: -7 }}
                className="group relative overflow-hidden rounded-[1.7rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="absolute right-4 top-4 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  {item.tag}
                </span>

                <div className="mb-5 text-5xl">{item.icon}</div>

                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {item.type}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {item.desc}
                </p>

                <Link
                  to="/vehicles"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-black text-blue-700 transition group-hover:gap-2 dark:text-blue-300"
                >
                  Browse {item.type}
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section
        id="pricing"
        className="bg-white/70 px-4 py-20 backdrop-blur-xl dark:bg-slate-900/40 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              Pricing
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Simple rental plans
            </h2>

            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Your MVP starts free for customers and supports future premium
              plans for customers and owners.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-5 lg:grid-cols-3"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                whileHover={{ y: -7 }}
                className={`relative rounded-[1.7rem] border p-7 shadow-sm ${
                  plan.highlight
                    ? "border-blue-500 bg-slate-950 text-white dark:border-blue-400 dark:bg-white dark:text-slate-950"
                    : "border-slate-100 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-black text-amber-950">
                    Popular
                  </span>
                )}

                <p
                  className={`text-sm font-black uppercase tracking-[0.18em] ${
                    plan.highlight
                      ? "text-blue-200 dark:text-blue-700"
                      : "text-slate-400"
                  }`}
                >
                  {plan.name}
                </p>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span
                    className={`mb-2 text-sm ${
                      plan.highlight
                        ? "text-slate-300 dark:text-slate-600"
                        : "text-slate-500 dark:text-slate-400"
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
                          plan.highlight
                            ? "text-blue-300 dark:text-blue-700"
                            : "text-emerald-500"
                        }`}
                      />
                      <span
                        className={
                          plan.highlight
                            ? "text-slate-200 dark:text-slate-700"
                            : "text-slate-600 dark:text-slate-300"
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
                      ? "bg-white text-slate-950 hover:bg-slate-200 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
                      : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  }`}
                >
                  Get started
                  <ArrowRight size={15} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section id="reviews" className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              Reviews
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Built for real users
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-5 lg:grid-cols-3"
          >
            {testimonials.map((item) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="rounded-[1.7rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: item.stars }).map((_, index) => (
                    <Star
                      key={index}
                      size={15}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <Quote size={22} className="mb-3 text-slate-300" />

                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  “{item.text}”
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                    {item.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-950 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-16 overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-center text-white shadow-2xl shadow-slate-200 dark:bg-white dark:text-slate-950 dark:shadow-black/20 sm:p-12">
            <h2 className="text-4xl font-black tracking-tight">
              Ready to rent smarter?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300 dark:text-slate-600">
              Start as a customer, or enter staff portal to manage vehicles as
              an owner or admin.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/customer-register"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-slate-200 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
              >
                Start as Customer
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/staff"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10 dark:border-slate-300 dark:text-slate-950 dark:hover:bg-slate-100"
              >
                List your fleet
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs font-semibold text-slate-300 dark:text-slate-600">
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
          </div>
        </div>
      </Section>
    </main>
  );
}
