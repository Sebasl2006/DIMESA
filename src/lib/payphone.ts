// Cliente del "Botón de Pago" de Payphone (pago con tarjeta por
// redirección). Documentación: https://docs.payphone.app/boton-de-pago-por-redireccion
//
// Flujo: prepararPagoPayphone() crea la transacción y devuelve una URL a la
// que se redirige al cliente para que pague con su tarjeta en el formulario
// de Payphone; luego Payphone redirige de vuelta a "responseUrl" con
// ?id=...&clientTransactionId=..., y confirmarPagoPayphone() con esos datos
// dice si el pago fue aprobado. Si nuestro sistema no confirma dentro de 5
// minutos, Payphone reversa el cobro automáticamente.
const PREPARE_URL = "https://pay.payphonetodoesposible.com/api/button/Prepare";
const CONFIRM_URL = "https://pay.payphonetodoesposible.com/api/button/V2/Confirm";

function credenciales() {
  const token = process.env.PAYPHONE_TOKEN;
  const storeId = process.env.PAYPHONE_STORE_ID;
  if (!token || !storeId) {
    throw new Error("El pago con tarjeta no está configurado todavía.");
  }
  return { token, storeId };
}

interface PrepararPagoInput {
  montoCentavos: number;
  clientTransactionId: string;
  referencia: string;
  correo: string;
  responseUrl: string;
  cancellationUrl: string;
}

export async function prepararPagoPayphone(input: PrepararPagoInput): Promise<{ payWithCard: string }> {
  const { token, storeId } = credenciales();

  const res = await fetch(PREPARE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: input.montoCentavos,
      amountWithoutTax: input.montoCentavos,
      currency: "USD",
      storeId,
      clientTransactionId: input.clientTransactionId,
      reference: input.referencia,
      email: input.correo,
      responseUrl: input.responseUrl,
      cancellationUrl: input.cancellationUrl,
      lang: "es",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.payWithCard) {
    console.error("Error al preparar pago con Payphone:", data);
    throw new Error("No se pudo iniciar el pago con tarjeta. Intenta de nuevo.");
  }

  return { payWithCard: data.payWithCard as string };
}

interface ConfirmacionPagoPayphone {
  aprobado: boolean;
  montoCentavos: number;
  transactionId: number;
}

export async function confirmarPagoPayphone(id: number, clientTxId: string): Promise<ConfirmacionPagoPayphone> {
  const { token } = credenciales();

  const res = await fetch(CONFIRM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, clientTxId }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Error al confirmar pago con Payphone:", data);
    throw new Error("No se pudo confirmar el pago.");
  }

  return {
    aprobado: data.transactionStatus === "Approved",
    montoCentavos: Number(data.amount),
    transactionId: Number(data.transactionId),
  };
}
