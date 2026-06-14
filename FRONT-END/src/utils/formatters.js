export const formatPrice = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

export const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getBookingAmount = (booking) => {
  return Number(
    booking?.totalPrice ??
      booking?.totalAmount ??
      booking?.amount ??
      booking?.bookingAmount ??
      0,
  );
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const badgeClass = (status) => {
  const key = String(status || "").toLowerCase();

  if (["approved", "available", "paid", "completed", "active"].includes(key)) {
    return "border-emerald-900/60 bg-emerald-950/50 text-emerald-300";
  }

  if (["pending", "unpaid", "maintenance", "created"].includes(key)) {
    return "border-amber-900/60 bg-amber-950/50 text-amber-300";
  }

  if (["rejected", "cancelled", "failed", "inactive"].includes(key)) {
    return "border-red-900/60 bg-red-950/50 text-red-300";
  }

  return "border-slate-700 bg-slate-800 text-slate-300";
};
