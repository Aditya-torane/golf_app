require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in .env — set a strong secret and restart.");
    process.exit(1);
  }
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection failed:", err.message);
    console.error("Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME and that MySQL is running.");
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open the app at http://localhost:${PORT} (static frontend is served here)`);
  });
}

startServer();