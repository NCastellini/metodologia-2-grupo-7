import type { Request, Response } from "express";
import { prestadorService } from "../serviceContainer";
import type { FiltroPrestadores } from "../services/PrestadorService";

function responderError(res: Response, error: unknown): void {
  const mensaje = error instanceof Error ? error.message : "Error inesperado";
  const noEncontrado = mensaje.includes("no encontrado");
  res.status(noEncontrado ? 404 : 400).json({ mensaje });
}

function leerNumero(query: unknown, nombre: string): number | undefined {
  if (query === undefined) return undefined;
  if (typeof query !== "string" || query.trim() === "") {
    throw new Error(`El filtro ${nombre} debe ser numérico`);
  }
  const valor = Number(query);
  if (!Number.isFinite(valor)) throw new Error(`El filtro ${nombre} debe ser numérico`);
  return valor;
}

export function listarPrestadores(req: Request, res: Response): void {
  try {
    const ordenarPor = req.query.ordenarPor;
    const orden = req.query.orden;
    const criteriosValidos = ["calificacion", "servicios", "precio", "cercania"];

    if (ordenarPor !== undefined && (typeof ordenarPor !== "string" || !criteriosValidos.includes(ordenarPor))) {
      res.status(400).json({ mensaje: "ordenarPor debe ser calificacion, servicios, precio o cercania" });
      return;
    }
    if (orden !== undefined && orden !== "asc" && orden !== "desc") {
      res.status(400).json({ mensaje: "orden debe ser asc o desc" });
      return;
    }

    const filtro: FiltroPrestadores = {
      servicios: typeof req.query.servicios === "string" ? req.query.servicios : undefined,
      calificacionMinima: leerNumero(req.query.calificacionMinima, "calificacionMinima"),
      calificacionMaxima: leerNumero(req.query.calificacionMaxima, "calificacionMaxima"),
      ordenarPor: ordenarPor as FiltroPrestadores["ordenarPor"],
      orden: orden as FiltroPrestadores["orden"],
    };

    if (
      filtro.calificacionMinima !== undefined &&
      (filtro.calificacionMinima < 0 || filtro.calificacionMinima > 5)
    ) {
      res.status(400).json({ mensaje: "calificacionMinima debe estar entre 0 y 5" });
      return;
    }
    if (
      filtro.calificacionMaxima !== undefined &&
      (filtro.calificacionMaxima < 0 || filtro.calificacionMaxima > 5)
    ) {
      res.status(400).json({ mensaje: "calificacionMaxima debe estar entre 0 y 5" });
      return;
    }

    res.status(200).json(prestadorService.filtrar(filtro));
  } catch (error) {
    responderError(res, error);
  }
}

export function obtenerPrestador(req: Request, res: Response): void {
  try {
    res.status(200).json(prestadorService.obtenerPorId(req.params.id));
  } catch (error) {
    responderError(res, error);
  }
}

export function crearPrestador(req: Request, res: Response): void {
  try {
    const prestador = prestadorService.crear(req.body);
    res.status(201).json(prestador);
  } catch (error) {
    responderError(res, error);
  }
}

export function actualizarPrestador(req: Request, res: Response): void {
  try {
    res.status(200).json(prestadorService.actualizar(req.params.id, req.body));
  } catch (error) {
    responderError(res, error);
  }
}

export function eliminarPrestador(req: Request, res: Response): void {
  try {
    prestadorService.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    responderError(res, error);
  }
}
