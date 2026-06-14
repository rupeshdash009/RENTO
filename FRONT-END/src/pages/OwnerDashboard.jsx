import { useCallback, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  Car,
  CheckCircle2,
  IndianRupee,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  XCircle,
} from "lucide-react";
import API from "../api/axios";
import VehicleCard from "../components/VehicleCard";
import StatCard from "../components/StatCard";
import useAutoRefresh from "../hooks/useAutoRefresh";
import {
  badgeClass,
  formatDate,
  formatPrice,
  getBookingAmount,
} from "../utils/formatters";

const emptyVehicleForm = {
  vehicleName: "",
  vehicleNumber: "",
  brand: "",
  model: "",
  variant: "",
  modelYear: "",
  type: "two-wheeler",
  bodyType: "",
  fuelType: "petrol",
  transmission: "manual",
  priceDaily: "",
  priceWeekly: "",
  priceMonthly: "",
  depositAmount: "",
  location: "",
  description: "",
  images: "",
  engineCC: "",
  batteryRangeKm: "",
  mileageKmpl: "",
  seatingCapacity: "",
  color: "",
  features: "",
};

const presets = [
  {
    label: "Honda Activa",
    data: {
      vehicleName: "Honda Activa 6G",
      brand: "Honda",
      model: "Activa 6G",
      variant: "Standard",
      modelYear: "2023",
      type: "two-wheeler",
      bodyType: "Scooter",
      fuelType: "petrol",
      transmission: "automatic",
      priceDaily: "499",
      priceWeekly: "2999",
      priceMonthly: "9999",
      depositAmount: "2000",
      engineCC: "110",
      mileageKmpl: "45",
      seatingCapacity: "2",
      color: "White",
      features: "Helmet, Mobile holder, USB charger",
    },
  },
  {
    label: "Ola S1 Pro",
    data: {
      vehicleName: "Ola S1 Pro",
      brand: "Ola",
      model: "S1 Pro",
      variant: "Electric",
      modelYear: "2024",
      type: "two-wheeler",
      bodyType: "Electric Scooter",
      fuelType: "electric",
      transmission: "automatic",
      priceDaily: "799",
      priceWeekly: "4499",
      priceMonthly: "14999",
      depositAmount: "3000",
      batteryRangeKm: "170",
      seatingCapacity: "2",
      color: "Black",
      features: "Fast charging, Bluetooth, Navigation",
    },
  },
  {
    label: "Maruti Swift",
    data: {
      vehicleName: "Maruti Suzuki Swift",
      brand: "Maruti Suzuki",
      model: "Swift",
      variant: "VXI",
      modelYear: "2022",
      type: "four-wheeler",
      bodyType: "Hatchback",
      fuelType: "petrol",
      transmission: "manual",
      priceDaily: "1999",
      priceWeekly: "11999",
      priceMonthly: "39999",
      depositAmount: "8000",
      mileageKmpl: "20",
      seatingCapacity: "5",
      color: "Red",
      features: "AC, Music system, Airbags",
    },
  },
  {
    label: "Hyundai Creta",
    data: {
      vehicleName: "Hyundai Creta",
      brand: "Hyundai",
      model: "Creta",
      variant: "SX",
      modelYear: "2023",
      type: "four-wheeler",
      bodyType: "SUV",
      fuelType: "diesel",
      transmission: "automatic",
      priceDaily: "3499",
      priceWeekly: "20999",
      priceMonthly: "69999",
      depositAmount: "12000",
      mileageKmpl: "18",
      seatingCapacity: "5",
      color: "White",
      features: "Sunroof, AC, Reverse camera, Airbags",
    },
  },
];

function OwnerDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState(emptyVehicleForm);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");

      const [vehiclesRes, bookingsRes] = await Promise.all([
        API.get("/vehicles/owner/my-vehicles"),
        API.get("/bookings/owner/bookings"),
      ]);

      setVehicles(vehiclesRes.data?.vehicles || vehiclesRes.data || []);
      setBookings(bookingsRes.data?.bookings || bookingsRes.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoRefresh(fetchDashboard, 30000);

  const analytics = useMemo(() => {
    const paidBookings = bookings.filter(
      (booking) => booking.paymentStatus === "paid",
    );

    const completedBookings = bookings.filter(
      (booking) => booking.status === "completed",
    );

    const pendingBookings = bookings.filter(
      (booking) => booking.status === "pending",
    );

    const approvedBookings = bookings.filter(
      (booking) => booking.status === "approved",
    );

    const totalRevenue = paidBookings.reduce(
      (sum, booking) => sum + getBookingAmount(booking),
      0,
    );

    const activeVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "available",
    );

    return {
      totalRevenue,
      totalVehicles: vehicles.length,
      activeVehicles: activeVehicles.length,
      pendingBookings: pendingBookings.length,
      approvedBookings: approvedBookings.length,
      paidBookings: paidBookings.length,
      completedBookings: completedBookings.length,
    };
  }, [vehicles, bookings]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      ...preset.data,
    }));
  };

  const resetForm = () => {
    setFormData(emptyVehicleForm);
    setEditingId(null);
  };

  const makePayload = () => {
    return {
      vehicleName: formData.vehicleName.trim(),
      vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      variant: formData.variant.trim(),
      modelYear: Number(formData.modelYear),
      type: formData.type,
      bodyType: formData.bodyType.trim(),
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      priceDaily: Number(formData.priceDaily || 0),
      priceWeekly: Number(formData.priceWeekly || 0),
      priceMonthly: Number(formData.priceMonthly || 0),
      depositAmount: Number(formData.depositAmount || 0),
      location: formData.location.trim(),
      description: formData.description.trim(),
      images: formData.images
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      specs: {
        engineCC: formData.engineCC ? Number(formData.engineCC) : null,
        batteryRangeKm: formData.batteryRangeKm
          ? Number(formData.batteryRangeKm)
          : null,
        mileageKmpl: formData.mileageKmpl ? Number(formData.mileageKmpl) : null,
        seatingCapacity: formData.seatingCapacity
          ? Number(formData.seatingCapacity)
          : null,
        color: formData.color.trim(),
        features: formData.features
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    };
  };

  const submitVehicle = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = makePayload();

      if (editingId) {
        await API.put(`/vehicles/${editingId}`, payload);
        setMessage("Vehicle updated successfully.");
      } else {
        await API.post("/vehicles", payload);
        setMessage("Vehicle added successfully. Waiting for admin approval.");
      }

      resetForm();
      fetchDashboard();
      setActiveTab("vehicles");
    } catch (error) {
      setError(error.response?.data?.message || "Vehicle save failed");
    } finally {
      setSaving(false);
    }
  };

  const editVehicle = (vehicle) => {
    setEditingId(vehicle._id);

    setFormData({
      vehicleName: vehicle.vehicleName || "",
      vehicleNumber: vehicle.vehicleNumber || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      variant: vehicle.variant || "",
      modelYear: vehicle.modelYear || "",
      type: vehicle.type || "two-wheeler",
      bodyType: vehicle.bodyType || "",
      fuelType: vehicle.fuelType || "petrol",
      transmission: vehicle.transmission || "manual",
      priceDaily: vehicle.priceDaily || "",
      priceWeekly: vehicle.priceWeekly || "",
      priceMonthly: vehicle.priceMonthly || "",
      depositAmount: vehicle.depositAmount || "",
      location: vehicle.location || "",
      description: vehicle.description || "",
      images: Array.isArray(vehicle.images) ? vehicle.images.join(", ") : "",
      engineCC: vehicle.specs?.engineCC || "",
      batteryRangeKm: vehicle.specs?.batteryRangeKm || "",
      mileageKmpl: vehicle.specs?.mileageKmpl || "",
      seatingCapacity: vehicle.specs?.seatingCapacity || "",
      color: vehicle.specs?.color || "",
      features: Array.isArray(vehicle.specs?.features)
        ? vehicle.specs.features.join(", ")
        : "",
    });

    setActiveTab("add");
  };

  const deleteVehicle = async (vehicleId) => {
    if (!window.confirm("Delete this vehicle?")) return;

    try {
      setError("");
      setMessage("");

      await API.delete(`/vehicles/${vehicleId}`);
      setMessage("Vehicle deleted successfully.");
      fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || "Delete failed");
    }
  };

  const updateVehicleStatus = async (vehicleId, status) => {
    try {
      setError("");
      setMessage("");

      await API.put(`/vehicles/${vehicleId}/status`, { status });
      setMessage("Vehicle status updated.");
      fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || "Status update failed");
    }
  };

  const approveBooking = async (bookingId) => {
    try {
      setError("");
      setMessage("");

      await API.put(`/bookings/${bookingId}/approve`);
      setMessage("Booking approved successfully.");
      fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || "Booking approval failed");
    }
  };

  const rejectBooking = async (bookingId) => {
    const reason =
      window.prompt("Enter rejection reason", "Rejected by owner") ||
      "Rejected by owner";

    try {
      setError("");
      setMessage("");

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
    if (!window.confirm("Mark this paid booking as completed/returned?"))
      return;

    try {
      setError("");
      setMessage("");

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
    { key: "bookings", label: "Bookings" },
    { key: "add", label: editingId ? "Edit Vehicle" : "Add Vehicle" },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
          Loading owner dashboard...
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
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
                Owner Panel
              </p>
              <h1 className="mt-2 text-3xl font-black text-white">
                Owner Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Manage vehicles, bookings, returns and revenue analytics.
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
                    ? "bg-blue-600 text-white"
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
                value={formatPrice(analytics.totalRevenue)}
                icon={<IndianRupee size={24} />}
              />
              <StatCard
                title="Total Vehicles"
                value={analytics.totalVehicles}
                icon={<Car size={24} />}
              />
              <StatCard
                title="Paid Bookings"
                value={analytics.paidBookings}
                icon={<CheckCircle2 size={24} />}
              />
              <StatCard
                title="Completed Trips"
                value={analytics.completedBookings}
                icon={<CalendarCheck size={24} />}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6">
                <BarChart3 className="mb-4 text-blue-300" />
                <p className="text-sm text-slate-400">Pending requests</p>
                <h3 className="mt-1 text-4xl font-black text-white">
                  {analytics.pendingBookings}
                </h3>
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6">
                <CheckCircle2 className="mb-4 text-emerald-300" />
                <p className="text-sm text-slate-400">Approved bookings</p>
                <h3 className="mt-1 text-4xl font-black text-white">
                  {analytics.approvedBookings}
                </h3>
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6">
                <Car className="mb-4 text-purple-300" />
                <p className="text-sm text-slate-400">Available vehicles</p>
                <h3 className="mt-1 text-4xl font-black text-white">
                  {analytics.activeVehicles}
                </h3>
              </div>
            </div>
          </section>
        )}

        {activeTab === "vehicles" && (
          <section>
            {vehicles.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
                No vehicles added yet.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle._id}
                    vehicle={vehicle}
                    isOwnerView
                    onEdit={editVehicle}
                    onDelete={deleteVehicle}
                    onUpdateStatus={updateVehicleStatus}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "bookings" && (
          <section className="space-y-5">
            {bookings.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
                No bookings yet.
              </div>
            ) : (
              bookings.map((booking) => {
                const amount = getBookingAmount(booking);
                const vehicle = booking.vehicle || {};
                const customer = booking.customer || {};

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

        {activeTab === "add" && (
          <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {editingId ? "Edit Vehicle" : "Add New Vehicle"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Add complete vehicle details for admin approval.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-black text-white hover:bg-slate-700"
              >
                Clear Form
              </button>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-black text-slate-200 hover:bg-slate-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={submitVehicle}
              className="grid gap-4 md:grid-cols-2"
            >
              <input
                name="vehicleName"
                value={formData.vehicleName}
                onChange={handleChange}
                placeholder="Vehicle name"
                required
                className="input-style"
              />

              <input
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="Vehicle number"
                required
                className="input-style"
              />

              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Brand"
                required
                className="input-style"
              />

              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Model"
                required
                className="input-style"
              />

              <input
                name="variant"
                value={formData.variant}
                onChange={handleChange}
                placeholder="Variant"
                className="input-style"
              />

              <input
                name="modelYear"
                type="number"
                value={formData.modelYear}
                onChange={handleChange}
                placeholder="Model year"
                required
                className="input-style"
              />

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-style"
              >
                <option value="two-wheeler">Two Wheeler</option>
                <option value="four-wheeler">Four Wheeler</option>
              </select>

              <input
                name="bodyType"
                value={formData.bodyType}
                onChange={handleChange}
                placeholder="Body type"
                className="input-style"
              />

              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="input-style"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="cng">CNG</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="input-style"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>

              <input
                name="priceDaily"
                type="number"
                value={formData.priceDaily}
                onChange={handleChange}
                placeholder="Daily price"
                required
                className="input-style"
              />

              <input
                name="priceWeekly"
                type="number"
                value={formData.priceWeekly}
                onChange={handleChange}
                placeholder="Weekly price"
                required
                className="input-style"
              />

              <input
                name="priceMonthly"
                type="number"
                value={formData.priceMonthly}
                onChange={handleChange}
                placeholder="Monthly price"
                required
                className="input-style"
              />

              <input
                name="depositAmount"
                type="number"
                value={formData.depositAmount}
                onChange={handleChange}
                placeholder="Deposit amount"
                className="input-style"
              />

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                required
                className="input-style"
              />

              <input
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="Image URLs separated by comma"
                className="input-style"
              />

              <input
                name="engineCC"
                type="number"
                value={formData.engineCC}
                onChange={handleChange}
                placeholder="Engine CC"
                className="input-style"
              />

              <input
                name="batteryRangeKm"
                type="number"
                value={formData.batteryRangeKm}
                onChange={handleChange}
                placeholder="Battery range KM"
                className="input-style"
              />

              <input
                name="mileageKmpl"
                type="number"
                value={formData.mileageKmpl}
                onChange={handleChange}
                placeholder="Mileage KMPL"
                className="input-style"
              />

              <input
                name="seatingCapacity"
                type="number"
                value={formData.seatingCapacity}
                onChange={handleChange}
                placeholder="Seating capacity"
                className="input-style"
              />

              <input
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Color"
                className="input-style"
              />

              <input
                name="features"
                value={formData.features}
                onChange={handleChange}
                placeholder="Features separated by comma"
                className="input-style"
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                rows="4"
                className="input-style md:col-span-2"
              />

              <button
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white hover:bg-blue-500 disabled:opacity-60 md:col-span-2"
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Vehicle"
                    : "Add Vehicle"}
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

export default OwnerDashboard;
