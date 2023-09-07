export interface Result<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  direccion: string;
  token_id: number;
  token: string;
  expiracion: string;
  tiempoCaducidadRestante?: number;
}