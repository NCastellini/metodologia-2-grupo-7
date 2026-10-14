import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import clienteRoutes from "./routes/clienteRoutes";
import prestadorRoutes from "./routes/prestadorRoutes";
import visitaRoutes from "./routes/visitaRoutes";

// Permite ejecutar desde backend o desde la raíz del repositorio.
dotenv.config();
dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "API Proyecto Integrador funcionando" });
});

app.use("/api/clientes", clienteRoutes);
app.use("/api/prestadores", prestadorRoutes);
app.use("/api/visitas", visitaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
