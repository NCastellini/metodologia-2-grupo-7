import { Router } from "express";
import { listarPrestadores, obtenerPrestador, crearPrestador, actualizarPrestador, eliminarPrestador } from "../controllers/prestadorController";

const router = Router();
router.get("/", listarPrestadores);
router.get("/:id", obtenerPrestador);
router.post("/", crearPrestador);
router.put("/:id", actualizarPrestador);
router.delete("/:id", eliminarPrestador);
export default router;
