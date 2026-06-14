import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bike, Car, Fuel, IndianRupee, MapPin, Star } from "lucide-react";
import { formatPrice } from "../utils/formatters";

function VehicleCard({
  vehicle,
  isOwnerView = false,
  onUpdateStatus,
  onDelete,
  onEdit,
}) {
  const vehicleId = vehicle?._id || vehicle?.id;
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = Array.isArray(vehicle?.images)
    ? vehicle.images.find(Boolean)
    : vehicle?.images;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const statusColors = {
    available: "border-emerald-900/60 bg-emerald-950/50 text-emerald-300",
    maintenance: "border-amber-900/60 bg-amber-950/50 text-amber-300",
    inactive: "border-red-900/60 bg-red-950/50 text-red-300",
  };

  const statusClass =
    statusColors[vehicle?.status] ??
    "border-slate-700 bg-slate-800 text-slate-300";

  const fallbackIcon =
    vehicle?.type === "two-wheeler" ? (
      <Bike size={72} className="text-blue-300" />
    ) : (
      <Car size={72} className="text-purple-300" />
    );

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-blue-800/70">
      <div className="mb-5 flex h-44 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={vehicle?.vehicleName || "Vehicle"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          fallbackIcon
        )}
      </div>

      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white">
            {vehicle?.vehicleName || "Vehicle"}
          </h3>

          <p className="text-sm text-slate-400">
            {vehicle?.brand || "Brand"} {vehicle?.model || ""}{" "}
            {vehicle?.modelYear ? `• ${vehicle.modelYear}` : ""}
          </p>

          {isOwnerView && vehicle?.vehicleNumber && (
            <p className="mt-0.5 text-sm text-slate-500">
              {vehicle.vehicleNumber}
            </p>
          )}
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${statusClass}`}
        >
          {vehicle?.status || "available"}
        </span>
      </div>

      <div className="mb-5 space-y-3 text-sm text-slate-300">
        <p className="flex items-center gap-2">
          <MapPin size={17} className="text-blue-300" />
          {vehicle?.location || "Location not added"}
        </p>

        <p className="flex items-center gap-2 capitalize">
          <Fuel size={17} className="text-purple-300" />
          {vehicle?.fuelType || "fuel"} • {vehicle?.transmission || "manual"}
        </p>

        <p className="flex items-center gap-2">
          <IndianRupee size={17} className="text-emerald-300" />
          <span className="font-black text-white">
            {formatPrice(vehicle?.priceDaily)}
          </span>
          <span>/ day</span>
        </p>

        <p className="flex items-center gap-2">
          <Star size={17} className="fill-amber-400 text-amber-400" />
          {vehicle?.averageRating || 0} ({vehicle?.reviewCount || 0} reviews)
        </p>
      </div>

      {isOwnerView && (
        <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          <p>
            Approval:{" "}
            <span className="font-black capitalize">
              {vehicle?.approvalStatus || "pending"}
            </span>
          </p>

          {vehicle?.rejectionReason && (
            <p className="mt-1 text-red-300">
              Reason: {vehicle.rejectionReason}
            </p>
          )}
        </div>
      )}

      {isOwnerView ? (
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <button
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-500"
              onClick={() => onEdit(vehicle)}
            >
              Edit
            </button>
          )}

          <button
            className="rounded-2xl bg-emerald-950/60 px-4 py-2 text-sm font-black text-emerald-300 hover:bg-emerald-950"
            onClick={() => onUpdateStatus?.(vehicleId, "available")}
          >
            Available
          </button>

          <button
            className="rounded-2xl bg-amber-950/60 px-4 py-2 text-sm font-black text-amber-300 hover:bg-amber-950"
            onClick={() => onUpdateStatus?.(vehicleId, "maintenance")}
          >
            Maintenance
          </button>

          <button
            className="rounded-2xl bg-red-950/60 px-4 py-2 text-sm font-black text-red-300 hover:bg-red-950"
            onClick={() => onDelete?.(vehicleId)}
          >
            Delete
          </button>
        </div>
      ) : vehicleId ? (
        <Link
          to={`/vehicles/${vehicleId}`}
          className="btn-primary block text-center"
        >
          View Details
        </Link>
      ) : (
        <button
          disabled
          className="w-full rounded-2xl bg-slate-800 px-4 py-3 font-bold text-slate-400"
        >
          Invalid Vehicle
        </button>
      )}
    </div>
  );
}

export default VehicleCard;
