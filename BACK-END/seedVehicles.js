const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");
const Vehicle = require("./models/Vehicle");

dotenv.config();

const API_KEY = process.env.PEXELS_API_KEY;

const fallbackImages = {
  scooter: "https://images.pexels.com/photos/2549941/pexels-photo-2549941.jpeg",
  motorcycle:
    "https://images.pexels.com/photos/2519374/pexels-photo-2519374.jpeg",
  car: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
  suv: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
  electric: "https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg",
};

const fetchPexelsPhoto = async (query, fallbackType = "car") => {
  try {
    if (!API_KEY) {
      return fallbackImages[fallbackType] || fallbackImages.car;
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query,
    )}&per_page=1&orientation=landscape`;

    const res = await fetch(url, {
      headers: {
        Authorization: API_KEY,
      },
    });

    if (!res.ok) {
      return fallbackImages[fallbackType] || fallbackImages.car;
    }

    const data = await res.json();

    return (
      data.photos?.[0]?.src?.large2x ||
      data.photos?.[0]?.src?.large ||
      fallbackImages[fallbackType] ||
      fallbackImages.car
    );
  } catch (error) {
    console.log("Pexels image fetch failed:", query);
    return fallbackImages[fallbackType] || fallbackImages.car;
  }
};

const vehicleCatalog = [
  {
    vehicleName: "Honda Activa 6G",
    brand: "Honda",
    model: "Activa 6G",
    variant: "DLX",
    modelYear: 2022,
    type: "two-wheeler",
    bodyType: "scooter",
    fuelType: "petrol",
    transmission: "automatic",
    priceDaily: 450,
    priceWeekly: 2800,
    priceMonthly: 9500,
    depositAmount: 1500,
    location: "Bhubaneswar",
    city: "Bhubaneswar",
    imageQuery: "Honda Activa scooter",
    imageFallback: "scooter",
    description:
      "Reliable city scooter for daily commute, college travel and short rentals.",
    specs: {
      engineCC: 109,
      mileageKmpl: 45,
      seatingCapacity: 2,
      color: "Pearl White",
      power: "7.7 bhp",
      torque: "8.9 Nm",
      abs: false,
      features: ["Self start", "LED headlamp", "External fuel filler"],
    },
  },
  {
    vehicleName: "TVS Jupiter",
    brand: "TVS",
    model: "Jupiter",
    variant: "ZX",
    modelYear: 2023,
    type: "two-wheeler",
    bodyType: "scooter",
    fuelType: "petrol",
    transmission: "automatic",
    priceDaily: 430,
    priceWeekly: 2700,
    priceMonthly: 9000,
    depositAmount: 1500,
    location: "Cuttack",
    city: "Cuttack",
    imageQuery: "TVS Jupiter scooter",
    imageFallback: "scooter",
    description:
      "Comfortable scooter with good mileage and easy handling for city rides.",
    specs: {
      engineCC: 110,
      mileageKmpl: 48,
      seatingCapacity: 2,
      color: "Grey",
      power: "7.8 bhp",
      torque: "8.8 Nm",
      abs: false,
      features: ["USB charging", "Large under-seat storage", "Economy mode"],
    },
  },
  {
    vehicleName: "Ola S1 Pro",
    brand: "Ola Electric",
    model: "S1 Pro",
    variant: "Gen 2",
    modelYear: 2024,
    type: "two-wheeler",
    bodyType: "electric-scooter",
    fuelType: "electric",
    transmission: "automatic",
    priceDaily: 650,
    priceWeekly: 3900,
    priceMonthly: 12500,
    depositAmount: 2500,
    location: "Bhubaneswar",
    city: "Bhubaneswar",
    imageQuery: "electric scooter",
    imageFallback: "electric",
    description:
      "Modern electric scooter with smooth acceleration and low running cost.",
    specs: {
      batteryRangeKm: 170,
      seatingCapacity: 2,
      color: "Matte Black",
      power: "11 kW peak",
      topSpeed: "120 km/h",
      abs: false,
      features: ["Touchscreen display", "Reverse mode", "Fast charging"],
    },
  },
  {
    vehicleName: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    model: "Classic 350",
    variant: "Signals",
    modelYear: 2022,
    type: "two-wheeler",
    bodyType: "motorcycle",
    fuelType: "petrol",
    transmission: "manual",
    priceDaily: 850,
    priceWeekly: 5200,
    priceMonthly: 16500,
    depositAmount: 3500,
    location: "Puri",
    city: "Puri",
    imageQuery: "Royal Enfield motorcycle",
    imageFallback: "motorcycle",
    description:
      "Cruiser motorcycle for weekend trips, highway rides and premium rentals.",
    specs: {
      engineCC: 349,
      mileageKmpl: 35,
      seatingCapacity: 2,
      color: "Stealth Black",
      power: "20.2 bhp",
      torque: "27 Nm",
      abs: true,
      features: ["Dual channel ABS", "Touring seat", "Classic cruiser stance"],
    },
  },
  {
    vehicleName: "Yamaha MT-15",
    brand: "Yamaha",
    model: "MT-15",
    variant: "V2",
    modelYear: 2023,
    type: "two-wheeler",
    bodyType: "motorcycle",
    fuelType: "petrol",
    transmission: "manual",
    priceDaily: 780,
    priceWeekly: 4800,
    priceMonthly: 15000,
    depositAmount: 3000,
    location: "Bhubaneswar",
    city: "Bhubaneswar",
    imageQuery: "Yamaha street bike",
    imageFallback: "motorcycle",
    description:
      "Sporty street motorcycle for riders who want performance and style.",
    specs: {
      engineCC: 155,
      mileageKmpl: 45,
      seatingCapacity: 2,
      color: "Racing Blue",
      power: "18.4 bhp",
      torque: "14.1 Nm",
      abs: true,
      features: ["Assist clutch", "LED projector", "Sporty riding posture"],
    },
  },
  {
    vehicleName: "Maruti Suzuki Swift",
    brand: "Maruti Suzuki",
    model: "Swift",
    variant: "ZXI",
    modelYear: 2024,
    type: "four-wheeler",
    bodyType: "hatchback",
    fuelType: "petrol",
    transmission: "manual",
    priceDaily: 1600,
    priceWeekly: 9800,
    priceMonthly: 32000,
    depositAmount: 6000,
    location: "Bhubaneswar",
    city: "Bhubaneswar",
    imageQuery: "Maruti Swift hatchback car",
    imageFallback: "car",
    description:
      "Compact hatchback with easy city handling and good fuel efficiency.",
    specs: {
      engineCC: 1197,
      mileageKmpl: 22,
      seatingCapacity: 5,
      color: "Red",
      power: "80 bhp",
      torque: "112 Nm",
      airbags: 6,
      abs: true,
      bootSpace: "265 L",
      features: ["Touchscreen", "Rear parking sensors", "Bluetooth audio"],
    },
  },
  {
    vehicleName: "Hyundai i20",
    brand: "Hyundai",
    model: "i20",
    variant: "Sportz",
    modelYear: 2023,
    type: "four-wheeler",
    bodyType: "hatchback",
    fuelType: "petrol",
    transmission: "manual",
    priceDaily: 1750,
    priceWeekly: 10500,
    priceMonthly: 34500,
    depositAmount: 7000,
    location: "Cuttack",
    city: "Cuttack",
    imageQuery: "Hyundai i20 car",
    imageFallback: "car",
    description:
      "Premium hatchback for city rides, short trips and comfortable daily use.",
    specs: {
      engineCC: 1197,
      mileageKmpl: 20,
      seatingCapacity: 5,
      color: "White",
      power: "82 bhp",
      torque: "115 Nm",
      airbags: 6,
      abs: true,
      bootSpace: "311 L",
      features: ["Touchscreen", "Rear camera", "Wireless phone connectivity"],
    },
  },
  {
    vehicleName: "Honda City",
    brand: "Honda",
    model: "City",
    variant: "VX",
    modelYear: 2022,
    type: "four-wheeler",
    bodyType: "sedan",
    fuelType: "petrol",
    transmission: "manual",
    priceDaily: 2400,
    priceWeekly: 14500,
    priceMonthly: 47000,
    depositAmount: 10000,
    location: "Bhubaneswar",
    city: "Bhubaneswar",
    imageQuery: "Honda City sedan",
    imageFallback: "car",
    description:
      "Comfortable sedan for business travel, family rides and long routes.",
    specs: {
      engineCC: 1498,
      mileageKmpl: 17,
      seatingCapacity: 5,
      color: "Silver",
      power: "119 bhp",
      torque: "145 Nm",
      airbags: 6,
      abs: true,
      bootSpace: "506 L",
      features: ["Cruise control", "Sunroof", "Rear camera"],
    },
  },
  {
    vehicleName: "Hyundai Creta",
    brand: "Hyundai",
    model: "Creta",
    variant: "SX",
    modelYear: 2024,
    type: "four-wheeler",
    bodyType: "suv",
    fuelType: "petrol",
    transmission: "automatic",
    priceDaily: 3200,
    priceWeekly: 19500,
    priceMonthly: 62000,
    depositAmount: 15000,
    location: "Bhubaneswar",
    city: "Bhubaneswar",
    imageQuery: "Hyundai Creta SUV",
    imageFallback: "suv",
    description:
      "Feature-rich compact SUV for family trips, business rides and touring.",
    specs: {
      engineCC: 1497,
      mileageKmpl: 17,
      seatingCapacity: 5,
      color: "Black",
      power: "113 bhp",
      torque: "144 Nm",
      airbags: 6,
      abs: true,
      bootSpace: "433 L",
      groundClearance: "190 mm",
      features: ["Panoramic sunroof", "ADAS", "Automatic climate control"],
    },
  },
  {
    vehicleName: "Kia Seltos",
    brand: "Kia",
    model: "Seltos",
    variant: "HTX",
    modelYear: 2025,
    type: "four-wheeler",
    bodyType: "suv",
    fuelType: "petrol",
    transmission: "automatic",
    priceDaily: 3400,
    priceWeekly: 20500,
    priceMonthly: 65000,
    depositAmount: 16000,
    location: "Puri",
    city: "Puri",
    imageQuery: "Kia Seltos SUV",
    imageFallback: "suv",
    description:
      "Premium SUV with strong road presence and comfortable cabin features.",
    specs: {
      engineCC: 1497,
      mileageKmpl: 17,
      seatingCapacity: 5,
      color: "Gravity Grey",
      power: "113 bhp",
      torque: "144 Nm",
      airbags: 6,
      abs: true,
      bootSpace: "433 L",
      groundClearance: "190 mm",
      features: ["Ventilated seats", "Connected car tech", "Touchscreen"],
    },
  },
  {
    vehicleName: "Tata Nexon EV",
    brand: "Tata",
    model: "Nexon EV",
    variant: "Empowered",
    modelYear: 2024,
    type: "four-wheeler",
    bodyType: "electric-car",
    fuelType: "electric",
    transmission: "automatic",
    priceDaily: 3600,
    priceWeekly: 21500,
    priceMonthly: 69000,
    depositAmount: 18000,
    location: "Bhubaneswar",
    city: "Bhubaneswar",
    imageQuery: "electric SUV car",
    imageFallback: "electric",
    description:
      "Electric compact SUV with silent drive, low running cost and modern tech.",
    specs: {
      batteryRangeKm: 390,
      seatingCapacity: 5,
      color: "Teal Blue",
      power: "142 bhp",
      torque: "215 Nm",
      airbags: 6,
      abs: true,
      bootSpace: "350 L",
      features: ["Fast charging", "Drive modes", "Connected car features"],
    },
  },
  {
    vehicleName: "Toyota Innova Hycross",
    brand: "Toyota",
    model: "Innova Hycross",
    variant: "VX Hybrid",
    modelYear: 2025,
    type: "four-wheeler",
    bodyType: "mpv",
    fuelType: "hybrid",
    transmission: "automatic",
    priceDaily: 4500,
    priceWeekly: 27000,
    priceMonthly: 85000,
    depositAmount: 22000,
    location: "Cuttack",
    city: "Cuttack",
    imageQuery: "Toyota Innova MPV",
    imageFallback: "suv",
    description:
      "Spacious MPV for family trips, airport transfers and group travel.",
    specs: {
      engineCC: 1987,
      mileageKmpl: 21,
      seatingCapacity: 7,
      color: "White",
      power: "183 bhp",
      torque: "188 Nm",
      airbags: 6,
      abs: true,
      bootSpace: "300 L",
      features: ["Captain seats", "Hybrid system", "Rear AC vents"],
    },
  },
  {
    vehicleName: "Mahindra XUV700",
    brand: "Mahindra",
    model: "XUV700",
    variant: "AX7",
    modelYear: 2026,
    type: "four-wheeler",
    bodyType: "suv",
    fuelType: "diesel",
    transmission: "automatic",
    priceDaily: 4800,
    priceWeekly: 28500,
    priceMonthly: 90000,
    depositAmount: 25000,
    location: "Bhubaneswar",
    city: "Bhubaneswar",
    imageQuery: "Mahindra SUV car",
    imageFallback: "suv",
    description:
      "Powerful premium SUV for long-distance trips, large families and touring.",
    specs: {
      engineCC: 2198,
      mileageKmpl: 15,
      seatingCapacity: 7,
      color: "Midnight Black",
      power: "182 bhp",
      torque: "450 Nm",
      airbags: 7,
      abs: true,
      groundClearance: "200 mm",
      features: ["ADAS", "Panoramic sunroof", "Premium sound system"],
    },
  },
  {
    vehicleName: "Toyota Fortuner",
    brand: "Toyota",
    model: "Fortuner",
    variant: "4x2 AT",
    modelYear: 2026,
    type: "four-wheeler",
    bodyType: "suv",
    fuelType: "diesel",
    transmission: "automatic",
    priceDaily: 6200,
    priceWeekly: 37000,
    priceMonthly: 115000,
    depositAmount: 35000,
    location: "Puri",
    city: "Puri",
    imageQuery: "Toyota Fortuner SUV",
    imageFallback: "suv",
    description:
      "Luxury SUV for premium rentals, highway touring and executive travel.",
    specs: {
      engineCC: 2755,
      mileageKmpl: 12,
      seatingCapacity: 7,
      color: "Pearl White",
      power: "201 bhp",
      torque: "500 Nm",
      airbags: 7,
      abs: true,
      groundClearance: "225 mm",
      features: ["4x2 automatic", "Leather seats", "Premium road presence"],
    },
  },
];

const createOwner = async () => {
  const email = "seedowner@rento.com";
  const existingOwner = await User.findOne({ email });

  if (existingOwner) {
    return existingOwner;
  }

  const hashedPassword = await bcrypt.hash("owner123", 10);

  return await User.create({
    name: "Rento Seed Owner",
    email,
    password: hashedPassword,
    role: "owner",
    phone: "9999999999",
    isActive: true,
  });
};

const seedVehicles = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected:", mongoose.connection.name);

    const owner = await createOwner();

    console.log("Seed owner:", owner.email);

    await Vehicle.deleteMany({
      owner: owner._id,
      vehicleNumber: /^SEED-/,
    });

    const vehiclesToInsert = [];

    for (let index = 0; index < vehicleCatalog.length; index++) {
      const item = vehicleCatalog[index];

      const imageUrl = await fetchPexelsPhoto(
        item.imageQuery,
        item.imageFallback,
      );

      vehiclesToInsert.push({
        owner: owner._id,
        vehicleNumber: `SEED-${item.modelYear}-${String(index + 1).padStart(
          3,
          "0",
        )}`,
        vehicleName: item.vehicleName,
        brand: item.brand,
        model: item.model,
        variant: item.variant,
        modelYear: item.modelYear,
        type: item.type,
        bodyType: item.bodyType,
        fuelType: item.fuelType,
        transmission: item.transmission,
        priceDaily: item.priceDaily,
        priceWeekly: item.priceWeekly,
        priceMonthly: item.priceMonthly,
        depositAmount: item.depositAmount,
        location: item.location,
        city: item.city,
        description: item.description,
        images: [imageUrl],
        specs: item.specs,
        status: "available",
        approvalStatus: "approved",
      });

      console.log(`Prepared ${item.vehicleName}`);
    }

    await Vehicle.insertMany(vehiclesToInsert);

    console.log(`Seeded ${vehiclesToInsert.length} vehicles successfully.`);
    console.log("Owner login:");
    console.log("Email: seedowner@rento.com");
    console.log("Password: owner123");

    process.exit(0);
  } catch (error) {
    console.error("Vehicle seed failed:", error);
    process.exit(1);
  }
};

seedVehicles();
