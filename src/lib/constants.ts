// Cargo fijo por envío a domicilio (no aplica a "recoger en tienda").
// Usado tanto en el checkout (para mostrarlo antes de pagar) como en el
// servidor (para cobrarlo de verdad) — un solo lugar para no desincronizar.
export const CARGO_ENVIO_DOMICILIO = 6;

// Con una compra de este monto (o más) el envío a domicilio es gratis.
export const ENVIO_GRATIS_DESDE = 100;

// Cargo de envío que corresponde a una compra: gratis desde ENVIO_GRATIS_DESDE,
// y nada si el cliente recoge en tienda.
export function cargoDeEnvio(subtotal: number, domicilio: boolean): number {
  if (!domicilio) return 0;
  return subtotal >= ENVIO_GRATIS_DESDE ? 0 : CARGO_ENVIO_DOMICILIO;
}
