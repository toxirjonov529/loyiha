
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Ma'lumotlar saqlanadigan joy
const dataDir = path.join(__dirname, "data");
const ordersFile = path.join(dataDir, "orders.json");

// Papka va faylni avtomatik yaratish
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(ordersFile)) {
  fs.writeFileSync(ordersFile, "[]");
}

app.use(express.json());
app.use(express.static(__dirname));

// Xizmatlar
const services = [
  {
    id: 1,
    name: "Kompyuter ustasi",
    emoji: "💻",
    description: "Kompyuter ta'mirlash va sozlash"
  },
  {
    id: 2,
    name: "Santexnik",
    emoji: "🔧",
    description: "Suv quvurlari va ta'mirlash"
  },
  {
    id: 3,
    name: "Elektrik",
    emoji: "⚡",
    description: "Elektr jihozlarini ta'mirlash"
  },
  {
    id: 4,
    name: "Grafik dizayner",
    emoji: "🎨",
    description: "Logo va dizayn xizmatlari"
  },
  {
    id: 5,
    name: "Telefon ustasi",
    emoji: "📱",
    description: "Telefonlarni ta'mirlash"
  },
  {
    id: 6,
    name: "Repetitor",
    emoji: "📚",
    description: "Fanlardan qo'shimcha darslar"
  }
];

// Serverni tekshirish
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "UZ HELP server ishlayapti"
  });
});

// Xizmatlarni olish
app.get("/api/services", (req, res) => {
  res.json(services);
});

// Buyurtma yuborish
app.post("/api/orders", (req, res) => {
  const { name, phone, service } = req.body;

  if (
    typeof name !== "string" ||
    typeof phone !== "string" ||
    typeof service !== "string" ||
    !name.trim() ||
    !phone.trim() ||
    !service.trim()
  ) {
    return res.status(400).json({
      message: "Barcha maydonlarni to'ldiring!"
    });
  }

  const cleanName = name.trim();
  const cleanPhone = phone.trim();

  if (cleanName.length > 70 || cleanPhone.length > 25) {
    return res.status(400).json({
      message: "Kiritilgan ma'lumot juda uzun!"
    });
  }

  if (!/^[+0-9()\-\s]{7,25}$/.test(cleanPhone)) {
    return res.status(400).json({
      message: "Telefon raqamini to'g'ri kiriting!"
    });
  }

  const selected = services.find(
    item => item.name === service
  );

  if (!selected) {
    return res.status(400).json({
      message: "Bunday xizmat mavjud emas!"
    });
  }

  try {
    const orders = JSON.parse(
      fs.readFileSync(ordersFile, "utf8")
    );

    const newOrder = {
      id: Date.now().toString(),
      name: cleanName,
      phone: cleanPhone,
      service: selected.name,
      date: new Date().toISOString(),
      status: "Yangi"
    };

    orders.push(newOrder);

    fs.writeFileSync(
      ordersFile,
      JSON.stringify(orders, null, 2)
    );

    res.status(201).json({
      message: "Buyurtmangiz qabul qilindi!",
      order: newOrder
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Serverda xatolik yuz berdi!"
    });
  }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log("UZ HELP SERVER ISHLAYAPTI!");
  console.log(`Sayt: http://localhost:${PORT}`);
});
