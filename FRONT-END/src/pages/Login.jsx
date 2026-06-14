import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Car, Lock, Mail } from "lucide-react";
import API from "../api/axios";

function Login({ expectedRole = "customer" }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleLabels = {
    customer: "Customer",
    owner: "Owner",
  };

  const roleRedirects = {
    customer: "/vehicles",
    owner: "/owner-dashboard",
    admin: "/admin-dashboard",
  };

  const isOwner = expectedRole === "owner";

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
        setError("Login failed. Token or user missing from server response.");
        return;
      }

      if (expectedRole && user.role !== expectedRole) {
        setError(
          `This account is ${user.role}. Please login as ${expectedRole}.`,
        );
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("rento-auth-change"));

      navigate(roleRedirects[user.role] || "/", { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-black/30">
          <div className="mb-7">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              {isOwner ? <Building2 size={26} /> : <Car size={26} />}
            </div>

            <h1 className="text-3xl font-black text-white">
              {roleLabels[expectedRole] || "User"} Login
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {isOwner
                ? "Login as rental owner to manage vehicles, bookings and revenue."
                : "Login to browse vehicles, book rentals and track your trips."}
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
                placeholder="Enter email"
                required
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
                placeholder="Enter password"
                required
                className="input-style"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-sm font-black text-white transition hover:from-blue-500 hover:to-purple-500 disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : `Login as ${roleLabels[expectedRole] || "User"}`}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-300">
            {isOwner ? (
              <>
                Need owner account?{" "}
                <Link to="/owner-register" className="font-black text-blue-300">
                  Register owner
                </Link>
              </>
            ) : (
              <>
                New customer?{" "}
                <Link
                  to="/customer-register"
                  className="font-black text-blue-300"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
