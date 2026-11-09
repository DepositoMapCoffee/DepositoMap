/** Contrato común de todo canal de salida (correo, WhatsApp, SMS…). */
export type Mensaje = {
  para: string;
  asunto?: string;
  texto: string;
  html?: string;
};

export interface Canal {
  readonly nombre: string;
  enviar(mensaje: Mensaje): Promise<void>;
}
