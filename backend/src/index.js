import app from "./app.js";
import { connectDB } from "./db.js";

// Lee el puerto del archivo .env, si no, usa 5003 por defecto.
const PORT = process.env.PORT || 5003;

async function main() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
  }
}

main();
