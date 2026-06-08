import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import API from "../api/axios";
import PaymentButton from "../components/PaymentButton";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/my-bookings");
      setBookings(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm("Cancel this booking?");
    if (!confirmCancel) return;

    try {
      await API.put(`/bookings/${bookingId}/cancel`);
      getBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Cancel failed");
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl pt-8">
        <div className="glass-soft rounded-3xl p-8 text-center text-slate-600">
          Loading bookings...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl pt-8">
      <div className="mb-8">
        <h1 className="page-title text-4xl">My Bookings</h1>
        <p className="page-subtitle mt-3">
          Track your vehicle bookings and complete payment after owner approval.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-soft rounded-3xl p-8 text-center text-slate-600">
          No bookings found.
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <div key={booking._id} className="glass-soft rounded-3xl p-5">
              <div className="flex flex-col justify-between gap-5 md:flex-row">
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <CalendarCheck />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-950">
                      {booking.vehicle?.vehicleName || "Vehicle"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {booking.startDate?.slice(0, 10)} to{" "}
                      {booking.endDate?.slice(0, 10)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Plan: {booking.rentalPlan} • Total: ₹{booking.totalAmount}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`badge ${
                          booking.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : booking.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : booking.status === "cancelled"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        Booking: {booking.status}
                      </span>

                      <span
                        className={`badge ${
                          booking.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : booking.paymentStatus === "failed"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        Payment: {booking.paymentStatus || "unpaid"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {booking.status === "approved" &&
                    booking.paymentStatus !== "paid" && (
                      <PaymentButton
                        booking={booking}
                        onPaymentSuccess={getBookings}
                      />
                    )}

                  {booking.status === "pending" && (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                    >
                      Cancel
                    </button>
                  )}

                  {booking.paymentStatus === "paid" && (
                    <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
                      Paid
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBookings;
