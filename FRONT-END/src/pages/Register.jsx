import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Car, Lock, Mail, Phone, UserRound } from "lucide-react";
import API from "../api/axios";

function Register({ roleType = "customer" }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isOwner = roleType === "owner";

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

      await API.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: roleType,
      });

      navigate(isOwner ? "/owner-login" : "/customer-login", {
        replace: true,
      });
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
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
              {isOwner ? "Owner Registration" : "Customer Registration"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {isOwner
                ? "Create an owner account to list vehicles and manage rental bookings."
                : "Create a customer account to book vehicles and manage trips."}
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
                <UserRound size={14} />
                Name
              </span>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                className="input-style"
              />
            </label>

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
                <Phone size={14} />
                Phone
              </span>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
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
                placeholder="Create password"
                required
                minLength={6}
                className="input-style"
              />
            </label>

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-sm font-black text-white transition hover:from-blue-500 hover:to-purple-500 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-300">
            Already registered?{" "}
            <Link
              to={isOwner ? "/owner-login" : "/customer-login"}
              className="font-black text-blue-300"
            >
              Login here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
