import { useCallback, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import API from "../api/axios";
import useAutoRefresh from "../hooks/useAutoRefresh";
import VehicleCard from "../components/VehicleCard";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    fuelType: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  const fetchVehicles = useCallback(async () => {
    try {
      setMessage("");

      const res = await API.get("/vehicles");

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.vehicles || [];

      setVehicles(list);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoRefresh(fetchVehicles, 30000);

  const filteredVehicles = useMemo(() => {
    const search = filters.search.toLowerCase().trim();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !search ||
        `${vehicle.vehicleName} ${vehicle.brand} ${vehicle.model} ${vehicle.location}`
          .toLowerCase()
          .includes(search);

      const matchesType = !filters.type || vehicle.type === filters.type;
      const matchesFuel =
        !filters.fuelType || vehicle.fuelType === filters.fuelType;
      const matchesLocation =
        !filters.location || vehicle.location === filters.location;

      const price = Number(vehicle.priceDaily || 0);

      const matchesMin = !filters.minPrice || price >= Number(filters.minPrice);
      const matchesMax = !filters.maxPrice || price <= Number(filters.maxPrice);

      return (
        matchesSearch &&
        matchesType &&
        matchesFuel &&
        matchesLocation &&
        matchesMin &&
        matchesMax
      );
    });
  }, [vehicles, filters]);

  const locations = useMemo(() => {
    return [...new Set(vehicles.map((item) => item.location).filter(Boolean))];
  }, [vehicles]);

  const handleChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      type: "",
      fuelType: "",
      location: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">
                Rento Fleet
              </p>

              <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
                Find your ride
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Browse approved vehicles with pricing, ratings and availability.
              </p>
            </div>

            <button
              onClick={fetchVehicles}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-6">
            <div className="relative md:col-span-2">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-3.5 text-slate-400"
              />

              <input
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Search brand, model or vehicle"
                className="input-style pl-11"
              />
            </div>

            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="input-style"
            >
              <option value="">All types</option>
              <option value="two-wheeler">Two Wheeler</option>
              <option value="four-wheeler">Four Wheeler</option>
            </select>

            <select
              name="fuelType"
              value={filters.fuelType}
              onChange={handleChange}
              className="input-style"
            >
              <option value="">All fuel</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="cng">CNG</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <select
              name="location"
              value={filters.location}
              onChange={handleChange}
              className="input-style"
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-black text-slate-200 hover:bg-slate-700"
            >
              Reset
            </button>

            <input
              name="minPrice"
              type="number"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="Min daily"
              className="input-style"
            />

            <input
              name="maxPrice"
              type="number"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="Max daily"
              className="input-style"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-400">
            Showing {filteredVehicles.length} vehicles
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-red-900/60 bg-red-950/50 p-4 text-sm font-bold text-red-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
            Loading vehicles...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
            No vehicles found.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Vehicles;
