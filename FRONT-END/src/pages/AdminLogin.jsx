import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail } from "lucide-react";
import API from "../api/axios";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const res = await API.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const token = res.data?.token;
      const user = res.data?.user;

      if (!token || !user) {
        setError("Invalid server response");
        return;
      }

      if (user.role !== "admin") {
        setError("This is not an admin account.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("rento-auth-change"));

      navigate("/admin-dashboard", { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-black/30">
          <div className="mb-7">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/60 text-red-300">
              <ShieldCheck size={28} />
            </div>

            <h1 className="text-3xl font-black text-white">Admin Login</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Access vehicle approvals, users, bookings and platform revenue.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-900/60 bg-red-950/50 px-4 py-3 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                <Mail size={14} />
                Email
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Admin email"
                className="input-style"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                <Lock size={14} />
                Password
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Admin password"
                className="input-style"
              />
            </label>

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white hover:bg-red-500 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;
