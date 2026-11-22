import type { Request, Response } from "express";
import { clienteService } from "../serviceContainer";

import { responderError } from "./responderError";

export function listarClientes(_req: Request, res: Response): void {
  res.status(200).json(clienteService.listar());
}

export function obtenerCliente(req: Request, res: Response): void {
  try {
    res.status(200).json(clienteService.obtenerPorId(req.params.id));
  } catch (error) {
    responderError(res, error);
  }
}

export function crearCliente(req: Request, res: Response): void {
  try {
    const cliente = clienteService.crear(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    responderError(res, error);
  }
}

export function actualizarCliente(req: Request, res: Response): void {
  try {
    res.status(200).json(clienteService.actualizar(req.params.id, req.body));
  } catch (error) {
    responderError(res, error);
  }
}

export function eliminarCliente(req: Request, res: Response): void {
  try {
    clienteService.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    responderError(res, error);
  }
}
