import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Briefcase, Car, LogOut, Menu, UserRound, X } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadUser = () => {
    try {
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("rento-auth-change", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("rento-auth-change", loadUser);
    };
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMobileOpen(false);
    navigate("/");
    window.dispatchEvent(new Event("rento-auth-change"));
  };

  const navClass = ({ isActive }) =>
    `rounded-2xl px-5 py-3 text-sm font-black transition ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  const closeMobile = () => setMobileOpen(false);

  const navLinks = (
    <>
      <NavLink to="/" onClick={closeMobile} className={navClass}>
        Home
      </NavLink>

      <NavLink to="/vehicles" onClick={closeMobile} className={navClass}>
        Vehicles
      </NavLink>

      {user?.role === "customer" && (
        <NavLink to="/my-bookings" onClick={closeMobile} className={navClass}>
          My Bookings
        </NavLink>
      )}

      {user?.role === "owner" && (
        <NavLink
          to="/owner-dashboard"
          onClick={closeMobile}
          className={navClass}
        >
          Dashboard
        </NavLink>
      )}

      {user?.role === "admin" && (
        <NavLink
          to="/admin-dashboard"
          onClick={closeMobile}
          className={navClass}
        >
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 px-4 py-4 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <NavLink
          to="/"
          onClick={closeMobile}
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-950/40">
            <Car size={22} />
          </div>

          <div>
            <h1 className="text-xl font-black leading-none text-white">
              Rento
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Smart rentals
            </p>
          </div>
        </NavLink>

        <div className="hidden items-center gap-2 rounded-[1.5rem] border border-slate-800 bg-slate-900/80 p-1 md:flex">
          {navLinks}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!user && (
            <NavLink
              to="/staff"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-black text-slate-100 transition hover:bg-slate-800"
            >
              <Briefcase size={17} />
              Staff Portal
            </NavLink>
          )}

          {user && (
            <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-black text-slate-100">
              <UserRound size={16} />
              <span>{user.name}</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {user.role}
              </span>
            </div>
          )}

          {user ? (
            <button
              onClick={logoutHandler}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-900/60 bg-red-950/50 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-950"
            >
              <LogOut size={17} />
              Logout
            </button>
          ) : (
            <NavLink
              to="/customer-login"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
            >
              Login
            </NavLink>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-white md:hidden"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="mx-auto mt-4 max-w-7xl rounded-[1.5rem] border border-slate-800 bg-slate-900 p-3 shadow-2xl shadow-black/30 md:hidden">
          <div className="space-y-2">{navLinks}</div>

          <div className="mt-3 border-t border-slate-800 pt-3">
            {!user ? (
              <div className="grid gap-2">
                <NavLink
                  to="/customer-login"
                  onClick={closeMobile}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white"
                >
                  Customer Login
                </NavLink>

                <NavLink
                  to="/staff"
                  onClick={closeMobile}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-center text-sm font-black text-white"
                >
                  Staff Portal
                </NavLink>
              </div>
            ) : (
              <button
                onClick={logoutHandler}
                className="w-full rounded-2xl bg-red-950/60 px-5 py-3 text-sm font-black text-red-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
