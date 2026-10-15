import { Router } from "express";
import { listarVisitas, obtenerVisita, crearVisita, actualizarVisita, eliminarVisita } from "../controllers/visitaController";

const router = Router();
router.get("/", listarVisitas);
router.get("/:id", obtenerVisita);
router.post("/", crearVisita);
router.put("/:id", actualizarVisita);
router.delete("/:id", eliminarVisita);
export default router;
