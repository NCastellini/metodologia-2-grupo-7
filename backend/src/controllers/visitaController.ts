import type { Request, Response } from "express";
import { visitaService } from "../serviceContainer";
import type { FiltroVisitas } from "../services/VisitaService";
import { EstadoVisita } from "../models/Visita";

function responderError(res: Response, error: unknown): void {
  const mensaje = error instanceof Error ? error.message : "Error inesperado";
  const noEncontrado = mensaje.includes("no encontrado");
  res.status(noEncontrado ? 404 : 400).json({ mensaje });
}

export function listarVisitas(req: Request, res: Response): void {
  const estado = req.query.estado;
  const estadosValidos = Object.values(EstadoVisita);
  if (estado !== undefined && (typeof estado !== "string" || !estadosValidos.includes(estado as EstadoVisita))) {
    res.status(400).json({ mensaje: `estado debe ser uno de: ${estadosValidos.join(", ")}` });
    return;
  }

  const filtro: FiltroVisitas = {
    clienteId: typeof req.query.clienteId === "string" ? req.query.clienteId : undefined,
    prestadorId: typeof req.query.prestadorId === "string" ? req.query.prestadorId : undefined,
    fecha: typeof req.query.fecha === "string" ? req.query.fecha : undefined,
    estado: estado as EstadoVisita | undefined,
  };
  res.status(200).json(visitaService.listar(filtro));
}

export function obtenerVisita(req: Request, res: Response): void {
  try {
    res.status(200).json(visitaService.obtenerDetallado(req.params.id));
  } catch (error) {
    responderError(res, error);
  }
}

export function crearVisita(req: Request, res: Response): void {
  try {
    const visita = visitaService.crear(req.body);
    res.status(201).json(visitaService.obtenerDetallado(visita.id));
  } catch (error) {
    responderError(res, error);
  }
}

export function actualizarVisita(req: Request, res: Response): void {
  try {
    const visita = visitaService.actualizar(req.params.id, req.body);
    res.status(200).json(visitaService.obtenerDetallado(visita.id));
  } catch (error) {
    responderError(res, error);
  }
}

export function eliminarVisita(req: Request, res: Response): void {
  try {
    visitaService.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    responderError(res, error);
  }
}
