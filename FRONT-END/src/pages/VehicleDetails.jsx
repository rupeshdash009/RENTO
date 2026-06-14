import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  Car,
  Fuel,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import API from "../api/axios";
import { formatDate, formatPrice } from "../utils/formatters";

function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [bookingForm, setBookingForm] = useState({
    startDate: "",
    endDate: "",
    rentalPlan: "daily",
  });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const vehicleRes = await API.get(`/vehicles/${id}`);
      const vehicleData = vehicleRes.data?.vehicle || vehicleRes.data;

      const reviewsRes = await API.get(`/reviews/vehicle/${id}`).catch(() => ({
        data: { reviews: [] },
      }));

      const unavailableRes = await API.get(
        `/bookings/vehicle/${id}/unavailable-dates`,
      ).catch(() => ({
        data: { unavailableDates: [] },
      }));

      setVehicle(vehicleData);
      setReviews(reviewsRes.data?.reviews || []);
      setUnavailableDates(unavailableRes.data?.unavailableDates || []);
    } catch (error) {
      setError(error.response?.data?.message || "Vehicle not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const imageUrl = Array.isArray(vehicle?.images)
    ? vehicle.images.find(Boolean)
    : vehicle?.images;

  const totalEstimate = useMemo(() => {
    if (!vehicle || !bookingForm.startDate || !bookingForm.endDate) return 0;

    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) return 0;

    if (bookingForm.rentalPlan === "weekly") {
      return Math.ceil(days / 7) * Number(vehicle.priceWeekly || 0);
    }

    if (bookingForm.rentalPlan === "monthly") {
      return Math.ceil(days / 30) * Number(vehicle.priceMonthly || 0);
    }

    return days * Number(vehicle.priceDaily || 0);
  }, [vehicle, bookingForm]);

  const handleChange = (event) => {
    setBookingForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleBooking = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    let user = null;

    try {
      user = savedUser ? JSON.parse(savedUser) : null;
    } catch {
      user = null;
    }

    if (!token || user?.role !== "customer") {
      navigate("/customer-login");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");
      setMessage("");

      const res = await API.post("/bookings", {
        vehicleId: id,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        rentalPlan: bookingForm.rentalPlan,
      });

      setMessage(res.data?.message || "Booking request sent successfully");
      setBookingForm({
        startDate: "",
        endDate: "",
        rentalPlan: "daily",
      });

      fetchDetails();
    } catch (error) {
      setError(error.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
          Loading vehicle details...
        </div>
      </main>
    );
  }

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-red-900/60 bg-red-950/40 p-8 text-center text-red-300">
          {error || "Vehicle not found"}
        </div>
      </main>
    );
  }

  const specs = vehicle.specs || {};

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-black text-slate-200 hover:bg-slate-800"
        >
          <ArrowLeft size={17} />
          Back to vehicles
        </Link>

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

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-black/30">
            <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-slate-950">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={vehicle.vehicleName}
                  className="h-full max-h-[480px] w-full object-cover"
                />
              ) : vehicle.type === "two-wheeler" ? (
                <Bike size={96} className="text-blue-300" />
              ) : (
                <Car size={96} className="text-purple-300" />
              )}
            </div>

            <div className="mt-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">
                    Vehicle Details
                  </p>

                  <h1 className="mt-2 text-4xl font-black text-white">
                    {vehicle.vehicleName}
                  </h1>

                  <p className="mt-2 text-slate-300">
                    {vehicle.brand} {vehicle.model}{" "}
                    {vehicle.modelYear ? `• ${vehicle.modelYear}` : ""}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-900/60 bg-amber-950/40 px-4 py-3">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Star size={18} className="fill-amber-400 text-amber-400" />
                    <span className="text-lg font-black">
                      {vehicle.averageRating || 0}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {vehicle.reviewCount || reviews.length || 0} reviews
                  </p>
                </div>
              </div>

              <p className="mt-5 leading-7 text-slate-300">
                {vehicle.description ||
                  "Clean and verified rental vehicle available on Rento."}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <MapPin className="mb-3 text-blue-300" />
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="mt-1 font-black text-white">
                    {vehicle.location}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <Fuel className="mb-3 text-purple-300" />
                  <p className="text-xs text-slate-400">Fuel</p>
                  <p className="mt-1 font-black capitalize text-white">
                    {vehicle.fuelType} • {vehicle.transmission}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <ShieldCheck className="mb-3 text-emerald-300" />
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="mt-1 font-black capitalize text-white">
                    {vehicle.status}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <UserRound className="mb-3 text-indigo-300" />
                  <p className="text-xs text-slate-400">Owner</p>
                  <p className="mt-1 font-black text-white">
                    {vehicle.owner?.name || "Rento Owner"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5">
                <h2 className="text-xl font-black text-white">Vehicle specs</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <p className="rounded-2xl bg-slate-900 p-3 text-sm text-slate-300">
                    Body:{" "}
                    <span className="font-black text-white">
                      {vehicle.bodyType || "Standard"}
                    </span>
                  </p>

                  <p className="rounded-2xl bg-slate-900 p-3 text-sm text-slate-300">
                    Seats:{" "}
                    <span className="font-black text-white">
                      {specs.seatingCapacity || "—"}
                    </span>
                  </p>

                  <p className="rounded-2xl bg-slate-900 p-3 text-sm text-slate-300">
                    Mileage/Range:{" "}
                    <span className="font-black text-white">
                      {specs.mileageKmpl || specs.batteryRangeKm || "—"}
                    </span>
                  </p>

                  <p className="rounded-2xl bg-slate-900 p-3 text-sm text-slate-300">
                    Engine:{" "}
                    <span className="font-black text-white">
                      {specs.engineCC || "—"}
                    </span>
                  </p>

                  <p className="rounded-2xl bg-slate-900 p-3 text-sm text-slate-300">
                    Color:{" "}
                    <span className="font-black text-white">
                      {specs.color || "—"}
                    </span>
                  </p>

                  <p className="rounded-2xl bg-slate-900 p-3 text-sm text-slate-300">
                    Deposit:{" "}
                    <span className="font-black text-white">
                      {formatPrice(vehicle.depositAmount)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
              <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-white">
                <IndianRupee />
                Pricing
              </h2>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Daily</p>
                  <p className="text-2xl font-black text-white">
                    {formatPrice(vehicle.priceDaily)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Weekly</p>
                  <p className="text-2xl font-black text-white">
                    {formatPrice(vehicle.priceWeekly)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Monthly</p>
                  <p className="text-2xl font-black text-white">
                    {formatPrice(vehicle.priceMonthly)}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleBooking}
              className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30"
            >
              <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-white">
                <CalendarDays />
                Book this vehicle
              </h2>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-300">
                    Start date
                  </span>

                  <input
                    type="datetime-local"
                    name="startDate"
                    value={bookingForm.startDate}
                    onChange={handleChange}
                    required
                    className="input-style"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-300">
                    End date
                  </span>

                  <input
                    type="datetime-local"
                    name="endDate"
                    value={bookingForm.endDate}
                    onChange={handleChange}
                    required
                    className="input-style"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-300">
                    Rental plan
                  </span>

                  <select
                    name="rentalPlan"
                    value={bookingForm.rentalPlan}
                    onChange={handleChange}
                    className="input-style"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>

                <div className="rounded-2xl border border-blue-900/60 bg-blue-950/40 p-4">
                  <p className="text-sm text-blue-200">Estimated total</p>
                  <p className="mt-1 text-3xl font-black text-white">
                    {formatPrice(totalEstimate)}
                  </p>
                </div>

                <button
                  disabled={bookingLoading}
                  className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {bookingLoading ? "Sending request..." : "Request Booking"}
                </button>
              </div>
            </form>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-white">
                <CalendarDays />
                Unavailable dates
              </h2>

              <div className="space-y-2">
                {unavailableDates.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No blocked dates yet.
                  </p>
                ) : (
                  unavailableDates.slice(0, 10).map((item, index) => (
                    <div
                      key={item._id || index}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300"
                    >
                      {formatDate(item.startDate)} → {formatDate(item.endDate)}
                      <span className="ml-2 text-slate-500">
                        ({item.reason || item.status || "booked"})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
          <h2 className="text-2xl font-black text-white">Customer reviews</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.length === 0 ? (
              <p className="text-slate-400">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="mb-2 flex gap-1">
                    {Array.from({ length: Number(review.rating || 0) }).map(
                      (_, index) => (
                        <Star
                          key={index}
                          size={15}
                          className="fill-amber-400 text-amber-400"
                        />
                      ),
                    )}
                  </div>

                  <p className="text-sm leading-6 text-slate-300">
                    {review.comment || "No comment added."}
                  </p>

                  <p className="mt-3 text-xs font-bold text-slate-500">
                    — {review.customer?.name || "Customer"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default VehicleDetails;
