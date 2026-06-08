import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import useAutoRefresh from "../hooks/useAutoRefresh";
import { triggerDataRefresh } from "../utils/dataRefresh";

const API_BASE_URL = "https://rento-backend-gmlw.onrender.com/api";

const authConfig = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

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
  status: "available",
};

const vehiclePresets = [
  {
    label: "Honda Activa 6G DLX",
    vehicleName: "Honda Activa 6G",
    brand: "Honda",
    model: "Activa 6G",
    variant: "DLX",
    type: "two-wheeler",
    bodyType: "scooter",
    fuelType: "petrol",
    transmission: "automatic",
    baseDaily: 450,
    image: "https://images.pexels.com/photos/2549941/pexels-photo-2549941.jpeg",
    description:
      "Reliable city scooter for daily commute, college travel and short-distance rentals.",
  },
  {
    label: "TVS Jupiter ZX",
    vehicleName: "TVS Jupiter",
    brand: "TVS",
    model: "Jupiter",
    variant: "ZX",
    type: "two-wheeler",
    bodyType: "scooter",
    fuelType: "petrol",
    transmission: "automatic",
    baseDaily: 430,
    image: "https://images.pexels.com/photos/2549941/pexels-photo-2549941.jpeg",
    description:
      "Comfortable scooter with good mileage and easy handling for city rides.",
  },
  {
    label: "Ola S1 Pro",
    vehicleName: "Ola S1 Pro",
    brand: "Ola Electric",
    model: "S1 Pro",
    variant: "Gen 2",
    type: "two-wheeler",
    bodyType: "electric-scooter",
    fuelType: "electric",
    transmission: "automatic",
    baseDaily: 650,
    image: "https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg",
    description:
      "Modern electric scooter with silent drive, smooth acceleration and low running cost.",
  },
  {
    label: "Royal Enfield Classic 350",
    vehicleName: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    model: "Classic 350",
    variant: "Signals",
    type: "two-wheeler",
    bodyType: "motorcycle",
    fuelType: "petrol",
    transmission: "manual",
    baseDaily: 850,
    image: "https://images.pexels.com/photos/2519374/pexels-photo-2519374.jpeg",
    description:
      "Cruiser motorcycle for weekend trips, highway rides and premium rentals.",
  },
  {
    label: "Yamaha MT-15 V2",
    vehicleName: "Yamaha MT-15",
    brand: "Yamaha",
    model: "MT-15",
    variant: "V2",
    type: "two-wheeler",
    bodyType: "motorcycle",
    fuelType: "petrol",
    transmission: "manual",
    baseDaily: 780,
    image: "https://images.pexels.com/photos/2519374/pexels-photo-2519374.jpeg",
    description:
      "Sporty street motorcycle for riders who want performance and style.",
  },
  {
    label: "Maruti Suzuki Swift ZXI",
    vehicleName: "Maruti Suzuki Swift",
    brand: "Maruti Suzuki",
    model: "Swift",
    variant: "ZXI",
    type: "four-wheeler",
    bodyType: "hatchback",
    fuelType: "petrol",
    transmission: "manual",
    baseDaily: 1600,
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
    description:
      "Compact hatchback with easy city handling and good fuel efficiency.",
  },
  {
    label: "Hyundai i20 Sportz",
    vehicleName: "Hyundai i20",
    brand: "Hyundai",
    model: "i20",
    variant: "Sportz",
    type: "four-wheeler",
    bodyType: "hatchback",
    fuelType: "petrol",
    transmission: "manual",
    baseDaily: 1750,
    image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
    description:
      "Premium hatchback for city rides, short trips and comfortable daily use.",
  },
  {
    label: "Honda City VX",
    vehicleName: "Honda City",
    brand: "Honda",
    model: "City",
    variant: "VX",
    type: "four-wheeler",
    bodyType: "sedan",
    fuelType: "petrol",
    transmission: "manual",
    baseDaily: 2400,
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    description:
      "Comfortable sedan for business travel, family rides and long routes.",
  },
  {
    label: "Hyundai Creta SX",
    vehicleName: "Hyundai Creta",
    brand: "Hyundai",
    model: "Creta",
    variant: "SX",
    type: "four-wheeler",
    bodyType: "suv",
    fuelType: "petrol",
    transmission: "automatic",
    baseDaily: 3200,
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    description:
      "Feature-rich compact SUV for family trips, business rides and touring.",
  },
  {
    label: "Kia Seltos HTX",
    vehicleName: "Kia Seltos",
    brand: "Kia",
    model: "Seltos",
    variant: "HTX",
    type: "four-wheeler",
    bodyType: "suv",
    fuelType: "petrol",
    transmission: "automatic",
    baseDaily: 3400,
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    description:
      "Premium SUV with strong road presence and comfortable cabin features.",
  },
  {
    label: "Tata Nexon EV",
    vehicleName: "Tata Nexon EV",
    brand: "Tata",
    model: "Nexon EV",
    variant: "Empowered",
    type: "four-wheeler",
    bodyType: "electric-car",
    fuelType: "electric",
    transmission: "automatic",
    baseDaily: 3600,
    image: "https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg",
    description:
      "Electric compact SUV with silent drive, low running cost and modern tech.",
  },
  {
    label: "Toyota Innova Hycross",
    vehicleName: "Toyota Innova Hycross",
    brand: "Toyota",
    model: "Innova Hycross",
    variant: "VX Hybrid",
    type: "four-wheeler",
    bodyType: "mpv",
    fuelType: "hybrid",
    transmission: "automatic",
    baseDaily: 4500,
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    description:
      "Spacious MPV for family trips, airport transfers and group travel.",
  },
  {
    label: "Mahindra XUV700 AX7",
    vehicleName: "Mahindra XUV700",
    brand: "Mahindra",
    model: "XUV700",
    variant: "AX7",
    type: "four-wheeler",
    bodyType: "suv",
    fuelType: "diesel",
    transmission: "automatic",
    baseDaily: 4800,
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    description:
      "Powerful premium SUV for long-distance trips, large families and touring.",
  },
  {
    label: "Toyota Fortuner 4x2 AT",
    vehicleName: "Toyota Fortuner",
    brand: "Toyota",
    model: "Fortuner",
    variant: "4x2 AT",
    type: "four-wheeler",
    bodyType: "suv",
    fuelType: "diesel",
    transmission: "automatic",
    baseDaily: 6200,
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    description:
      "Luxury SUV for premium rentals, highway touring and executive travel.",
  },
];

const locations = ["Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Sambalpur"];

const colors = [
  "White",
  "Black",
  "Silver",
  "Grey",
  "Red",
  "Blue",
  "Green",
  "Yellow",
];

const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateVehicleNumber = () => {
  const cityCode = randomNumber(1, 30).toString().padStart(2, "0");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const first = letters[randomNumber(0, letters.length - 1)];
  const second = letters[randomNumber(0, letters.length - 1)];
  const number = randomNumber(1000, 9999);

  return `OD-${cityCode}-${first}${second}-${number}`;
};

const buildRandomVehicleFromPreset = (preset) => {
  const modelYear = randomNumber(2022, 2026);
  const priceDaily = Math.round(
    (preset.baseDaily * randomNumber(90, 115)) / 100,
  );
  const priceWeekly = Math.round(priceDaily * 6);
  const priceMonthly = Math.round(priceDaily * 20);
  const depositAmount = Math.round(priceDaily * randomNumber(3, 6));

  return {
    vehicleName: preset.vehicleName,
    vehicleNumber: generateVehicleNumber(),
    brand: preset.brand,
    model: preset.model,
    variant: preset.variant,
    modelYear,
    type: preset.type,
    bodyType: preset.bodyType,
    fuelType: preset.fuelType,
    transmission: preset.transmission,
    priceDaily,
    priceWeekly,
    priceMonthly,
    depositAmount,
    location: locations[randomNumber(0, locations.length - 1)],
    description: preset.description,
    images: preset.image,
    status: "available",
    specs: {
      color: colors[randomNumber(0, colors.length - 1)],
      seatingCapacity:
        preset.type === "two-wheeler" ? 2 : preset.bodyType === "mpv" ? 7 : 5,
      mileageKmpl:
        preset.fuelType === "electric"
          ? null
          : preset.type === "two-wheeler"
            ? randomNumber(35, 55)
            : randomNumber(12, 22),
      batteryRangeKm:
        preset.fuelType === "electric" ? randomNumber(120, 420) : null,
      features:
        preset.type === "two-wheeler"
          ? ["Self start", "LED headlamp", "Digital console"]
          : ["Air conditioning", "Bluetooth audio", "Rear parking camera"],
    },
  };
};

function OwnerDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyVehicleForm);
  const [presetIndex, setPresetIndex] = useState("");
  const [generatedSpecs, setGeneratedSpecs] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedPreset = useMemo(() => {
    if (presetIndex === "") return null;
    return vehiclePresets[Number(presetIndex)];
  }, [presetIndex]);

  const fetchOwnerData = useCallback(async () => {
    try {
      const [vehiclesRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/vehicles/owner/my-vehicles`, authConfig()),
        axios.get(`${API_BASE_URL}/bookings/owner/bookings`, authConfig()),
      ]);

      setVehicles(
        Array.isArray(vehiclesRes.data)
          ? vehiclesRes.data
          : vehiclesRes.data.vehicles || [],
      );

      setBookings(
        Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : bookingsRes.data.bookings || [],
      );
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load owner data");
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoRefresh(fetchOwnerData, 15000);

  const applyPreset = (preset = selectedPreset) => {
    if (!preset) {
      alert("Please choose a vehicle preset first");
      return;
    }

    const generatedVehicle = buildRandomVehicleFromPreset(preset);

    setForm({
      vehicleName: generatedVehicle.vehicleName,
      vehicleNumber: generatedVehicle.vehicleNumber,
      brand: generatedVehicle.brand,
      model: generatedVehicle.model,
      variant: generatedVehicle.variant,
      modelYear: generatedVehicle.modelYear,
      type: generatedVehicle.type,
      bodyType: generatedVehicle.bodyType,
      fuelType: generatedVehicle.fuelType,
      transmission: generatedVehicle.transmission,
      priceDaily: generatedVehicle.priceDaily,
      priceWeekly: generatedVehicle.priceWeekly,
      priceMonthly: generatedVehicle.priceMonthly,
      depositAmount: generatedVehicle.depositAmount,
      location: generatedVehicle.location,
      description: generatedVehicle.description,
      images: generatedVehicle.images,
      status: "available",
    });

    setGeneratedSpecs(generatedVehicle.specs);
    setEditingId(null);
  };

  const generateRandomVehicle = () => {
    const randomPreset =
      vehiclePresets[randomNumber(0, vehiclePresets.length - 1)];

    const index = vehiclePresets.findIndex(
      (item) => item.label === randomPreset.label,
    );

    setPresetIndex(index.toString());
    applyPreset(randomPreset);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm(emptyVehicleForm);
    setGeneratedSpecs(null);
    setEditingId(null);
    setPresetIndex("");
  };

  const buildPayload = () => {
    return {
      ...form,
      modelYear: Number(form.modelYear),
      priceDaily: Number(form.priceDaily),
      priceWeekly: Number(form.priceWeekly),
      priceMonthly: Number(form.priceMonthly),
      depositAmount: Number(form.depositAmount || 0),
      images: form.images
        ? form.images
            .split(",")
            .map((img) => img.trim())
            .filter(Boolean)
        : [],
      specs: generatedSpecs || {},
    };
  };

  const submitVehicle = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = buildPayload();

      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/vehicles/${editingId}`,
          payload,
          authConfig(),
        );

        alert("Vehicle updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/vehicles`, payload, authConfig());

        alert("Vehicle added successfully. Waiting for admin approval.");
      }

      resetForm();
      triggerDataRefresh();
      await fetchOwnerData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  };

  const editVehicle = (vehicle) => {
    setEditingId(vehicle._id);

    setForm({
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
      images: vehicle.images?.join(", ") || "",
      status: vehicle.status || "available",
    });

    setGeneratedSpecs(vehicle.specs || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteVehicle = async (vehicleId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/vehicles/${vehicleId}`, authConfig());

      triggerDataRefresh();
      await fetchOwnerData();
      alert("Vehicle deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const updateVehicleStatus = async (vehicleId, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/vehicles/${vehicleId}/status`,
        { status },
        authConfig(),
      );

      triggerDataRefresh();
      await fetchOwnerData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update vehicle status");
    }
  };

  const approveBooking = async (bookingId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/bookings/${bookingId}/approve`,
        {},
        authConfig(),
      );

      triggerDataRefresh();
      await fetchOwnerData();
      alert("Booking approved");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve booking");
    }
  };

  const rejectBooking = async (bookingId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/bookings/${bookingId}/reject`,
        {},
        authConfig(),
      );

      triggerDataRefresh();
      await fetchOwnerData();
      alert("Booking rejected");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject booking");
    }
  };

  const badgeClass = (status) => {
    if (status === "approved" || status === "available" || status === "paid") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (status === "pending" || status === "unpaid") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (
      status === "rejected" ||
      status === "maintenance" ||
      status === "failed"
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Owner Panel
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-950">
                Owner Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Choose a vehicle preset, auto-generate realistic details, then
                add it to your fleet.
              </p>
            </div>

            <button
              onClick={fetchOwnerData}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-10 text-center text-slate-500 shadow-sm">
            Loading owner dashboard...
          </div>
        ) : (
          <>
            <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
              <h2 className="text-xl font-black text-slate-950">
                Quick Vehicle Generator
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select any vehicle variant or generate a random vehicle. Details
                like year, number, price, location and image will auto-fill.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_auto]">
                <select
                  value={presetIndex}
                  onChange={(e) => setPresetIndex(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="">Choose vehicle variant</option>
                  {vehiclePresets.map((preset, index) => (
                    <option key={preset.label} value={index}>
                      {preset.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => applyPreset()}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Use Selected
                </button>

                <button
                  type="button"
                  onClick={generateRandomVehicle}
                  className="rounded-2xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-100"
                >
                  Generate Random
                </button>
              </div>

              {form.vehicleName && (
                <div className="mt-5 grid gap-4 rounded-3xl bg-slate-50 p-4 md:grid-cols-[140px_1fr]">
                  <img
                    src={
                      form.images || "https://placehold.co/500x300?text=Vehicle"
                    }
                    alt={form.vehicleName}
                    className="h-28 w-full rounded-2xl object-cover"
                  />

                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      {form.vehicleName} {form.variant && `(${form.variant})`}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {form.brand} • {form.model} • {form.modelYear} •{" "}
                      {form.location}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {form.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                        ₹{form.priceDaily}/day
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                        {form.fuelType}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                        {form.transmission}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                        {form.vehicleNumber}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={submitVehicle}
              className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl"
            >
              <h2 className="text-xl font-black text-slate-950">
                {editingId ? "Edit Vehicle" : "Add Vehicle"}
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <input
                  name="vehicleName"
                  value={form.vehicleName}
                  onChange={handleChange}
                  placeholder="Vehicle name"
                  required
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  placeholder="Vehicle number"
                  required
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none"
                />

                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Brand"
                  required
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Model"
                  required
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  name="variant"
                  value={form.variant}
                  onChange={handleChange}
                  placeholder="Variant"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  name="modelYear"
                  type="number"
                  value={form.modelYear}
                  onChange={handleChange}
                  placeholder="Model year"
                  required
                  min="2022"
                  max="2026"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                >
                  <option value="two-wheeler">Two Wheeler</option>
                  <option value="four-wheeler">Four Wheeler</option>
                </select>

                <input
                  name="bodyType"
                  value={form.bodyType}
                  onChange={handleChange}
                  placeholder="Body type"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <select
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="cng">CNG</option>
                  <option value="hybrid">Hybrid</option>
                </select>

                <select
                  name="transmission"
                  value={form.transmission}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Location"
                  required
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  name="depositAmount"
                  type="number"
                  value={form.depositAmount}
                  onChange={handleChange}
                  placeholder="Deposit amount"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  name="priceDaily"
                  type="number"
                  value={form.priceDaily}
                  onChange={handleChange}
                  placeholder="Daily price"
                  required
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  name="priceWeekly"
                  type="number"
                  value={form.priceWeekly}
                  onChange={handleChange}
                  placeholder="Weekly price"
                  required
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  name="priceMonthly"
                  type="number"
                  value={form.priceMonthly}
                  onChange={handleChange}
                  placeholder="Monthly price"
                  required
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  name="images"
                  value={form.images}
                  onChange={handleChange}
                  placeholder="Image URL"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-3"
                />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Vehicle description"
                  rows="3"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-3"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  disabled={saving}
                  className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Vehicle"
                      : "Add Vehicle"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                >
                  Clear Form
                </button>
              </div>
            </form>

            <div className="grid gap-8 xl:grid-cols-2">
              <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
                <h2 className="text-xl font-black text-slate-950">
                  My Vehicles
                </h2>

                <div className="mt-5 space-y-4">
                  {vehicles.length === 0 ? (
                    <p className="text-sm text-slate-500">No vehicles added.</p>
                  ) : (
                    vehicles.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <h3 className="font-black text-slate-950">
                              {vehicle.vehicleName}
                            </h3>

                            <p className="text-sm text-slate-500">
                              {vehicle.vehicleNumber} • {vehicle.brand}{" "}
                              {vehicle.model}
                            </p>
                          </div>

                          <span
                            className={`h-fit rounded-full border px-3 py-1 text-xs font-bold capitalize ${badgeClass(
                              vehicle.approvalStatus,
                            )}`}
                          >
                            {vehicle.approvalStatus}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${badgeClass(
                              vehicle.status,
                            )}`}
                          >
                            {vehicle.status}
                          </span>

                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                            ₹{vehicle.priceDaily}/day
                          </span>

                          {vehicle.modelYear && (
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                              {vehicle.modelYear}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => editVehicle(vehicle)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              updateVehicleStatus(
                                vehicle._id,
                                vehicle.status === "maintenance"
                                  ? "available"
                                  : "maintenance",
                              )
                            }
                            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                          >
                            {vehicle.status === "maintenance"
                              ? "Set Available"
                              : "Set Maintenance"}
                          </button>

                          <button
                            onClick={() => deleteVehicle(vehicle._id)}
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
                <h2 className="text-xl font-black text-slate-950">
                  Booking Requests
                </h2>

                <div className="mt-5 space-y-4">
                  {bookings.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No booking requests.
                    </p>
                  ) : (
                    bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <h3 className="font-black text-slate-950">
                              {booking.vehicle?.vehicleName || "Vehicle"}
                            </h3>

                            <p className="text-sm text-slate-500">
                              Customer: {booking.user?.name || "N/A"}
                            </p>
                          </div>

                          <span
                            className={`h-fit rounded-full border px-3 py-1 text-xs font-bold capitalize ${badgeClass(
                              booking.status,
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                          <p>
                            Start:{" "}
                            <b>
                              {new Date(booking.startDate).toLocaleDateString()}
                            </b>
                          </p>

                          <p>
                            End:{" "}
                            <b>
                              {new Date(booking.endDate).toLocaleDateString()}
                            </b>
                          </p>

                          <p>
                            Plan: <b>{booking.rentalPlan}</b>
                          </p>

                          <p>
                            Amount: <b>₹{booking.totalAmount}</b>
                          </p>

                          <p>
                            Payment: <b>{booking.paymentStatus || "unpaid"}</b>
                          </p>
                        </div>

                        {booking.status === "pending" && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => approveBooking(booking._id)}
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => rejectBooking(booking._id)}
                              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default OwnerDashboard;
