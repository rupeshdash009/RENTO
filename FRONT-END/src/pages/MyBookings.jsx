import { useCallback, useState } from "react";
import { CalendarCheck, Car, RefreshCw, Star, XCircle } from "lucide-react";
import API from "../api/axios";
import PaymentButton from "../components/PaymentButton";
import useAutoRefresh from "../hooks/useAutoRefresh";
import {
  badgeClass,
  formatDate,
  formatPrice,
  getBookingAmount,
} from "../utils/formatters";

function ReviewBox({ booking, onReviewSaved }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submitReview = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await API.post("/reviews", {
        bookingId: booking._id,
        rating,
        comment,
      });

      setComment("");

      if (onReviewSaved) onReviewSaved();
    } catch (error) {
      setError(error.response?.data?.message || "Review save failed");
    } finally {
      setSaving(false);
    }
  };

  if (booking.status !== "completed") return null;

  return (
    <form
      onSubmit={submitReview}
      className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4"
    >
      <p className="mb-3 text-sm font-black text-white">Rate your trip</p>

      {error && <p className="mb-3 text-sm font-bold text-red-300">{error}</p>}

      <div className="mb-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRating(item)}
            className="text-amber-400"
          >
            <Star
              size={22}
              className={item <= rating ? "fill-amber-400" : ""}
            />
          </button>
        ))}
      </div>

      <textarea
        className="input-style"
        rows="3"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Write your review"
      />

      <button
        disabled={saving}
        className="mt-3 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-500 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Submit Review"}
      </button>
    </form>
  );
}

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setError("");

      const res = await API.get("/bookings/my-bookings");

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.bookings || [];

      setBookings(list);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoRefresh(fetchBookings, 30000);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking request?")) return;

    try {
      setMessage("");
      setError("");

      await API.put(`/bookings/${bookingId}/cancel`);

      setMessage("Booking cancelled successfully.");
      fetchBookings();
    } catch (error) {
      setError(error.response?.data?.message || "Booking cancel failed");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
          Loading bookings...
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
                Customer Panel
              </p>

              <h1 className="mt-2 text-3xl font-black text-white">
                My Bookings
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Track requests, payments, completed trips and reviews.
              </p>
            </div>

            <button
              onClick={fetchBookings}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 text-sm font-black text-white hover:bg-slate-700"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
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

        {bookings.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
            No bookings yet.
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const vehicle = booking.vehicle || {};
              const amount = getBookingAmount(booking);

              const canPay =
                booking.status === "approved" &&
                booking.paymentStatus !== "paid";

              const canCancel =
                ["pending", "approved"].includes(booking.status) &&
                booking.paymentStatus !== "paid";

              const imageUrl = Array.isArray(vehicle.images)
                ? vehicle.images.find(Boolean)
                : vehicle.images;

              return (
                <article
                  key={booking._id}
                  className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/20"
                >
                  <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                    <div className="flex h-48 items-center justify-center overflow-hidden rounded-3xl bg-slate-950">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={vehicle.vehicleName || "Vehicle"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Car size={64} className="text-blue-300" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                          <h2 className="text-2xl font-black text-white">
                            {vehicle.vehicleName || "Vehicle"}
                          </h2>

                          <p className="mt-1 text-sm text-slate-400">
                            {vehicle.brand} {vehicle.model}{" "}
                            {vehicle.location ? `• ${vehicle.location}` : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${badgeClass(
                              booking.status,
                            )}`}
                          >
                            Booking: {booking.status}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${badgeClass(
                              booking.paymentStatus,
                            )}`}
                          >
                            Payment: {booking.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs text-slate-400">Dates</p>
                          <p className="mt-1 font-black text-white">
                            {formatDate(booking.startDate)} →{" "}
                            {formatDate(booking.endDate)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs text-slate-400">Plan</p>
                          <p className="mt-1 font-black capitalize text-white">
                            {booking.rentalPlan || "daily"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs text-slate-400">Amount</p>
                          <p className="mt-1 font-black text-white">
                            {formatPrice(amount)}
                          </p>
                        </div>
                      </div>

                      {amount <= 0 && canPay && (
                        <div className="mt-4 rounded-2xl border border-amber-900/60 bg-amber-950/40 p-4 text-sm font-bold text-amber-300">
                          Amount is showing ₹0. Update vehicle price or recreate
                          booking.
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-3">
                        {canPay && (
                          <PaymentButton
                            booking={booking}
                            onPaymentSuccess={fetchBookings}
                          />
                        )}

                        {canCancel && (
                          <button
                            onClick={() => cancelBooking(booking._id)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-red-950/60 px-5 py-3 text-sm font-black text-red-300 hover:bg-red-950"
                          >
                            <XCircle size={17} />
                            Cancel
                          </button>
                        )}

                        {booking.status === "completed" && (
                          <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-900/60 bg-emerald-950/40 px-5 py-3 text-sm font-black text-emerald-300">
                            <CalendarCheck size={17} />
                            Trip completed
                          </span>
                        )}
                      </div>

                      <ReviewBox
                        booking={booking}
                        onReviewSaved={fetchBookings}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyBookings;
