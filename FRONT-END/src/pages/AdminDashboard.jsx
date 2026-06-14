import { useCallback, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  Car,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import API from "../api/axios";
import StatCard from "../components/StatCard";
import useAutoRefresh from "../hooks/useAutoRefresh";
import {
  badgeClass,
  formatDate,
  formatPrice,
  getBookingAmount,
} from "../utils/formatters";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");

      const [statsRes, vehiclesRes, usersRes, bookingsRes] = await Promise.all([
        API.get("/admin/stats").catch(() => ({ data: { stats: null } })),
        API.get("/admin/vehicles"),
        API.get("/admin/users").catch(() => ({ data: { users: [] } })),
        API.get("/admin/bookings").catch(() => ({ data: { bookings: [] } })),
      ]);

      setStats(statsRes.data?.stats || null);
      setVehicles(vehiclesRes.data?.vehicles || vehiclesRes.data || []);
      setUsers(usersRes.data?.users || []);
      setBookings(bookingsRes.data?.bookings || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load admin panel");
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoRefresh(fetchDashboard, 30000);

  const fallbackStats = useMemo(() => {
    const paidBookings = bookings.filter(
      (booking) => booking.paymentStatus === "paid",
    );

    const totalRevenue = paidBookings.reduce(
      (sum, booking) => sum + getBookingAmount(booking),
      0,
    );

    return {
      totalUsers: users.length,
      totalCustomers: users.filter((user) => user.role === "customer").length,
      totalOwners: users.filter((user) => user.role === "owner").length,
      totalVehicles: vehicles.length,
      pendingVehicles: vehicles.filter(
        (vehicle) => vehicle.approvalStatus === "pending",
      ).length,
      approvedVehicles: vehicles.filter(
        (vehicle) => vehicle.approvalStatus === "approved",
      ).length,
      totalBookings: bookings.length,
      paidBookings: paidBookings.length,
      completedBookings: bookings.filter(
        (booking) => booking.status === "completed",
      ).length,
      totalRevenue,
    };
  }, [vehicles, users, bookings]);

  const dashboardStats = stats || fallbackStats;

  const approveVehicle = async (vehicleId) => {
    try {
      setMessage("");
      setError("");

      await API.put(`/admin/vehicles/${vehicleId}/approve`);
      setMessage("Vehicle approved successfully.");
      fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || "Vehicle approval failed");
    }
  };

  const rejectVehicle = async (vehicleId) => {
    const reason =
      window.prompt("Enter rejection reason", "Rejected by admin") ||
      "Rejected by admin";

    try {
      setMessage("");
      setError("");

      await API.put(`/admin/vehicles/${vehicleId}/reject`, {
        rejectionReason: reason,
      });

      setMessage("Vehicle rejected successfully.");
      fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || "Vehicle rejection failed");
    }
  };

  const toggleUserStatus = async (userId) => {
    if (!window.confirm("Change this user's active status?")) return;

    try {
      setMessage("");
      setError("");

      await API.put(`/admin/users/${userId}/toggle-status`);
      setMessage("User status updated successfully.");
      fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || "User status update failed");
    }
  };

  const approveBooking = async (bookingId) => {
    try {
      setMessage("");
      setError("");

      await API.put(`/bookings/${bookingId}/approve`);
      setMessage("Booking approved successfully.");
      fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || "Booking approval failed");
    }
  };

  const rejectBooking = async (bookingId) => {
    const reason =
      window.prompt("Enter rejection reason", "Rejected by admin") ||
      "Rejected by admin";

    try {
      setMessage("");
      setError("");

      await API.put(`/bookings/${bookingId}/reject`, {
        rejectionReason: reason,
      });

      setMessage("Booking rejected successfully.");
      fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || "Booking rejection failed");
    }
  };

  const completeBooking = async (bookingId) => {
    if (!window.confirm("Mark this paid booking as completed?")) return;

    try {
      setMessage("");
      setError("");

      await API.put(`/bookings/${bookingId}/complete`);
      setMessage("Booking marked as completed.");
      fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || "Booking completion failed");
    }
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "vehicles", label: "Vehicles" },
    { key: "users", label: "Users" },
    { key: "bookings", label: "Bookings" },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-300">
                Admin Panel
              </p>

              <h1 className="mt-2 text-3xl font-black text-white">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Manage vehicles, users, bookings, approvals and revenue.
              </p>
            </div>

            <button
              onClick={fetchDashboard}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 text-sm font-black text-white hover:bg-slate-700"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                  activeTab === tab.key
                    ? "bg-red-600 text-white"
                    : "border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {(error || message) && (
          <div
            className={`rounded-2xl border p-4 text-sm font-bold ${
              error
                ? "border-red-900/60 bg-red-950/50 text-red-300"
                : "border-emerald-900/60 bg-emerald-950/50 text-emerald-300"
            }`}
          >
            {error || message}
          </div>
        )}

        {activeTab === "overview" && (
          <section className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Revenue"
                value={formatPrice(dashboardStats.totalRevenue)}
                icon={<IndianRupee size={24} />}
              />

              <StatCard
                title="Total Users"
                value={dashboardStats.totalUsers}
                icon={<Users size={24} />}
              />

              <StatCard
                title="Total Vehicles"
                value={dashboardStats.totalVehicles}
                icon={<Car size={24} />}
              />

              <StatCard
                title="Total Bookings"
                value={dashboardStats.totalBookings}
                icon={<CalendarCheck size={24} />}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6">
                <ShieldCheck className="mb-4 text-emerald-300" />
                <p className="text-sm text-slate-400">Approved vehicles</p>
                <h3 className="mt-1 text-4xl font-black text-white">
                  {dashboardStats.approvedVehicles}
                </h3>
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6">
                <BarChart3 className="mb-4 text-amber-300" />
                <p className="text-sm text-slate-400">Pending vehicles</p>
                <h3 className="mt-1 text-4xl font-black text-white">
                  {dashboardStats.pendingVehicles}
                </h3>
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6">
                <CheckCircle2 className="mb-4 text-blue-300" />
                <p className="text-sm text-slate-400">Completed bookings</p>
                <h3 className="mt-1 text-4xl font-black text-white">
                  {dashboardStats.completedBookings}
                </h3>
              </div>
            </div>
          </section>
        )}

        {activeTab === "vehicles" && (
          <section className="space-y-5">
            {vehicles.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
                No vehicles found.
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <article
                  key={vehicle._id}
                  className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/20"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {vehicle.vehicleName}
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {vehicle.brand} {vehicle.model} •{" "}
                        {vehicle.vehicleNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Owner: {vehicle.owner?.name || "Owner"} •{" "}
                        {vehicle.owner?.email || "No email"}
                      </p>

                      {vehicle.rejectionReason && (
                        <p className="mt-2 text-sm font-bold text-red-300">
                          Reason: {vehicle.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${badgeClass(
                          vehicle.approvalStatus,
                        )}`}
                      >
                        {vehicle.approvalStatus}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${badgeClass(
                          vehicle.status,
                        )}`}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {vehicle.approvalStatus !== "approved" && (
                      <button
                        onClick={() => approveVehicle(vehicle._id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500"
                      >
                        <CheckCircle2 size={17} />
                        Approve
                      </button>
                    )}

                    {vehicle.approvalStatus !== "rejected" && (
                      <button
                        onClick={() => rejectVehicle(vehicle._id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-950/60 px-5 py-3 text-sm font-black text-red-300 hover:bg-red-950"
                      >
                        <XCircle size={17} />
                        Reject
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {activeTab === "users" && (
          <section className="space-y-4">
            {users.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <article
                  key={user._id}
                  className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/20"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h2 className="text-xl font-black text-white">
                        {user.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {user.email} • {user.phone || "No phone"}
                      </p>

                      <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        {user.role}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${badgeClass(
                          user.isActive === false ? "inactive" : "active",
                        )}`}
                      >
                        {user.isActive === false ? "inactive" : "active"}
                      </span>

                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-black text-white hover:bg-slate-700"
                      >
                        {user.isActive === false ? "Activate" : "Deactivate"}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {activeTab === "bookings" && (
          <section className="space-y-5">
            {bookings.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
                No bookings found.
              </div>
            ) : (
              bookings.map((booking) => {
                const amount = getBookingAmount(booking);
                const vehicle = booking.vehicle || {};
                const customer = booking.customer || {};
                const owner = booking.owner || {};

                return (
                  <article
                    key={booking._id}
                    className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/20"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <h2 className="text-2xl font-black text-white">
                          {vehicle.vehicleName || "Vehicle"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                          Customer: {customer.name || "Customer"} •{" "}
                          {customer.email || "No email"}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Owner: {owner.name || "Owner"} •{" "}
                          {owner.email || "No email"}
                        </p>

                        <p className="mt-2 text-sm text-slate-300">
                          {formatDate(booking.startDate)} →{" "}
                          {formatDate(booking.endDate)} •{" "}
                          {booking.rentalPlan || "daily"}
                        </p>

                        <p className="mt-2 text-xl font-black text-white">
                          {formatPrice(amount)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${badgeClass(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${badgeClass(
                            booking.paymentStatus,
                          )}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => approveBooking(booking._id)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500"
                          >
                            <CheckCircle2 size={17} />
                            Approve
                          </button>

                          <button
                            onClick={() => rejectBooking(booking._id)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-red-950/60 px-5 py-3 text-sm font-black text-red-300 hover:bg-red-950"
                          >
                            <XCircle size={17} />
                            Reject
                          </button>
                        </>
                      )}

                      {booking.status === "approved" &&
                        booking.paymentStatus === "paid" && (
                          <button
                            onClick={() => completeBooking(booking._id)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-500"
                          >
                            <CalendarCheck size={17} />
                            Mark Completed
                          </button>
                        )}
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminDashboard;
