import prestadoresIniciales from "./data/prestadores.json";
import { ClienteService } from "./services/ClienteService";
import { PrestadorService } from "./services/PrestadorService";
import { VisitaService } from "./services/VisitaService";
import type { Prestador } from "./models/Prestador";

// En esta etapa los servicios guardan los datos en memoria.
export const clienteService = new ClienteService();
export const prestadorService = new PrestadorService();
export const visitaService = new VisitaService(clienteService, prestadorService);

// Se cargan los prestadores de prueba una sola vez al iniciar la aplicación.
for (const prestador of prestadoresIniciales as Prestador[]) {
  prestadorService.cargarInicial(prestador);
}
