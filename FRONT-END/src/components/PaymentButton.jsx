import { useState } from "react";
import { CreditCard } from "lucide-react";
import API from "../api/axios";
import loadRazorpayScript from "../utils/loadRazorpay";
import { triggerDataRefresh } from "../utils/dataRefresh";

function PaymentButton({ booking, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);

  const payHandler = async () => {
    try {
      setLoading(true);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        return;
      }

      const orderRes = await API.post(`/payments/create-order/${booking._id}`);
      const orderData = orderRes.data;
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Rento",
        description: `Payment for ${
          booking.vehicle?.vehicleName || "vehicle booking"
        }`,
        order_id: orderData.orderId,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },

        notes: {
          bookingId: booking._id,
        },

        theme: {
          color: "#2563eb",
        },

        handler: async function (response) {
          try {
            const verifyRes = await API.post("/payments/verify", {
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert(verifyRes.data.message || "Payment successful");
            triggerDataRefresh();

            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
          } catch (error) {
            alert(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },

        modal: {
          ondismiss: () => {
            alert("Payment popup closed.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={payHandler}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CreditCard size={18} />
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}

export default PaymentButton;
