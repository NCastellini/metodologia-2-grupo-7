import type { Response } from "express";

// Conserva el contrato de errores existente de los controladores.
export function responderError(res: Response, error: unknown): void {
  const mensaje = error instanceof Error ? error.message : "Error inesperado";
  const noEncontrado = mensaje.includes("no encontrado");
  res.status(noEncontrado ? 404 : 400).json({ mensaje });
}
