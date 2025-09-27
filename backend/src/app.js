import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json()); // <-- ¡ERROR #1 ARREGLADO! Ahora el servidor puede leer JSON.

// Rutas
// ¡ERROR #2 ARREGLADO! Ahora el servidor sabe que las rutas empiezan con /api
app.use("/api", authRoutes); 

export default app;
 