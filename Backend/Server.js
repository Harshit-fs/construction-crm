require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const db = require("./Db");
const userRoutes = require("./Routes/User");
const brokerRoutes = require("./Routes/broker");
const customerRoutes = require("./Routes/customer");
const leadRoutes = require("./Routes/lead");
const projectRoutes = require("./Routes/Project");
const employeeRoutes = require("./Routes/employee");
const documentRoutes = require("./Routes/document");
const propertyRoutes = require("./Routes/property");
const paymentRoutes = require("./Routes/payment");
const followupRoutes = require("./Routes/followup");
const reportRoutes = require("./Routes/reports");
const dashboardRoutes = require("./Routes/dashboard");
const rolePermissionRoutes = require("./Routes/rolePermission");
const inventoryRoutes = require("./Routes/inventory");
const notificationRoutes = require("./Routes/notifications");

const app = express();

// Trust reverse proxy (Render / Cloudflare / Vercel)
app.set("trust proxy", 1);

// Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: false // Allows frontend to load /uploads images & docs
}));

// CORS Configuration (Allows all Vercel preview & production domains)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Rate Limiter: General API Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// Rate Limiter: Login protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // 60 attempts per 15 minutes
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/User/login", loginLimiter);
app.use("/user/login", loginLimiter);

app.use(express.json());

/* ==============================
   UPLOADED DOCUMENTS
============================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==============================
   ROUTES
============================== */

app.use("/User", userRoutes);
app.use("/broker", brokerRoutes);
app.use("/customer", customerRoutes);
app.use("/lead", leadRoutes);
app.use("/project", projectRoutes);
app.use("/employee", employeeRoutes);
app.use("/property", propertyRoutes);
app.use("/payment", paymentRoutes);
app.use("/document", documentRoutes);
app.use("/followup", followupRoutes);
app.use("/reports", reportRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/rolepermission", rolePermissionRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/notifications", notificationRoutes);

/* ==============================
   PORT
============================== */

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Construction CRM Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
