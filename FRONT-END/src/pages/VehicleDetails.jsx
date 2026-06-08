import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bike,
  CalendarDays,
  Car,
  Fuel,
  IndianRupee,
  MapPin,
  Settings,
  ArrowLeft,
} from "lucide-react";
import API from "../api/axios";

function VehicleDetails() {
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    rentalPlan: "daily",
  });

  const today = new Date().toISOString().split("T")[0];

  const getVehicle = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/vehicles/${id}`);
      setVehicle(res.data);
    } catch (error) {
      console.log("VEHICLE DETAILS ERROR:", error);
      setError(error.response?.data?.message || "Vehicle not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getVehicle();
    }
  }, [id]);

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setBookingData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      if (name === "startDate" && prev.endDate && value > prev.endDate) {
        updatedData.endDate = "";
      }

      return updatedData;
    });
  };

  const bookingHandler = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!token || !user) {
      setError("Please login as customer before booking.");
      return;
    }

    if (user.role !== "customer") {
      setError("Only customers can book vehicles.");
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      setError("Please select start date and end date.");
      return;
    }

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Invalid date selected.");
      return;
    }

    if (end <= start) {
      setError("End date must be after start date.");
      return;
    }

    try {
      const res = await API.post("/bookings", {
        vehicleId: id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        rentalPlan: bookingData.rentalPlan,
      });

      setMessage(res.data.message || "Booking request sent successfully");

      setBookingData({
        startDate: "",
        endDate: "",
        rentalPlan: "daily",
      });
    } catch (error) {
      console.log("BOOKING ERROR:", error);
      setError(error.response?.data?.message || "Booking failed");
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl pt-8">
        <div className="glass-soft rounded-3xl p-8 text-center text-slate-600">
          Loading vehicle details...
        </div>
      </section>
    );
  }

  if (error && !vehicle) {
    return (
      <section className="mx-auto max-w-7xl pt-8">
        <div className="glass rounded-[2rem] p-8 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            Vehicle not found
          </h2>

          <p className="mt-3 text-slate-500">{error}</p>

          <Link
            to="/vehicles"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Vehicles
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl pt-8">
      <Link
        to="/vehicles"
        className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft size={18} />
        Back to Vehicles
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-[2rem] p-6">
          <div className="mb-6 flex h-80 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50 to-purple-50">
            {vehicle?.images?.length > 0 ? (
              <img
                src={vehicle.images[0]}
                alt={vehicle.vehicleName}
                className="h-full w-full object-cover"
              />
            ) : vehicle?.type === "two-wheeler" ? (
              <Bike size={120} className="text-blue-600" />
            ) : (
              <Car size={120} className="text-purple-600" />
            )}
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <h1 className="text-4xl font-black text-slate-950">
                {vehicle?.vehicleName || "Vehicle"}
              </h1>

              <p className="mt-2 text-slate-500">
                {vehicle?.brand || "Brand"} {vehicle?.model || ""}
                {vehicle?.modelYear ? ` • ${vehicle.modelYear}` : ""}
              </p>
            </div>

            <span
              className={`badge h-fit ${
                vehicle?.status === "available"
                  ? "bg-emerald-50 text-emerald-700"
                  : vehicle?.status === "maintenance"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {vehicle?.status || "available"}
            </span>
          </div>

          {vehicle?.approvalStatus && (
            <div className="mt-4">
              <span
                className={`badge ${
                  vehicle.approvalStatus === "approved"
                    ? "bg-emerald-50 text-emerald-700"
                    : vehicle.approvalStatus === "rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-yellow-50 text-yellow-700"
                }`}
              >
                Approval: {vehicle.approvalStatus}
              </span>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Info
              icon={<MapPin />}
              label="Location"
              value={vehicle?.location}
            />
            <Info icon={<Fuel />} label="Fuel Type" value={vehicle?.fuelType} />
            <Info
              icon={<Settings />}
              label="Transmission"
              value={vehicle?.transmission}
            />
            <Info icon={<Car />} label="Vehicle Type" value={vehicle?.type} />
          </div>

          <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xl font-black text-slate-950">
              Pricing Plans
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <Price title="Daily" price={vehicle?.priceDaily} />
              <Price title="Weekly" price={vehicle?.priceWeekly} />
              <Price title="Monthly" price={vehicle?.priceMonthly} />
            </div>
          </div>
        </div>

        <div className="glass h-fit rounded-[2rem] p-6">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CalendarDays />
          </div>

          <h2 className="text-3xl font-black text-slate-950">Book Vehicle</h2>

          <p className="mt-2 text-slate-500">
            Select date range and rental plan. Owner will approve your request.
          </p>

          {message && (
            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={bookingHandler} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Start Date
              </label>

              <input
                className="input-style"
                type="date"
                name="startDate"
                min={today}
                value={bookingData.startDate}
                onChange={changeHandler}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                End Date
              </label>

              <input
                className="input-style"
                type="date"
                name="endDate"
                min={bookingData.startDate || today}
                value={bookingData.endDate}
                onChange={changeHandler}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Rental Plan
              </label>

              <select
                className="input-style"
                name="rentalPlan"
                value={bookingData.rentalPlan}
                onChange={changeHandler}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <button className="btn-primary w-full" type="submit">
              Send Booking Request
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-3 text-blue-600">{icon}</div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-bold capitalize text-slate-950">
        {value || "Not added"}
      </p>
    </div>
  );
}

function Price({ title, price }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 flex items-center text-2xl font-black text-slate-950">
        <IndianRupee size={20} />
        {price || 0}
      </p>
    </div>
  );
}

export default VehicleDetails;
