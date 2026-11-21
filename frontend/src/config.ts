// URL del backend. Se toma de VITE_API_URL (archivo frontend/.env)
// y, si no está definida, se usa el puerto por defecto del backend.
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
